'use client';

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '@/firebase';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Check if messaging is available
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      // Save token to user document
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        deviceTokens: arrayUnion(token),
      });

      console.log('FCM token saved:', token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Setup foreground message listener
 */
export function setupForegroundMessageListener(
  callback: (payload: any) => void
) {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show notification
    if (payload.notification) {
      new Notification(payload.notification.title || 'New Notification', {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        data: payload.data,
      });
    }

    callback(payload);
  });
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

