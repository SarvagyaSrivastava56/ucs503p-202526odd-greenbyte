'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore, messaging } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The Firebase services are initialized in `@/firebase/index.ts` and imported directly.
  // The useMemo hook is no longer needed here as the initialization is handled at the module level.
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      messaging={messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
