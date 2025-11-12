'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;
let functions: Functions;
let emulatorsConnected = false;

if (!getApps().length) {
  try {
    // Attempt to initialize via Firebase App Hosting environment variables
    firebaseApp = initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    firebaseApp = initializeApp(firebaseConfig);
  }
} else {
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
firestore = getFirestore(firebaseApp);
storage = getStorage(firebaseApp);
functions = getFunctions(firebaseApp);
if (typeof window !== 'undefined') {
  messaging = getMessaging(firebaseApp);
}

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true' && !emulatorsConnected) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Auth emulator already connected or unavailable:', err);
    }
  }

  try {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Firestore emulator already connected or unavailable:', err);
    }
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Storage emulator already connected or unavailable:', err);
    }
  }

  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Functions emulator already connected or unavailable:', err);
    }
  }

  emulatorsConnected = true;
}

export { firebaseApp, auth, firestore, storage, messaging, functions };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
