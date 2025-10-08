'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppContextType = {
  rsvpEvents: string[];
  favoriteEvents: string[];
  addRsvp: (eventId: string) => void;
  isRsvpd: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rsvpEvents, setRsvpEvents] = useState<string[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);

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

  return (
    <AppContext.Provider
      value={{
        rsvpEvents,
        favoriteEvents,
        addRsvp,
        isRsvpd,
        toggleFavorite,
        isFavorite,
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
