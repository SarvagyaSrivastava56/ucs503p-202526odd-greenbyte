'use client';
import MainLayout from '@/components/main-layout';
import DashboardContent from '@/components/dashboard-content';
import { useAppContext } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {mockUsers} from "@/lib/mock-data";

export default function Home() {
  const { currentUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null; // Or a loading spinner
  }

  // To preserve the original mock user behavior for existing components
  const mockUser = mockUsers.find(user => user.email === 'student@example.com')!;
  
  if (currentUser.role === 'society') {
    router.replace('/society-dashboard');
    return null;
  }

  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
}
