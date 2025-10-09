'use client';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/firebase'; // Ensure you have a firestore instance export
import type { Event } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This function saves an event to Firestore. It can be used for both creating and updating.
export const saveEvent = (
  eventData: Omit<Event, 'id' | 'isTrending' | 'imageHint' | 'counters'> & { societyId: string },
  eventId?: string
) => {
  const dataToSave = {
    ...eventData,
    startAt: eventData.startAt,
    endAt: eventData.endAt,
  };

  if (eventId) {
    // Update an existing event
    const eventRef = doc(firestore, 'events', eventId);
    setDoc(eventRef, dataToSave, { merge: true }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventRef.path,
        operation: 'update',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError; // Re-throw to be caught by the calling function's try/catch
    });
  } else {
    // Create a new event
    const eventsCollection = collection(firestore, 'events');
    const fullEventData = {
      ...dataToSave,
      counters: { rsvpCount: 0, views: 0, checkIns: 0 }
    }
    addDoc(eventsCollection, fullEventData).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventsCollection.path,
        operation: 'create',
        requestResourceData: fullEventData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError; // Re-throw to be caught by the calling function's try/catch
    });
  }
};
