import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '@/firebase';
import QRCode from 'qrcode';

export type RsvpStatus = 'rsvped' | 'waitlisted' | 'cancelled';

export interface RsvpData {
  userId: string;
  eventId: string;
  status: RsvpStatus;
  qrCodeUrl?: string;
  checkInAt?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Creates or updates an RSVP for an event
 */
export async function createRsvp(userId: string, eventId: string): Promise<{ status: RsvpStatus; qrCodeUrl?: string; qrPayload?: string }> {
  // Get event data to check capacity
  const eventRef = doc(firestore, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  
  if (!eventSnap.exists()) {
    throw new Error('Event not found');
  }

  const eventData = eventSnap.data();
  const capacity = eventData.capacity || 0;
  const currentRsvps = eventData.counters?.rsvpCount || 0;

  // Determine if user should be RSVPed or waitlisted
  const status: RsvpStatus = currentRsvps < capacity ? 'rsvped' : 'waitlisted';

  // Generate QR code for RSVPed users
  let qrCodeUrl: string | undefined;
  let qrPayload: string | undefined;
  if (status === 'rsvped') {
    const qrData = { eventId, userId, timestamp: Date.now() };
    qrPayload = JSON.stringify(qrData);
    qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  }

  // Create RSVP document
  const rsvpRef = doc(firestore, 'events', eventId, 'rsvps', userId);
  await setDoc(rsvpRef, {
    userId,
    eventId,
    status,
    qrCodeUrl: qrCodeUrl || null,
    qrPayload: qrPayload || null,
    checkInAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Also create in user's RSVPs collection for easy querying
  const userRsvpRef = doc(firestore, 'users', userId, 'rsvps', eventId);
  await setDoc(userRsvpRef, {
    eventId,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { status, qrCodeUrl, qrPayload };
}

/**
 * Cancels an RSVP
 */
export async function cancelRsvp(userId: string, eventId: string): Promise<void> {
  const rsvpRef = doc(firestore, 'events', eventId, 'rsvps', userId);
  const userRsvpRef = doc(firestore, 'users', userId, 'rsvps', eventId);

  // Update status to cancelled instead of deleting (keeps history)
  await updateDoc(rsvpRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });

  await updateDoc(userRsvpRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Gets RSVP status for a user and event
 */
export async function getRsvpStatus(userId: string, eventId: string): Promise<RsvpData | null> {
  const rsvpRef = doc(firestore, 'events', eventId, 'rsvps', userId);
  const rsvpSnap = await getDoc(rsvpRef);

  if (!rsvpSnap.exists()) {
    return null;
  }

  return rsvpSnap.data() as RsvpData;
}

/**
 * Gets all RSVPs for a user
 */
export async function getUserRsvps(userId: string): Promise<string[]> {
  const rsvpsRef = collection(firestore, 'users', userId, 'rsvps');
  const q = query(rsvpsRef, where('status', 'in', ['rsvped', 'waitlisted']));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.id);
}

