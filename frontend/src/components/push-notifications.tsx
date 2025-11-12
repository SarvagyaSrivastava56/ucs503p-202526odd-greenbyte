'use client';
import { useEffect, useRef } from 'react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import {
  requestNotificationPermission,
  setupForegroundMessageListener,
} from '@/lib/push-notifications';

export function PushNotifications() {
  const { messaging, user } = useFirebase();
  const { toast } = useToast();
  const { notificationsEnabled } = useAppContext();
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    hasRegisteredRef.current = false;
  }, [user?.uid]);

  useEffect(() => {
    if (!messaging || !user?.uid || !notificationsEnabled) {
      return;
    }

    let cancelled = false;

    const register = async () => {
      if (hasRegisteredRef.current) {
        return;
      }

      const token = await requestNotificationPermission(user.uid, messaging);
      if (!cancelled && token) {
        hasRegisteredRef.current = true;
      }
    };

    register();

    return () => {
      cancelled = true;
    };
  }, [messaging, notificationsEnabled, user?.uid]);

  useEffect(() => {
    if (messaging) {
      const unsubscribe = setupForegroundMessageListener(
        (payload) => {
          toast({
            title: payload.notification?.title ?? 'New update',
            description: payload.notification?.body ?? '',
          });
        },
        messaging
      );

      return () => unsubscribe();
    }
  }, [messaging, toast]);

  return null;
}
