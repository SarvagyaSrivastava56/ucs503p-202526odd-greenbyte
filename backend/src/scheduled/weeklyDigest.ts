import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Scheduled function that runs weekly to send personalized event digests.
 * Runs every Monday at 9:00 AM.
 */
export const weeklyDigest = functions.pubsub
  .schedule('0 9 * * 1') // Every Monday at 9 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Get all users with interests
      const usersSnapshot = await db
        .collection('users')
        .where('interests', '!=', [])
        .get();

      console.log(`Sending weekly digest to ${usersSnapshot.size} users`);

      // Get upcoming events for the next week
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const eventsSnapshot = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('startAt', '>=', now.toISOString())
        .where('startAt', '<=', nextWeek.toISOString())
        .orderBy('startAt', 'asc')
        .limit(50)
        .get();

      const allEvents = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      console.log(`Found ${allEvents.length} upcoming events`);

      // Process each user
      const digestPromises = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const userId = userDoc.id;
        const interests = userData.interests || [];
        const deviceTokens = userData.deviceTokens || [];

        if (deviceTokens.length === 0) {
          return; // Skip users without device tokens
        }

        // Filter events matching user interests
        const matchedEvents = allEvents.filter((event) => {
          const eventCategory = event.category || '';
          const eventTags = event.tags || [];
          return (
            interests.includes(eventCategory) ||
            eventTags.some((tag: string) => interests.includes(tag))
          );
        });

        if (matchedEvents.length === 0) {
          return; // No matching events for this user
        }

        // Send digest notification
        const eventTitles = matchedEvents.slice(0, 3).map((e) => e.title).join(', ');
        const message: admin.messaging.MulticastMessage = {
          tokens: deviceTokens,
          notification: {
            title: '🎉 Your Weekly Campus Events',
            body: `${matchedEvents.length} events this week: ${eventTitles}${matchedEvents.length > 3 ? '...' : ''}`,
          },
          data: {
            type: 'weekly_digest',
            eventCount: matchedEvents.length.toString(),
          },
          android: {
            priority: 'normal',
          },
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`Sent digest to user ${userId}: ${response.successCount} successful`);
        } catch (error) {
          console.error(`Failed to send digest to user ${userId}:`, error);
        }
      });

      await Promise.all(digestPromises);
      console.log('Weekly digest completed');

      return null;
    } catch (error) {
      console.error('Failed to send weekly digest:', error);
      throw error;
    }
  });

