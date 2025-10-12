# 🎨 UniConnect Frontend

Next.js 15 frontend application for the UniConnect campus event management platform.

## 🚀 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Context
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── firebase/         # Firebase configuration
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   └── services/        # Business logic services
├── public/              # Static assets
└── package.json
```

## ✨ Features

- 🎯 Event discovery and management
- 🔐 Role-based authentication (Student, Society Admin, Super Admin)
- 💬 Real-time event chat
- 📱 Push notifications
- 🎨 Dark mode support
- 📊 Society dashboard with analytics
- 🔍 Advanced search and filters
- ⚡ Optimistic UI updates

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

