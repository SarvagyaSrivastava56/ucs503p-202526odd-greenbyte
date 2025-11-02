'use client';

import { useFirebase } from '@/firebase';
import { useAppContext } from '@/context/app-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Megaphone, 
  BarChart3, 
  UserCog, 
  Settings, 
  Ticket,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';

const navigation = [
  { name: 'Overview', href: '/society-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Events', href: '/society-dashboard/events', icon: Calendar },
  { name: 'RSVPs & Attendees', href: '/society-dashboard/rsvps', icon: Users },
  { name: 'Announcements', href: '/society-dashboard/announcements', icon: Megaphone },
  { name: 'Analytics', href: '/society-dashboard/analytics', icon: BarChart3 },
  // { name: 'Team', href: '/society-dashboard/team', icon: UserCog },
  // { name: 'Monetization', href: '/society-dashboard/monetization', icon: Ticket },
  // { name: 'Automation', href: '/society-dashboard/automation', icon: Zap },
  { name: 'Settings', href: '/society-dashboard/settings', icon: Settings },
];

export default function SocietyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useFirebase();
  const { currentUser } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect if not a society admin
    if (!isUserLoading && user && currentUser && currentUser.role !== 'society_admin' && currentUser.role !== 'super_admin') {
      router.push('/');
    }
  }, [user, isUserLoading, currentUser, router]);

  if (isUserLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen">
          <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="flex-1 space-y-1 px-3">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full mb-2" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user || !currentUser || (currentUser.role !== 'society_admin' && currentUser.role !== 'super_admin')) {
    return null;
  }

  return (
    <MainLayout>
      <KeyboardShortcuts />
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h2 className="font-headline text-xl font-bold">Society Dashboard</h2>
            </div>
            <nav className="flex-1 space-y-1 px-3 pb-4">
              {navigation.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname?.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}

