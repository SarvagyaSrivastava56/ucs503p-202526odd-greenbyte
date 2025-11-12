# Real-Time Push Notifications Setup

## ✅ What's Implemented

### Frontend
1. **Push Notification Component** (`frontend/src/components/push-notifications.tsx`)
   - Automatically requests notification permission when user logs in
   - Registers FCM device tokens in Firestore
   - Listens for foreground messages and shows toast notifications
   - Stores tokens in `users/{uid}/notificationTokens/{token}` subcollection

2. **Service Worker** (`frontend/public/firebase-messaging-sw.js`)
   - Handles background push notifications
   - Shows system notifications when app is in background
   - Handles notification clicks and navigates to event pages
   - Supports deep linking to events

3. **Push Notification Library** (`frontend/src/lib/push-notifications.ts`)
   - Request notification permissions
   - Register device tokens
   - Setup foreground message listeners
   - Remove notification tokens

### Backend (Cloud Functions)
1. **Push Notification Service** (`backend/src/services/push-notification-service.ts`)
   - Send notifications to single users or multiple users
   - Get device tokens from Firestore
   - Handle invalid token cleanup
   - Support for web, Android, and iOS notifications

2. **Event Write Trigger** (`backend/src/triggers/onEventWrite.ts`)
   - Sends notifications when new events are published
   - Sends notifications when events are updated (time, venue, title changes)
   - Notifies all users for new events
   - Notifies RSVPed users for event updates

3. **RSVP Write Trigger** (`backend/src/triggers/onRsvpWrite.ts`)
   - Sends notifications when users are promoted from waitlist
   - Handles waitlist promotion automatically

4. **Scheduled Reminders** (`backend/src/scheduled/sendReminders.ts`)
   - Sends reminders 24 hours before events
   - Sends reminders 30 minutes before events
   - Only sends to users who have RSVPed

5. **Weekly Digest** (`backend/src/scheduled/weeklyDigest.ts`)
   - Sends weekly event digests to users based on interests
   - Filters events by user interests and tags

## 🔧 Configuration Required

### 1. Firebase VAPID Key
You need to generate a VAPID key for push notifications:

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web configuration" → "Key pair"
3. Click "Generate key pair" (or copy existing)
4. Add to environment variables:
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
   ```

### 2. Enable Cloud Messaging in Firebase
1. Go to Firebase Console → Cloud Messaging
2. Ensure Cloud Messaging API is enabled
3. Enable Firebase Cloud Messaging in your Firebase project

### 3. Deploy Cloud Functions
```bash
cd backend
npm run build
firebase deploy --only functions
```

### 4. Set Up Firestore Indexes
The notification system requires an index for waitlist queries:
```bash
firebase deploy --only firestore:indexes
```

### 5. Environment Variables
Make sure these are set in your deployment:
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` - Required for push notifications
- All other Firebase config variables (already set)

## 📱 How It Works

### For Users
1. **Enable Notifications**: Users can enable notifications in settings
2. **Permission Request**: Browser/device will ask for notification permission
3. **Token Registration**: Device token is saved in Firestore
4. **Receive Notifications**: Users receive notifications for:
   - New events published
   - Event updates (time, venue changes)
   - Event reminders (24h and 30min before)
   - Waitlist promotions
   - Weekly digests

### Notification Types
1. **New Events**: Sent to all users when an event is published
2. **Event Updates**: Sent to RSVPed users when event details change
3. **Event Reminders**: Sent 24 hours and 30 minutes before event starts
4. **Waitlist Promotion**: Sent when user is promoted from waitlist
5. **Weekly Digest**: Sent weekly with personalized event recommendations

## 🧪 Testing

### Local Testing
1. Enable emulators:
   ```bash
   firebase emulators:start --only firestore,auth
   ```

2. Set environment variable:
   ```env
   NEXT_PUBLIC_FIREBASE_EMULATORS=true
   ```

3. Run frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Test notifications:
   - Log in as a user
   - Enable notifications in settings
   - Grant browser notification permission
   - Check Firestore for device tokens in `users/{uid}/notificationTokens`
   - Manually trigger Cloud Functions or wait for scheduled triggers

### Production Testing
1. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

2. Test notifications:
   - Create a new event and publish it
   - Check if notifications are sent to all users
   - Update event details and check if RSVPed users are notified
   - Wait for scheduled reminders (or trigger manually)

## 🔍 Monitoring

### Check Notification Delivery
1. Firebase Console → Cloud Messaging → Usage
2. Cloud Functions logs:
   ```bash
   firebase functions:log
   ```

### Check Device Tokens
1. Firestore Console → `users/{uid}/notificationTokens`
2. Verify tokens are being registered
3. Check if tokens are marked as `isActive: true`

### Debug Issues
1. Check browser console for FCM errors
2. Check Cloud Functions logs for notification errors
3. Verify VAPID key is correctly set
4. Verify service worker is registered
5. Check notification permission status

## 🚀 Deployment Checklist

- [ ] Generate Firebase VAPID key
- [ ] Set `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in environment variables
- [ ] Enable Cloud Messaging in Firebase Console
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Test notification permission request
- [ ] Test device token registration
- [ ] Test notification delivery
- [ ] Test notification click handling
- [ ] Verify notifications work on mobile devices (if applicable)

## 📝 Notes

- Notifications work on web browsers (Chrome, Firefox, Edge, Safari)
- Notifications require HTTPS (or localhost for development)
- Service worker must be registered for background notifications
- Device tokens are stored per user per device
- Invalid tokens are automatically cleaned up
- Notifications respect user preferences (enabled/disabled)
- Notifications include deep links to event pages

## 🐛 Troubleshooting

**Issue: Notifications not showing**
- Check if notification permission is granted
- Verify VAPID key is set correctly
- Check if service worker is registered
- Verify Cloud Functions are deployed
- Check browser console for errors

**Issue: Notifications not being sent**
- Check Cloud Functions logs
- Verify device tokens are registered in Firestore
- Check if Cloud Messaging API is enabled
- Verify Firebase project configuration

**Issue: Notification clicks not working**
- Check service worker is registered
- Verify notification data includes eventId or URL
- Check browser console for errors
- Test notification click handler

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

