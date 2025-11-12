import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { executeAutomationRule } from './onAutomationRule';

// @ts-ignore - unused import needed for exports
import * as _unused from './onAutomationRule';

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
      let eventData: admin.firestore.DocumentData | undefined;
      let beforeData: admin.firestore.DocumentData | null = null;
      let afterData: admin.firestore.DocumentData | null = null;
      let rsvpDelta = 0;

      // Run transaction to handle concurrent updates
      await db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists) {
          console.warn(`Event ${eventId} not found`);
          return;
        }

        eventData = eventDoc.data()!;
        const capacity = eventData.capacity || 0;
        const tempBefore = change.before.exists ? change.before.data() : null;
        const tempAfter = change.after.exists ? change.after.data() : null;
        beforeData = tempBefore || null;
        afterData = tempAfter || null;

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

      // Execute automation rules outside transaction
      if (eventData) {
        await executeAutomationRules(db, eventId, eventData, userId, rsvpDelta);
      }
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

/**
 * Execute automation rules for RSVP events
 */
async function executeAutomationRules(
  db: admin.firestore.Firestore,
  eventId: string,
  eventData: admin.firestore.DocumentData,
  userId: string,
  rsvpDelta: number
): Promise<void> {
  try {
    const societyId = eventData.societyId;
    if (!societyId) {
      console.log('No society ID found, skipping automation rules');
      return;
    }

    // Get user data for email/notification
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`User ${userId} not found, skipping automation rules`);
      return;
    }
    const userData = userDoc.data();

    // Get all enabled automation rules for this society
    const automationsSnapshot = await db
      .collection('societies')
      .doc(societyId)
      .collection('automations')
      .where('enabled', '==', true)
      .get();

    if (automationsSnapshot.empty) {
      console.log(`No automation rules found for society ${societyId}`);
      return;
    }

    // Determine trigger type based on RSVP delta
    let triggerType: 'rsvp_created' | 'check_in' | 'capacity_reached' | null = null;
    
    if (rsvpDelta > 0) {
      triggerType = 'rsvp_created';
    }

    // Check if capacity reached
    const currentRsvpCount = eventData.counters?.rsvpCount || 0;
    const capacity = eventData.capacity || 0;
    const capacityReached = capacity > 0 && currentRsvpCount >= capacity;

    // Execute matching automation rules
    for (const ruleDoc of automationsSnapshot.docs) {
      const rule = ruleDoc.data();
      const ruleId = ruleDoc.id;

      if (triggerType === 'rsvp_created' && rule.trigger === 'rsvp_created') {
        console.log(`Executing automation rule: ${rule.name}`);
        await executeAutomationRule(
          { ...rule, id: ruleId },
          {
            eventId,
            eventData,
            userId,
            userData,
            actionType: 'rsvp_created',
          }
        );
      } else if (capacityReached && rule.trigger === 'capacity_reached') {
        console.log(`Executing automation rule: ${rule.name}`);
        await executeAutomationRule(
          { ...rule, id: ruleId },
          {
            eventId,
            eventData,
            userId,
            userData,
            actionType: 'capacity_reached',
          }
        );
      }
    }
  } catch (error) {
    console.error('Error executing automation rules:', error);
    // Don't throw - automation failures shouldn't break RSVP operations
  }
}

