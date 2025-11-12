'use client';

import { getToken, onMessage, type Messaging, type MessagePayload } from 'firebase/messaging';
import { messaging as defaultMessaging, firestore } from '@/firebase';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let serviceWorkerRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isBrowser()) return null;
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser.');
    return null;
  }

  if (!serviceWorkerRegistrationPromise) {
    serviceWorkerRegistrationPromise = navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.debug('[push] Service worker registered');
        return registration;
      })
      .catch(async (error) => {
        console.error('[push] Failed to register service worker:', error);
        try {
          const readyRegistration = await navigator.serviceWorker.ready;
          console.debug('[push] Using existing ready service worker registration');
          return readyRegistration;
        } catch (readyError) {
          console.error('[push] No ready service worker available:', readyError);
          return null;
        }
      });
  }

  return serviceWorkerRegistrationPromise;
}

/**
 * Request notification permission, register the service worker, obtain the FCM token,
 * and persist it under users/{uid}/notificationTokens/{token}.
 */
export async function requestNotificationPermission(
  userId: string,
  messagingInstance: Messaging | null = defaultMessaging
): Promise<string | null> {
  if (!isBrowser()) {
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('[push] Notifications not supported by this browser.');
    return null;
  }

  if (!messagingInstance) {
    console.warn('[push] Firebase messaging not initialised.');
    return null;
  }

  if (!VAPID_KEY) {
    console.warn('[push] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.info('[push] Notification permission declined.');
      return null;
    }

    const registration = await ensureServiceWorkerRegistration();

    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration ?? undefined,
    });

    if (!token) {
      console.warn('[push] Failed to obtain FCM token.');
      return null;
    }

    const tokenRef = doc(firestore, 'users', userId, 'notificationTokens', token);
    const existingToken = await getDoc(tokenRef);

    await setDoc(
      tokenRef,
      {
        token,
        platform: navigator.platform || 'web',
        userAgent: navigator.userAgent,
        subscribedAt: existingToken.exists() ? existingToken.data()?.subscribedAt ?? serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        isActive: true,
      },
      { merge: true }
    );

    console.debug('[push] Stored FCM token for user', userId);
    return token;
  } catch (error) {
    console.error('[push] Error while registering push notifications:', error);
    return null;
  }
}

export async function removeNotificationToken(
  userId: string,
  token: string
): Promise<void> {
  if (!isBrowser()) return;
  try {
    const tokenRef = doc(firestore, 'users', userId, 'notificationTokens', token);
    await deleteDoc(tokenRef);
    console.debug('[push] Removed FCM token for user', userId);
  } catch (error) {
    console.error('[push] Failed to remove FCM token:', error);
  }
}

/**
 * Setup foreground message listener with an optional messaging instance override.
 */
export function setupForegroundMessageListener(
  callback: (payload: MessagePayload) => void,
  messagingInstance: Messaging | null = defaultMessaging
) {
  if (!messagingInstance) {
    console.warn('[push] Cannot attach foreground listener; messaging is unavailable.');
    return () => {};
  }

  return onMessage(messagingInstance, (payload) => {
    console.debug('[push] Foreground message received', payload);
    callback(payload);
  });
}

export function areNotificationsEnabled(): boolean {
  if (!isBrowser() || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

export function getNotificationPermission(): NotificationPermission {
  if (!isBrowser() || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

