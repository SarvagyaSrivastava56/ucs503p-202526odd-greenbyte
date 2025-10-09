'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

type AppContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => User;
  logout: () => void;
  signup: (userData: Omit<User, 'id' | 'avatarUrl'>) => User;
  rsvpEvents: string[];
  favoriteEvents: string[];
  addRsvp: (eventId: string) => void;
  isRsvpd: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rsvpEvents, setRsvpEvents] = useState<string[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
    const notificationsPref = localStorage.getItem('notificationsEnabled');
    if (notificationsPref) {
        setNotificationsEnabled(JSON.parse(notificationsPref));
    }
  }, []);

  const login = (email: string, password: string): User => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      const userToStore = { ...user };
      delete userToStore.password;
      setCurrentUser(userToStore);
      sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
      return userToStore;
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    router.push('/login');
  };

  const signup = (userData: Omit<User, 'id'| 'avatarUrl'>): User => {
    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`,
    };
    mockUsers.push(newUser);
    return newUser;
  };

  const addRsvp = (eventId: string) => {
    setRsvpEvents((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
  };

  const isRsvpd = (eventId: string) => {
    return rsvpEvents.includes(eventId);
  };

  const toggleFavorite = (eventId: string) => {
    setFavoriteEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const isFavorite = (eventId: string) => {
    return favoriteEvents.includes(eventId);
  };

  const toggleNotifications = () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    localStorage.setItem('notificationsEnabled', JSON.stringify(newStatus));
  };


  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        signup,
        rsvpEvents,
        favoriteEvents,
        addRsvp,
        isRsvpd,
        toggleFavorite,
        isFavorite,
        notificationsEnabled,
        toggleNotifications,
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
