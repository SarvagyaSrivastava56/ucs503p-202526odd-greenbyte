'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Event, Society, User } from './types';

/**
 * Fetch all published events with optional filters
 */
export async function getEvents(options: {
  category?: string;
  societyId?: string;
  status?: string;
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
} = {}) {
  const { category, societyId, status = 'published', limitCount = 20, lastDoc } = options;

  const constraints: QueryConstraint[] = [
    where('status', '==', status),
    orderBy('startAt', 'desc'),
  ];

  if (category) {
    constraints.unshift(where('category', '==', category));
  }

  if (societyId) {
    constraints.unshift(where('societyId', '==', societyId));
  }

  constraints.push(limit(limitCount));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const eventsRef = collection(firestore, 'events');
  const q = query(eventsRef, ...constraints);
  const snapshot = await getDocs(q);

  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  return {
    events,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === limitCount,
  };
}

/**
 * Fetch a single event by ID
 */
export async function getEvent(eventId: string): Promise<Event | null> {
  const eventRef = doc(firestore, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return null;
  }

  return {
    id: eventSnap.id,
    ...eventSnap.data(),
  } as Event;
}

/**
 * Real-time listener for events
 */
export function subscribeToEvents(
  callback: (events: Event[]) => void,
  options: {
    category?: string;
    societyId?: string;
    limitCount?: number;
  } = {}
) {
  const { category, societyId, limitCount = 20 } = options;

  const constraints: QueryConstraint[] = [
    where('status', '==', 'published'),
    orderBy('startAt', 'desc'),
    limit(limitCount),
  ];

  if (category) {
    constraints.unshift(where('category', '==', category));
  }

  if (societyId) {
    constraints.unshift(where('societyId', '==', societyId));
  }

  const eventsRef = collection(firestore, 'events');
  const q = query(eventsRef, ...constraints);

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    callback(events);
  });
}

/**
 * Fetch trending events (by views and RSVPs)
 */
export async function getTrendingEvents(limitCount = 10) {
  const eventsRef = collection(firestore, 'events');
  const q = query(
    eventsRef,
    where('status', '==', 'published'),
    orderBy('counters.views', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    isTrending: true,
  })) as Event[];
}

/**
 * Fetch upcoming events (starting soon)
 */
export async function getUpcomingEvents(limitCount = 10) {
  const now = new Date().toISOString();
  const eventsRef = collection(firestore, 'events');
  const q = query(
    eventsRef,
    where('status', '==', 'published'),
    where('startAt', '>=', now),
    orderBy('startAt', 'asc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Fetch user's RSVP'd events
 */
export async function getUserEvents(userId: string): Promise<Event[]> {
  // Get user's RSVPs
  const rsvpsRef = collection(firestore, 'users', userId, 'rsvps');
  const rsvpsQuery = query(rsvpsRef, where('status', 'in', ['rsvped', 'waitlisted']));
  const rsvpsSnapshot = await getDocs(rsvpsQuery);

  const eventIds = rsvpsSnapshot.docs.map(doc => doc.id);

  if (eventIds.length === 0) {
    return [];
  }

  // Fetch events (Firestore has limit of 10 for 'in' queries)
  const events: Event[] = [];
  for (const eventId of eventIds) {
    const event = await getEvent(eventId);
    if (event) {
      events.push(event);
    }
  }

  return events.sort((a, b) => 
    new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
}

/**
 * Fetch all societies
 */
export async function getSocieties(): Promise<Society[]> {
  const societiesRef = collection(firestore, 'societies');
  const snapshot = await getDocs(societiesRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Society[];
}

/**
 * Fetch a single society
 */
export async function getSociety(societyId: string): Promise<Society | null> {
  const societyRef = doc(firestore, 'societies', societyId);
  const societySnap = await getDoc(societyRef);

  if (!societySnap.exists()) {
    return null;
  }

  return {
    id: societySnap.id,
    ...societySnap.data(),
  } as Society;
}

/**
 * Fetch user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as User;
}

/**
 * Search events by title or description
 */
export async function searchEvents(searchTerm: string, limitCount = 20): Promise<Event[]> {
  // Firestore doesn't support full-text search natively
  // This is a simple prefix match on title
  // For production, consider using Algolia or similar
  
  const eventsRef = collection(firestore, 'events');
  const q = query(
    eventsRef,
    where('status', '==', 'published'),
    orderBy('title'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  const allEvents = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  // Client-side filtering (not ideal for large datasets)
  const searchLower = searchTerm.toLowerCase();
  return allEvents.filter(event => 
    event.title.toLowerCase().includes(searchLower) ||
    event.description.toLowerCase().includes(searchLower)
  );
}

