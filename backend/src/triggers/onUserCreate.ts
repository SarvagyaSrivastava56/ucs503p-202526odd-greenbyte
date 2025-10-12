import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Triggered when a new user is created in Firebase Auth.
 * Initializes user document in Firestore and sets custom claims based on email domain.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  if (!email) {
    console.warn(`User ${uid} created without email`);
    return;
  }

  // Determine role based on email domain
  let role: 'student' | 'society_admin' | 'super_admin' = 'student';
  
  if (email.endsWith('@admin.campus.edu')) {
    role = 'super_admin';
  } else if (email.endsWith('@society.campus.edu') || email === 'society@example.com') {
    role = 'society_admin';
  }

  // Set custom claims
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Set custom claims for user ${uid}: role=${role}`);
  } catch (error) {
    console.error(`Failed to set custom claims for user ${uid}:`, error);
  }

  // Initialize user document in Firestore
  const userDoc = {
    displayName: displayName || email.split('@')[0],
    email,
    role,
    avatarUrl: photoURL || '',
    interests: [],
    societyIds: [],
    deviceTokens: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await admin.firestore().collection('users').doc(uid).set(userDoc);
    console.log(`Created user document for ${uid}`);
  } catch (error) {
    console.error(`Failed to create user document for ${uid}:`, error);
    throw error;
  }
});

