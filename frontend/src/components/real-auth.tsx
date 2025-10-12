'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from './icons';
import { Loader2 } from 'lucide-react';

interface RealAuthProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export function RealAuth({ mode, onSuccess }: RealAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate college email for signup
      if (mode === 'signup') {
        const { validateCollegeEmail } = await import('@/lib/auth-validation');
        const validation = validateCollegeEmail(email);
        
        if (!validation.valid) {
          toast({
            variant: 'destructive',
            title: 'Invalid Email',
            description: validation.error,
          });
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user profile in Firestore
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { firestore } = await import('@/firebase');
        
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email: email,
          name: email.split('@')[0],
          displayName: email.split('@')[0],
          role: validation.role,
          societyIds: validation.role === 'society_admin' ? ['society-1'] : [],
          createdAt: serverTimestamp(),
          deviceTokens: [],
          interests: [],
          avatarUrl: null,
        });

        toast({
          title: 'Account Created!',
          description: `Welcome to UniConnect as ${validation.role === 'society_admin' ? 'a Society Admin' : 'a Student'}`,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Welcome Back!',
          description: 'Successfully signed in',
        });
      }
      onSuccess?.();
    } catch (error: any) {
      let message = 'An error occurred';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email already in use';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Invalid email or password';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid credentials. Please check your email and password';
          break;
      }

      toast({
        variant: 'destructive',
        title: mode === 'signup' ? 'Signup Failed' : 'Login Failed',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Restrict to college domain
      provider.setCustomParameters({
        hd: 'campus.edu', // Replace with your college domain
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Validate college email
      if (user.email) {
        const { validateCollegeEmail } = await import('@/lib/auth-validation');
        const validation = validateCollegeEmail(user.email);
        
        if (!validation.valid) {
          // Sign out if not college email
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Invalid Email Domain',
            description: validation.error,
          });
          setLoading(false);
          return;
        }

        // Create or update user profile
        const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
        const { firestore } = await import('@/firebase');
        
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            displayName: user.displayName || user.email.split('@')[0],
            avatarUrl: user.photoURL,
            role: validation.role,
            societyIds: validation.role === 'society_admin' ? ['society-1'] : [],
            createdAt: serverTimestamp(),
            deviceTokens: [],
            interests: [],
          });
        }
      }
      
      toast({
        title: 'Welcome!',
        description: 'Successfully signed in with Google',
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'Failed to sign in with Google',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.Google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}

export async function signOut() {
  await firebaseSignOut(auth);
}

