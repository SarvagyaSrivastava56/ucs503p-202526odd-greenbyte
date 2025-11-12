import * as admin from 'firebase-admin';

interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
}

/**
 * Get all active device tokens for a user
 */
export async function getUserDeviceTokens(userId: string): Promise<string[]> {
  const db = admin.firestore();
  const tokensRef = db.collection('users').doc(userId).collection('notificationTokens');
  
  try {
    const tokensSnapshot = await tokensRef
      .where('isActive', '==', true)
      .get();
    
    return tokensSnapshot.docs.map(doc => doc.data().token);
  } catch (error) {
    console.error(`Error fetching tokens for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get device tokens for multiple users
 */
export async function getUsersDeviceTokens(userIds: string[]): Promise<string[]> {
  const allTokens: string[] = [];
  
  await Promise.all(
    userIds.map(async (userId) => {
      const tokens = await getUserDeviceTokens(userId);
      allTokens.push(...tokens);
    })
  );
  
  return allTokens;
}

/**
 * Send push notification to a single user
 */
export async function sendPushNotificationToUser(
  userId: string,
  notification: NotificationOptions
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  const tokens = await getUserDeviceTokens(userId);
  
  if (tokens.length === 0) {
    return { success: true, sentCount: 0, failedCount: 0 };
  }
  
  return sendPushNotificationToTokens(tokens, notification);
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  notification: NotificationOptions
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  const tokens = await getUsersDeviceTokens(userIds);
  
  if (tokens.length === 0) {
    return { success: true, sentCount: 0, failedCount: 0 };
  }
  
  return sendPushNotificationToTokens(tokens, notification);
}

/**
 * Send push notification to device tokens
 */
export async function sendPushNotificationToTokens(
  tokens: string[],
  notification: NotificationOptions
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  if (tokens.length === 0) {
    return { success: true, sentCount: 0, failedCount: 0 };
  }

  // FCM has a limit of 500 tokens per batch
  const batchSize = 500;
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    
    const message: admin.messaging.MulticastMessage = {
      tokens: batch,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        ...notification.data,
        click_action: notification.clickAction || '/',
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: false,
          ...(notification.imageUrl && { image: notification.imageUrl }),
        },
        fcmOptions: {
          link: notification.clickAction || '/',
        },
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'event_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      totalSent += response.successCount;
      totalFailed += response.failureCount;

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && batch[idx]) {
            failedTokens.push(batch[idx]);
          }
        });
        
        await cleanupInvalidTokens(failedTokens);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      totalFailed += batch.length;
    }
  }

  return {
    success: totalFailed === 0,
    sentCount: totalSent,
    failedCount: totalFailed,
  };
}

/**
 * Clean up invalid device tokens
 */
async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;

  const db = admin.firestore();
  const batch = db.batch();
  let batchCount = 0;

  for (const token of tokens) {
    // Find the token in all users' notificationTokens subcollection
    // This is a limitation - we need to know which user owns the token
    // For now, we'll mark it as inactive when we encounter errors
    // A better approach would be to store userId with the token
    
    // Query all users to find this token (expensive, but necessary for cleanup)
    const usersSnapshot = await db.collection('users').limit(500).get();
    
    for (const userDoc of usersSnapshot.docs) {
      const tokenRef = db
        .collection('users')
        .doc(userDoc.id)
        .collection('notificationTokens')
        .doc(token);
      
      const tokenDoc = await tokenRef.get();
      if (tokenDoc.exists) {
        batch.update(tokenRef, { isActive: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        batchCount++;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`Cleaned up ${batchCount} invalid tokens`);
  }
}

/**
 * Send event notification to all users (for new events)
 */
export async function sendEventNotificationToAllUsers(
  event: admin.firestore.DocumentData,
  eventId: string,
  type: 'new_event' | 'event_updated' = 'new_event'
): Promise<void> {
  const db = admin.firestore();
  
  try {
    // Get all users who have enabled notifications
    // For now, we'll send to all users with active tokens
    // In the future, you might want to filter by interests/preferences
    
    const usersSnapshot = await db.collection('users').limit(1000).get();
    const allTokens: string[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const tokens = await getUserDeviceTokens(userDoc.id);
      allTokens.push(...tokens);
    }

    if (allTokens.length === 0) {
      console.log('No device tokens found for event notification');
      return;
    }

    const title = type === 'new_event' 
      ? `🎉 New Event: ${event.title}`
      : `📢 Event Updated: ${event.title}`;
    
    const body = type === 'new_event'
      ? `${event.description?.substring(0, 100)}...`
      : `Check out the updates for this event!`;

    await sendPushNotificationToTokens(allTokens, {
      title,
      body,
      data: {
        eventId,
        type: type === 'new_event' ? 'new_event' : 'event_updated',
      },
      imageUrl: event.bannerUrl,
      clickAction: `/events/${eventId}`,
    });

    console.log(`Sent ${type} notification to ${allTokens.length} devices`);
  } catch (error) {
    console.error(`Error sending event notification:`, error);
  }
}

/**
 * Send event reminder notification
 */
export async function sendEventReminderNotification(
  eventId: string,
  event: admin.firestore.DocumentData,
  userIds: string[],
  timeframe: string
): Promise<void> {
  const tokens = await getUsersDeviceTokens(userIds);
  
  if (tokens.length === 0) {
    console.log(`No device tokens found for event reminder ${eventId}`);
    return;
  }

  await sendPushNotificationToTokens(tokens, {
    title: `⏰ Event Reminder: ${event.title}`,
    body: `Your event "${event.title}" starts in ${timeframe}!`,
    data: {
      eventId,
      type: 'event_reminder',
      timeframe,
    },
    imageUrl: event.bannerUrl,
    clickAction: `/events/${eventId}`,
  });

  console.log(`Sent reminder notification to ${tokens.length} devices for event ${eventId}`);
}

