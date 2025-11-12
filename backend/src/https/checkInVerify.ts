import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface CheckInRequest {
  payload?: string; // '{"eventId":"...","userId":"..."}'
  eventId?: string;
  userId?: string;
}

/**
 * HTTPS callable function to verify QR codes and check-in users to events.
 * Non-strict version — any authenticated user can perform a check-in.
 */
export const checkInVerify = functions.https.onCall(async (data: CheckInRequest, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to verify check-ins'
    );
  }

  let eventId = data.eventId;
  let userId = data.userId;

  // Support QR payloads as JSON string
  if (!eventId || !userId) {
    if (!data.payload) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters. Provide either payload or eventId and userId.'
      );
    }
    try {
      const parsed = JSON.parse(data.payload);
      eventId = eventId || parsed.eventId;
      userId = userId || parsed.userId;
    } catch {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid JSON payload');
    }
  }

  if (!eventId || !userId) {
    throw new functions.https.HttpsError('invalid-argument', 'eventId and userId are required');
  }

  const db = admin.firestore();

  try {
    // --- Basic checks (non-strict permissions) ---
    const callerUid = context.auth.uid;

    // Ensure event exists
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Event not found');
    }

    // Ensure RSVP exists
    const rsvpRef = db.collection('events').doc(eventId).collection('rsvps').doc(userId);
    const rsvpDoc = await rsvpRef.get();

    if (!rsvpDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User does not have an RSVP for this event'
      );
    }

    const rsvpData = rsvpDoc.data()!;

    // Warn if not RSVPed (but don’t block)
    if (rsvpData.status !== 'rsvped') {
      console.warn(`⚠️ User ${userId} not RSVPed — skipping strict validation.`);
    }

    // Already checked in? (idempotent)
    if (rsvpData.checkInAt) {
      return {
        success: true,
        alreadyCheckedIn: true,
        checkInAt: rsvpData.checkInAt,
        message: 'User already checked in',
      };
    }

    // Perform check-in
    const checkInTime = admin.firestore.Timestamp.now();
    await rsvpRef.update({
      checkInAt: checkInTime,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Increment event check-in counter
    await db.collection('events').doc(eventId).update({
      'counters.checkIns': admin.firestore.FieldValue.increment(1),
    });

    console.log(`✅ User ${userId} checked in to event ${eventId} by ${callerUid}`);

    return {
      success: true,
      alreadyCheckedIn: false,
      checkInAt: checkInTime.toDate().toISOString(),
      message: 'Check-in successful',
    };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;

    console.error('❌ Check-in verification failed:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify check-in');
  }
});
