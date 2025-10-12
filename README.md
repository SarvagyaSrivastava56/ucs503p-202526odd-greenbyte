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

## 📁 Project Structure

```
uniconnect/
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   ├── firebase/   # Firebase config
│   │   ├── lib/        # Utilities
│   │   ├── hooks/      # Custom hooks
│   │   ├── context/    # Context providers
│   │   └── services/   # Business logic
│   ├── public/         # Static assets
│   └── package.json
│
├── backend/            # Firebase Cloud Functions
│   ├── src/
│   │   ├── triggers/   # Firestore triggers
│   │   ├── scheduled/  # Scheduled functions
│   │   └── https/      # Callable functions
│   └── package.json
│
├── firebase.json       # Firebase configuration
├── firestore.rules     # Security rules
├── storage.rules       # Storage security rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project ([Create one here](https://console.firebase.google.com/))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd uniconnect

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Link to your project
firebase use --add
```

### 3. Environment Configuration

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 4. Deploy Security Rules

```bash
# From project root
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

### 5. Run Development Server

```bash
# Frontend (from frontend directory)
cd frontend
npm run dev

# Backend (optional - for local testing)
cd backend
npm run serve
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Build and deploy frontend (choose your platform)
cd frontend
npm run build
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

### Frontend
```bash
cd frontend
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
```

### Backend
```bash
cd backend
npm run build            # Compile TypeScript
npm run build:watch      # Watch mode
npm run serve            # Run local emulators
```

### Firebase
```bash
firebase emulators:start # Run local emulators
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Deploy only hosting
firebase deploy --only functions # Deploy only functions
```

## 🚢 Deployment Options

### Option 1: Vercel (Recommended for Frontend)
1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

### Option 2: Netlify
1. Connect your GitHub repository
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/.next`
4. Add environment variables
5. Deploy

### Option 3: Firebase Hosting
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 📊 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase SDK

**Backend:**
- Firebase Cloud Functions
- TypeScript
- Firebase Admin SDK

**Database & Services:**
- Firebase Firestore
- Firebase Authentication
- Firebase Storage
- Firebase Cloud Messaging

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint
npm run typecheck
npm run build

# Backend
cd backend
npm run build
npm test
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
