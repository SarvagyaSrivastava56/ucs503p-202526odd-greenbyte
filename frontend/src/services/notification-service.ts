/**
 * Notification Service - Handle push notifications for events
 */

import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  topic?: string;
  tokens?: string[];
}

/**
 * Queue a notification to be sent by Cloud Functions
 * Cloud Functions will actually send the FCM notification
 */
export async function queueNotification(payload: NotificationPayload): Promise<void> {
  try {
    await addDoc(collection(firestore, 'notifications'), {
      ...payload,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    console.log('Notification queued successfully');
  } catch (error) {
    console.error('Error queuing notification:', error);
    throw error;
  }
}

/**
 * Notify all users about a new event
 */
export async function notifyNewEvent(event: {
  id: string;
  title: string;
  startAt: string;
  category: string;
}): Promise<void> {
  // Get all users with notification tokens
  const usersRef = collection(firestore, 'users');
  const usersSnapshot = await getDocs(usersRef);
  
  const tokens: string[] = [];
  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    if (userData.deviceTokens && Array.isArray(userData.deviceTokens)) {
      tokens.push(...userData.deviceTokens);
    }
  });

  if (tokens.length === 0) {
    console.log('No device tokens found');
    return;
  }

  await queueNotification({
    title: `🎉 New Event: ${event.title}`,
    body: `Check out this ${event.category} event happening soon!`,
    icon: '/icon-192x192.png',
    data: {
      eventId: event.id,
      type: 'new_event',
      url: `/events/${event.id}`,
    },
    tokens,
  });
}

/**
 * Send reminder notification for upcoming event
 */
export async function sendEventReminder(
  event: { id: string; title: string; startAt: string },
  userId: string
): Promise<void> {
  // Get user's device tokens
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('__name__', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  const userData = snapshot.docs[0].data();
  const tokens = userData.deviceTokens || [];
  
  if (tokens.length === 0) return;

  const eventDate = new Date(event.startAt);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  await queueNotification({
    title: `📅 Reminder: ${event.title}`,
    body: `Your event starts ${formattedDate}`,
    icon: '/icon-192x192.png',
    data: {
      eventId: event.id,
      type: 'event_reminder',
      url: `/events/${event.id}`,
    },
    tokens,
  });
}




