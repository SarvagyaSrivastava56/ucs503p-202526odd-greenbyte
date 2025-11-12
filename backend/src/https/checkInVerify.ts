import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface CheckInRequest {
  eventId: string;
  userId: string;
  qrPayload: string;
}

/**
 * HTTPS callable function to verify QR codes and check-in users to events.
 * Idempotent - can be called multiple times without duplicating check-ins.
 */
export const checkInVerify = functions.https.onCall(async (data: CheckInRequest, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to verify check-ins'
    );
  }

  const { eventId, userId, qrPayload } = data;

  if (!eventId || !userId || !qrPayload) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: eventId, userId, qrPayload'
    );
  }

  const db = admin.firestore();

  try {
    // Verify caller has permission (event admin or super admin)
    const callerUid = context.auth.uid;
    const callerDoc = await db.collection('users').doc(callerUid).get();
    
    if (!callerDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const callerData = callerDoc.data()!;
    const eventDoc = await db.collection('events').doc(eventId).get();

    if (!eventDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Event not found');
    }

    const eventData = eventDoc.data()!;
    const societyId = eventData.societyId;

    // Check permissions
    const isSuperAdmin = callerData.role === 'super_admin';
    const isSocietyAdmin = callerData.role === 'society_admin';
    
    if (!isSuperAdmin && !isSocietyAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only society admins can verify check-ins'
      );
    }

    // If society admin, verify they admin this event's society
    if (isSocietyAdmin && !isSuperAdmin) {
      const societyDoc = await db.collection('societies').doc(societyId).get();
      if (!societyDoc.exists || !societyDoc.data()!.admins.includes(callerUid)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to check-in users for this event'
        );
      }
    }

    // Get RSVP document
    const rsvpRef = db.collection('events').doc(eventId).collection('rsvps').doc(userId);
    const rsvpDoc = await rsvpRef.get();

    if (!rsvpDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User does not have an RSVP for this event'
      );
    }

    const rsvpData = rsvpDoc.data()!;

    // Parse and validate QR payload
    let parsed: any;
    try {
      parsed = JSON.parse(qrPayload);
    } catch (e) {
      throw new functions.https.HttpsError('invalid-argument', 'QR payload is not valid JSON');
    }

    if (!parsed || parsed.eventId !== eventId || parsed.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'QR code does not match this user or event');
    }

    if (!rsvpData.qrPayload || rsvpData.qrPayload !== qrPayload) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid or outdated QR code');
    }

    // Check if already checked in (idempotent)
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

    console.log(`User ${userId} checked in to event ${eventId}`);

    return {
      success: true,
      alreadyCheckedIn: false,
      checkInAt: checkInTime.toDate().toISOString(),
      message: 'Check-in successful',
    };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Check-in verification failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify check-in'
    );
  }
});

