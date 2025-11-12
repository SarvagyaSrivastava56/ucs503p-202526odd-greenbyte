import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEventNotificationToAllUsers } from '../services/push-notification-service';

/**
 * Triggered when an event is created or updated.
 * Sends push notifications for new events and important updates.
 */
export const onEventWrite = functions.firestore
  .document('events/{eventId}')
  .onWrite(async (change, context) => {
    const { eventId } = context.params;
    const db = admin.firestore();
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    try {
      // Event created
      if (!beforeData && afterData) {
        // Only send notification if event is published
        if (afterData.status === 'published') {
          console.log(`New event published: ${eventId}`);
          await sendEventNotificationToAllUsers(afterData, eventId, 'new_event');
        }
        return;
      }

      // Event deleted
      if (beforeData && !afterData) {
        console.log(`Event deleted: ${eventId}`);
        return;
      }

      // Event updated
      if (beforeData && afterData) {
        // Check if event status changed to published
        if (beforeData.status !== 'published' && afterData.status === 'published') {
          console.log(`Event published: ${eventId}`);
          await sendEventNotificationToAllUsers(afterData, eventId, 'new_event');
          return;
        }

        // Check for important updates that RSVPed users should know about
        const importantChanges: string[] = [];
        
        if (beforeData.startAt !== afterData.startAt) {
          importantChanges.push('start time');
        }
        if (beforeData.venue !== afterData.venue) {
          importantChanges.push('venue');
        }
        if (beforeData.title !== afterData.title) {
          importantChanges.push('title');
        }

        // If there are important changes and event is published, notify RSVPed users
        if (importantChanges.length > 0 && afterData.status === 'published') {
          console.log(`Event ${eventId} updated: ${importantChanges.join(', ')}`);
          
          // Get all RSVPed users for this event
          const rsvpsSnapshot = await db
            .collection('events')
            .doc(eventId)
            .collection('rsvps')
            .where('status', '==', 'rsvped')
            .get();

          const userIds = rsvpsSnapshot.docs.map(doc => doc.id);
          
          if (userIds.length > 0) {
            const changeText = importantChanges.length === 1 
              ? importantChanges[0]
              : importantChanges.join(', ');

            // Send notification to RSVPed users
            const tokens: string[] = [];
            for (const userId of userIds) {
              const userTokens = await db
                .collection('users')
                .doc(userId)
                .collection('notificationTokens')
                .where('isActive', '==', true)
                .get();
              
              tokens.push(...userTokens.docs.map(doc => doc.data().token));
            }

            if (tokens.length > 0) {
              const { sendPushNotificationToTokens } = await import('../services/push-notification-service');
              
              await sendPushNotificationToTokens(tokens, {
                title: `📢 Event Updated: ${afterData.title}`,
                body: `The ${changeText} for this event has been updated. Check it out!`,
                data: {
                  eventId,
                  type: 'event_updated',
                  changes: importantChanges.join(','),
                },
                imageUrl: afterData.bannerUrl,
                clickAction: `/events/${eventId}`,
              });

              console.log(`Sent update notification to ${tokens.length} devices for event ${eventId}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to process event write for ${eventId}:`, error);
      // Don't throw - we don't want to block event creation/updates
    }
  });

