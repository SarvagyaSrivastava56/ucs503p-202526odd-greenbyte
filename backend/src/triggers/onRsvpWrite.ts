import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Triggered when an RSVP is created/updated/deleted.
 * Manages event counters and waitlist promotions.
 */
export const onRsvpWrite = functions.firestore
  .document('events/{eventId}/rsvps/{userId}')
  .onWrite(async (change, context) => {
    const { eventId } = context.params;
    const db = admin.firestore();
    const eventRef = db.collection('events').doc(eventId);

    try {
      // Run transaction to handle concurrent updates
      await db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists) {
          console.warn(`Event ${eventId} not found`);
          return;
        }

        const eventData = eventDoc.data()!;
        const capacity = eventData.capacity || 0;
        const beforeData = change.before.exists ? change.before.data() : null;
        const afterData = change.after.exists ? change.after.data() : null;

        let rsvpDelta = 0;

        // Calculate RSVP count change
        if (!beforeData && afterData) {
          // New RSVP
          if (afterData.status === 'rsvped') rsvpDelta = 1;
        } else if (beforeData && afterData) {
          // Updated RSVP
          if (beforeData.status !== 'rsvped' && afterData.status === 'rsvped') {
            rsvpDelta = 1;
          } else if (beforeData.status === 'rsvped' && afterData.status !== 'rsvped') {
            rsvpDelta = -1;
          }
        } else if (beforeData && !afterData) {
          // Deleted RSVP
          if (beforeData.status === 'rsvped') rsvpDelta = -1;
        }

        // Update event counters
        const currentRsvpCount = eventData.counters?.rsvpCount || 0;
        const newRsvpCount = Math.max(0, currentRsvpCount + rsvpDelta);

        transaction.update(eventRef, {
          'counters.rsvpCount': newRsvpCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Updated RSVP count for event ${eventId}: ${currentRsvpCount} -> ${newRsvpCount}`);

        // Handle waitlist promotions if someone cancelled
        if (rsvpDelta < 0 && capacity > 0 && newRsvpCount < capacity) {
          await promoteFromWaitlist(transaction, eventRef, eventId);
        }
      });
    } catch (error) {
      console.error(`Failed to update RSVP for event ${eventId}:`, error);
      throw error;
    }
  });

/**
 * Promotes the first waitlisted user to RSVP status
 */
async function promoteFromWaitlist(
  transaction: admin.firestore.Transaction,
  eventRef: admin.firestore.DocumentReference,
  eventId: string
) {
  const db = admin.firestore();
  
  // Find first waitlisted user
  const waitlistQuery = db
    .collection('events')
    .doc(eventId)
    .collection('rsvps')
    .where('status', '==', 'waitlisted')
    .orderBy('createdAt', 'asc')
    .limit(1);

  const waitlistSnapshot = await waitlistQuery.get();

  if (!waitlistSnapshot.empty) {
    const firstWaitlisted = waitlistSnapshot.docs[0];
    const userId = firstWaitlisted.id;

    // Promote to RSVP
    transaction.update(firstWaitlisted.ref, {
      status: 'rsvped',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Promoted user ${userId} from waitlist for event ${eventId}`);

    // TODO: Send notification to promoted user
    // This would integrate with FCM to notify the user
  }
}

