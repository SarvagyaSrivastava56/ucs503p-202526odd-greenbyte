'use client';

import MainLayout from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/app-context';
import { CalendarCheck, Star, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { rsvpEvents, favoriteEvents, currentUser, logout } = useAppContext();
  const router = useRouter();

  if (!currentUser) {
    // Or a loading spinner
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <p>Please log in to view your profile.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Login
          </Button>
        </div>
      </MainLayout>
    );
  }

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold">Profile</h1>
            <p className="mt-2 text-muted-foreground">Your user profile and statistics.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        <Card className="max-w-2xl mx-auto bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-2xl">{currentUser.name}</CardTitle>
            <p className="text-muted-foreground">{currentUser.email}</p>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-background/80">
                <CalendarCheck className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{rsvpEvents.length}</p>
                <p className="text-sm text-muted-foreground">Events RSVP'd</p>
              </div>
              <div className="p-4 rounded-lg bg-background/80">
                <Star className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{favoriteEvents.length}</p>
                <p className="text-sm text-muted-foreground">Favorited Events</p>
              </div>
              <div className="p-4 rounded-lg bg-background/80">
                <User className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold capitalize">{currentUser.role}</p>
                <p className="text-sm text-muted-foreground">Role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
