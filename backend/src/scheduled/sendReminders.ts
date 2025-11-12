import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEventReminderNotification } from '../services/push-notification-service';

/**
 * Scheduled function that runs every hour to send event reminders.
 * Sends notifications 24 hours and 30 minutes before event start.
 */
export const sendReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    
    // Calculate time windows for reminders
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const ninetyMinutesFromNow = new Date(now.getTime() + 90 * 60 * 1000);

    try {
      // Find events starting in ~24 hours
      const events24h = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('startAt', '>=', twentyFourHoursFromNow.toISOString())
        .where('startAt', '<=', twentyFiveHoursFromNow.toISOString())
        .get();

      // Find events starting in ~30 minutes
      const events30m = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('startAt', '>=', thirtyMinutesFromNow.toISOString())
        .where('startAt', '<=', ninetyMinutesFromNow.toISOString())
        .get();

      console.log(`Found ${events24h.size} events for 24h reminders`);
      console.log(`Found ${events30m.size} events for 30m reminders`);

      // Send 24-hour reminders
      for (const eventDoc of events24h.docs) {
        await sendEventReminders(eventDoc.id, eventDoc.data(), '24 hours');
      }

      // Send 30-minute reminders
      for (const eventDoc of events30m.docs) {
        await sendEventReminders(eventDoc.id, eventDoc.data(), '30 minutes');
      }

      return null;
    } catch (error) {
      console.error('Failed to send reminders:', error);
      throw error;
    }
  });

/**
 * Sends FCM notifications to all RSVPed users for an event
 */
async function sendEventReminders(
  eventId: string,
  eventData: admin.firestore.DocumentData,
  timeframe: string
) {
  const db = admin.firestore();

  try {
    // Get all RSVPed users for this event
    const rsvpsSnapshot = await db
      .collection('events')
      .doc(eventId)
      .collection('rsvps')
      .where('status', '==', 'rsvped')
      .get();

    console.log(`Sending ${timeframe} reminders to ${rsvpsSnapshot.size} users for event ${eventId}`);

    const userIds = rsvpsSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
      console.log(`No RSVPed users found for event ${eventId}`);
      return;
    }

    // Use the push notification service
    await sendEventReminderNotification(eventId, eventData, userIds, timeframe);
  } catch (error) {
    console.error(`Failed to send reminders for event ${eventId}:`, error);
  }
}

