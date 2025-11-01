'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { requestNotificationPermission } from '@/lib/push-notifications';
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, collection, query, where, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { User } from '@/lib/types';

type AppContextType = {
  currentUser: (User & { uid: string }) | null; // Extended user with role from Firestore
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  isFavorite: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => Promise<void>;
  favorites: Set<string>;
  rsvpEvents: any[];
  favoriteEvents: any[];
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<(User & { uid: string }) | null>(null);
  const [rsvpEvents, setRsvpEvents] = useState<any[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const { user, auth } = useFirebase();

  useEffect(() => {
    const notificationsPref = localStorage.getItem('notificationsEnabled');
    if (notificationsPref) {
      setNotificationsEnabled(JSON.parse(notificationsPref));
    }
  }, []);

  // Fetch user data from Firestore when Firebase user changes
  useEffect(() => {
    if (!user) {
      setCurrentUser(null);
      setRsvpEvents([]);
      setFavoriteEvents([]);
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setCurrentUser({
          ...userData,
          uid: user.uid,
        } as User & { uid: string });
      } else {
        // If user document doesn't exist, create it with default values
        // Determine role based on email
        let role: 'student' | 'society_admin' | 'super_admin' = 'student';
        if (user.email === 'society@example.com') {
          role = 'society_admin';
        } else if (user.email?.endsWith('@admin.campus.edu')) {
          role = 'super_admin';
        } else if (user.email?.endsWith('@society.campus.edu')) {
          role = 'society_admin';
        }

        setDoc(userRef, {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          avatarUrl: user.photoURL,
          role: role,
          interests: [],
          societyIds: role === 'society_admin' ? ['society-1'] : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentUser({
          id: user.uid,
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL,
          role: role,
          interests: [],
          societyIds: role === 'society_admin' ? ['society-1'] : [],
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to favorites in real-time
  useEffect(() => {
    if (!currentUser) {
      setFavorites(new Set());
      return;
    }

    const favoritesRef = doc(firestore, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(favoritesRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const favoritesList = data?.favorites || [];
        setFavorites(new Set(favoritesList));
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to user's RSVPs in real-time
  useEffect(() => {
    if (!currentUser) {
      setRsvpEvents([]);
      return;
    }

    const rsvpsRef = collection(firestore, 'users', currentUser.uid, 'rsvps');
    const q = query(rsvpsRef, where('status', 'in', ['rsvped', 'waitlisted']));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const eventIds = snapshot.docs.map(doc => doc.id);
      
      // Fetch event details for each RSVP
      const eventPromises = eventIds.map(async (eventId) => {
        const eventRef = doc(firestore, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          return { id: eventId, ...eventSnap.data() };
        }
        return null;
      });

      const events = await Promise.all(eventPromises);
      setRsvpEvents(events.filter(e => e !== null));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to user's favorite events in real-time
  useEffect(() => {
    if (!currentUser || favorites.size === 0) {
      setFavoriteEvents([]);
      return;
    }

    const favoriteIds = Array.from(favorites);
    
    // Fetch event details for favorites
    const fetchFavoriteEvents = async () => {
      const eventPromises = favoriteIds.map(async (eventId) => {
        const eventRef = doc(firestore, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          return { id: eventId, ...eventSnap.data() };
        }
        return null;
      });

      const events = await Promise.all(eventPromises);
      setFavoriteEvents(events.filter(e => e !== null));
    };

    fetchFavoriteEvents();
  }, [currentUser, favorites]);

  const toggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    
    if (newStatus && currentUser) {
      // Request permission and get FCM token
      await requestNotificationPermission(currentUser.uid);
    }
    
    setNotificationsEnabled(newStatus);
    localStorage.setItem('notificationsEnabled', JSON.stringify(newStatus));
  };

  const isFavorite = (eventId: string): boolean => {
    return favorites.has(eventId);
  };

  const toggleFavorite = async (eventId: string): Promise<void> => {
    if (!currentUser) return;

    const userRef = doc(firestore, 'users', currentUser.uid);
    const newFavorites = new Set(favorites);

    if (favorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }

    // Update Firestore
    await setDoc(
      userRef,
      {
        favorites: Array.from(newFavorites),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Update local state immediately for better UX
    setFavorites(newFavorites);
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await auth.signOut();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        notificationsEnabled,
        toggleNotifications,
        isFavorite,
        toggleFavorite,
        favorites,
        rsvpEvents,
        favoriteEvents,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
