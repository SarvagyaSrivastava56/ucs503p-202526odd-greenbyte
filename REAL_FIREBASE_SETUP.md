# 🔥 Real Firebase Setup Guide

This guide will help you connect the app to your real Firebase project for fully dynamic, production-ready functionality.

## ✅ What's Now Real & Dynamic

### ✨ Fully Implemented
- ✅ **Real Firebase Authentication** (Google + Email/Password)
- ✅ **Real-time Firestore queries** with live updates
- ✅ **RSVP system** with automatic capacity management
- ✅ **QR code generation** for check-ins
- ✅ **Real-time chat** with image uploads
- ✅ **Push notifications** infrastructure (FCM)
- ✅ **Image upload** to Firebase Storage
- ✅ **Calendar** integration in event creation
- ✅ **Security rules** for production

---

## 🚀 Quick Setup (5 Minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it (e.g., "UniConnect")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Services

**Authentication:**
1. Go to Authentication > Sign-in method
2. Enable "Email/Password"
3. Enable "Google" (add your support email)

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Start in **production mode** (we have security rules)
4. Choose a location (closest to users)

**Storage:**
1. Go to Storage
2. Click "Get started"
3. Start in **production mode**
4. Choose same location as Firestore

**Cloud Functions:**
1. Go to Functions
2. Click "Get started" (if prompted)
3. Upgrade to Blaze plan (pay-as-you-go, usually free tier is enough)

### 3. Get Your Firebase Config

1. Go to Project Settings (⚙️ icon)
2. Scroll to "Your apps"
3. Click the Web icon `</>` 
4. Register app (name: "UniConnect Web")
5. Copy the `firebaseConfig` object

### 4. Configure Your App

Create `.env.local` in the project root:

```bash
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# For Push Notifications (optional for now)
# Get from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
# NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 5. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 6. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 7. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🎯 Testing Your Real Firebase Setup

### Test Authentication
1. Go to http://localhost:3000/signup
2. Create account with email/password
3. Or click "Google" to sign in with Google
4. Check Firebase Console > Authentication to see your user

### Test Events
1. Sign in as admin (or create user with @society.campus.edu email)
2. Go to Society Dashboard
3. Click "Create New Event"
4. Fill out form with calendar date picker
5. Upload an image (goes to Firebase Storage)
6. Save event
7. Check Firestore Console to see your event

### Test RSVP
1. Sign in as student
2. Browse events on home page
3. Click an event
4. Click "RSVP Now"
5. See confetti animation
6. Get QR code generated
7. Check Firestore to see RSVP doc

### Test Chat
1. Go to an event detail page
2. Scroll to chat section
3. Send a text message
4. Upload an image
5. Open another browser/incognito
6. Sign in as different user
7. See messages update in real-time

### Test Push Notifications
1. Click "Enable Notifications" in settings
2. Grant browser permission
3. Create an event starting in 30 minutes
4. Wait for Cloud Function to trigger
5. Receive notification!

---

## 📊 What's Now Using Real Firebase

### Components Updated to Real Data:
- ✅ `events-list.tsx` - Real-time event queries
- ✅ `login/page.tsx` - Real Firebase Auth
- ✅ `signup/page.tsx` - Real user creation
- ✅ `rsvp-button.tsx` - Real RSVP management
- ✅ `event-chat.tsx` - Real-time messaging
- ✅ `create-event-dialog.tsx` - Real event creation with calendar

### New Real Features:
- 📅 **Calendar Widget** - React Day Picker for dates
- 🖼️ **Image Upload** - Direct to Firebase Storage
- 🔔 **Push Notifications** - FCM integration
- 💬 **Real-time Chat** - Firestore listeners
- 🎫 **QR Codes** - Dynamic generation
- 👥 **Waitlist** - Automatic promotion

---

## 🔐 Security (Already Configured)

Your security rules are production-ready:
- ✅ Role-based access control
- ✅ Field validation
- ✅ Type checking
- ✅ Owner verification
- ✅ File size limits
- ✅ Rate limiting ready

---

## 📱 Push Notifications Setup (Optional)

### Generate VAPID Key:
1. Go to Firebase Console > Project Settings
2. Click "Cloud Messaging" tab
3. Scroll to "Web configuration"
4. Click "Generate key pair"
5. Copy the key
6. Add to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_generated_key_here
```

### Service Worker:
Already configured in `/public/firebase-messaging-sw.js`

---

## 🎨 Calendar Features

The event creation now includes:
- 📅 Visual date picker
- ⏰ Time selection
- 🔄 Start/End date validation
- 📍 Timezone handling
- ⚡ Real-time preview

---

## 🐛 Troubleshooting

### "Permission denied" errors
- Make sure you deployed the security rules:
  ```bash
  firebase deploy --only firestore:rules,storage:rules
  ```

### Functions not triggering
- Check Firebase Console > Functions for errors
- Make sure you're on Blaze plan
- Check function logs: `firebase functions:log`

### Images not loading
- Check Storage rules are deployed
- Verify image URLs in Firestore
- Check browser console for CORS errors

### Auth not working
- Verify `.env.local` has correct config
- Check Firebase Console > Authentication is enabled
- Restart dev server after env changes

---

## 📈 Monitor Your App

### Firebase Console Dashboards:
- **Authentication**: See all users
- **Firestore**: Browse all data
- **Storage**: View uploaded images
- **Functions**: Monitor execution & logs
- **Analytics**: Track usage (if enabled)

---

## 🎓 Next Steps

1. **Seed Initial Data:**
   ```bash
   npx tsx scripts/seed-data.ts
   ```

2. **Customize Welcome Email:**
   - Edit Cloud Function `onUserCreate`

3. **Add More Societies:**
   - Use Firebase Console or create admin panel

4. **Configure Push Notification Times:**
   - Edit `sendReminders` function schedule

5. **Add Payment Integration:**
   - Stripe/PayPal for paid events

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email + Google)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Indexes deployed
- [ ] Cloud Functions deployed
- [ ] Dev server restarted
- [ ] Test user created
- [ ] Test event created
- [ ] RSVP tested
- [ ] Chat tested
- [ ] Push notifications working

---

**🎉 Your app is now fully dynamic and production-ready!**

All mock data has been replaced with real Firebase queries. Everything is live, real-time, and ready for production deployment.

Need help? Check the main README.md or create an issue on GitHub.

