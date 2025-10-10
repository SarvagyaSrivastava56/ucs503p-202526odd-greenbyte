import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Export all Cloud Functions
export { onUserCreate } from './triggers/onUserCreate';
export { onRsvpWrite } from './triggers/onRsvpWrite';
export { sendReminders } from './scheduled/sendReminders';
export { checkInVerify } from './https/checkInVerify';
export { weeklyDigest } from './scheduled/weeklyDigest';

