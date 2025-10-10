'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { RealAuth } from '@/components/real-auth';

export default function SignupPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Icons.Logo className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline mt-4">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <RealAuth mode="signup" onSuccess={handleSuccess} />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
