'use client';
import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';

export function PushNotifications() {
  const { messaging } = useFirebase();
  const { toast } = useToast();
  const { notificationsEnabled } = useAppContext();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging && notificationsEnabled) {
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY });
            if (currentToken) {
              console.log('FCM Token:', currentToken);
              // Here you would typically send this token to your server to store it.
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          } else {
            console.log('Unable to get permission to notify.');
          }
        } catch (error) {
          console.error('An error occurred while requesting permission:', error);
        }
      };

      requestPermission();
    }
  }, [messaging, notificationsEnabled]);

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      });
      return () => unsubscribe();
    }
  }, [messaging, toast]);

  return null;
}
