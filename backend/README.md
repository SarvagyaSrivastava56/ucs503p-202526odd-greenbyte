# ⚡ UniConnect Backend

Firebase Cloud Functions for the UniConnect campus event management platform.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Platform:** Firebase Cloud Functions
- **Database:** Firestore
- **Authentication:** Firebase Auth

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run build
npm run serve
```

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts         # Main entry point
│   ├── triggers/        # Firestore triggers
│   │   ├── onRsvpWrite.ts
│   │   └── onUserCreate.ts
│   ├── scheduled/       # Scheduled functions
│   │   ├── sendReminders.ts
│   │   └── weeklyDigest.ts
│   └── https/           # Callable HTTPS functions
│       └── checkInVerify.ts
├── package.json
└── tsconfig.json
```

## ⚙️ Functions

### Triggers
- **onUserCreate:** Automatically sets up new user profiles with default values
- **onRsvpWrite:** Updates event RSVP counters and manages waitlists

### Scheduled Functions
- **sendReminders:** Sends push notifications 24h and 30min before events
- **weeklyDigest:** Sends weekly event digest emails to users

### HTTPS Functions
- **checkInVerify:** Verifies QR codes for event check-ins

## 🚀 Deployment

```bash
# From project root
firebase deploy --only functions
```

## 🔐 Security

- All functions use Firebase Admin SDK with elevated permissions
- Rate limiting implemented on callable functions
- Input validation on all function parameters

