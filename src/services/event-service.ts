/**
 * Event Service - Business logic for event operations
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Event } from '@/lib/types';
import type { FilterOptions } from '@/components/advanced-event-filters';

/**
 * Filter events based on search and filter criteria
 */
export function filterEvents(events: Event[], filters: FilterOptions): Event[] {
  let filtered = [...events];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter((event) => event.category === filters.category);
  }

  // Date range filter
  const now = new Date();
  
  if (filters.dateFrom) {
    filtered = filtered.filter((event) => new Date(event.startAt) >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    const endOfDay = new Date(filters.dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    filtered = filtered.filter((event) => new Date(event.startAt) <= endOfDay);
  }

  // Status filter (upcoming/past)
  if (filters.status === 'upcoming') {
    filtered = filtered.filter((event) => new Date(event.startAt) >= now);
  } else if (filters.status === 'past') {
    filtered = filtered.filter((event) => new Date(event.startAt) < now);
  }

  return filtered;
}

/**
 * Get events with advanced filtering
 */
export async function getEventsWithFilters(options: {
  filters?: FilterOptions;
  limitCount?: number;
  societyId?: string;
}): Promise<Event[]> {
  const { filters, limitCount = 50, societyId } = options;

  const constraints: QueryConstraint[] = [
    where('status', '==', 'published'),
    orderBy('startAt', 'desc'),
  ];

  if (societyId) {
    constraints.unshift(where('societyId', '==', societyId));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const eventsRef = collection(firestore, 'events');
  const q = query(eventsRef, ...constraints);
  const snapshot = await getDocs(q);

  let events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  // Apply client-side filters if provided
  if (filters) {
    events = filterEvents(events, filters);
  }

  return events;
}

/**
 * Get upcoming events
 */
export async function getUpcomingEventsService(limitCount = 10): Promise<Event[]> {
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
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Get past events
 */
export async function getPastEvents(limitCount = 10): Promise<Event[]> {
  const now = new Date().toISOString();
  
  const eventsRef = collection(firestore, 'events');
  const q = query(
    eventsRef,
    where('status', '==', 'published'),
    where('startAt', '<', now),
    orderBy('startAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: string, limitCount = 20): Promise<Event[]> {
  const eventsRef = collection(firestore, 'events');
  const q = query(
    eventsRef,
    where('status', '==', 'published'),
    where('category', '==', category),
    orderBy('startAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Bookmark an event for a user
 */
export async function bookmarkEvent(userId: string, eventId: string): Promise<void> {
  const bookmarkRef = doc(firestore, 'users', userId, 'favorites', eventId);
  await addDoc(collection(firestore, 'users', userId, 'favorites'), {
    eventId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Remove bookmark
 */
export async function removeBookmark(userId: string, eventId: string): Promise<void> {
  const bookmarkRef = doc(firestore, 'users', userId, 'favorites', eventId);
  await deleteDoc(bookmarkRef);
}

/**
 * Check if event is bookmarked
 */
export async function isEventBookmarked(userId: string, eventId: string): Promise<boolean> {
  const bookmarkRef = doc(firestore, 'users', userId, 'favorites', eventId);
  const bookmarkDoc = await getDoc(bookmarkRef);
  return bookmarkDoc.exists();
}




