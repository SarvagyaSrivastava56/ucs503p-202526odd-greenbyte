# 🎓 UniConnect

A production-grade event management platform for campus organizations, built with Next.js 15, Firebase, and TypeScript.

## ✨ Features

### 🎯 Core Functionality
- **Event Discovery**: Browse, search, and filter events by category, date, and society
- **Smart RSVP System**: Automatic capacity management with waitlist support
- **QR Code Check-ins**: Generate and verify QR codes for event attendance
- **Real-time Chat**: Per-event messaging with image support
- **Push Notifications**: Event reminders (24h & 30min before) and weekly digests
- **Role-based Access**: Student, Society Admin, and Super Admin roles

### 🎨 Premium UI/UX
- Modern, responsive design with Tailwind CSS
- Dark mode support with system preference detection
- Skeleton loaders for smooth loading states
- Confetti animations on successful RSVPs
- Hero transitions and micro-interactions
- Accessible with ARIA labels and keyboard navigation

### 🔒 Production Security
- Comprehensive Firestore security rules
- Firebase Storage access control
- Cloud Functions rate limiting
- Field validation and type checking
- No hardcoded secrets (environment-based config)

### ⚡ Performance
- SSR/ISR with Next.js 15
- Image optimization with Next/Image
- Firestore composite indexes
- Pagination support
- Client-side image compression
- Lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project ([Create one here](https://console.firebase.google.com/))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd uniconnect
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Link to your project
firebase use --add

# Select your project and give it an alias (e.g., "default")
```

### 3. Environment Configuration

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your Firebase config
# Get these from: Firebase Console > Project Settings > General
```

Your `.env.local` should look like:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 5. Run Development Server

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Firebase emulators (optional)
firebase emulators:start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 📁 Project Structure

```
uniconnect/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components (shadcn/ui)
│   │   ├── event-card.tsx
│   │   ├── event-chat.tsx
│   │   ├── rsvp-button.tsx
│   │   └── ...
│   ├── firebase/         # Firebase initialization
│   ├── lib/             # Utilities and helpers
│   │   ├── types.ts     # TypeScript types
│   │   ├── rsvp.ts      # RSVP logic
│   │   ├── storage.ts   # Image upload
│   │   └── ...
│   └── context/         # React Context providers
├── functions/           # Cloud Functions
│   └── src/
│       ├── triggers/    # Firestore triggers
│       ├── scheduled/   # Scheduled functions
│       └── https/       # Callable functions
├── public/              # Static assets
├── firestore.rules      # Security rules
├── storage.rules        # Storage security rules
└── firestore.indexes.json  # Composite indexes
```

## 🔐 User Roles

The app supports three user roles:

1. **Student**: Can browse events, RSVP, join chats, manage favorites
2. **Society Admin**: Can create/edit events for their societies
3. **Super Admin**: Full access to all features

Role assignment is automatic based on email domain (configured in Cloud Functions):
- `@admin.campus.edu` → Super Admin
- `@society.campus.edu` → Society Admin
- Others → Student

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Firebase
firebase emulators:start # Run local emulators
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Deploy only hosting
firebase deploy --only functions # Deploy only functions

# Cloud Functions (in functions/ directory)
npm run build            # Compile TypeScript
npm run build:watch      # Watch mode
npm test                 # Run tests
```

## 📊 Data Model

### Collections

#### `users/{userId}`
```typescript
{
  displayName: string
  email: string
  role: 'student' | 'society_admin' | 'super_admin'
  interests: string[]
  societyIds: string[]
  deviceTokens: string[]
  avatarUrl: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `societies/{societyId}`
```typescript
{
  name: string
  description: string
  logoUrl: string
  admins: string[]  // UIDs
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `events/{eventId}`
```typescript
{
  title: string
  description: string
  societyId: string
  bannerUrl: string
  category: string
  tags: string[]
  startAt: string (ISO 8601)
  endAt: string (ISO 8601)
  venue: string
  isOnline: boolean
  link?: string
  capacity: number
  isPaid: boolean
  price?: number
  status: 'draft' | 'published' | 'archived'
  createdBy: string (UID)
  counters: {
    rsvpCount: number
    views: number
    checkIns: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `events/{eventId}/rsvps/{userId}`
```typescript
{
  userId: string
  status: 'rsvped' | 'waitlisted' | 'cancelled'
  qrCodeUrl?: string
  checkInAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `events/{eventId}/chat/{messageId}`
```typescript
{
  uid: string
  text?: string
  imageUrl?: string
  userName: string
  userAvatar: string
  createdAt: Timestamp
}
```

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Build the Next.js app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Environment Variables for Production

Set production environment variables in Firebase:

```bash
firebase functions:config:set \
  app.url="https://your-domain.com"
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run typecheck

# Build test
npm run build

# Test Cloud Functions
cd functions
npm test
```

## 📱 Push Notifications Setup

1. Generate a VAPID key in Firebase Console:
   - Go to Project Settings > Cloud Messaging
   - Under "Web configuration", click "Generate key pair"

2. Add the key to your environment:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

3. Request notification permission from users in the app

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Firebase Emulator Issues

```bash
# Kill existing processes
lsof -ti:4000,5000,8080,9099 | xargs kill -9

# Restart emulators
firebase emulators:start
```

### TypeScript Errors

```bash
# Regenerate types
npm run typecheck
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@uniconnect.com

---

Built with ❤️ using Next.js, Firebase, and TypeScript
