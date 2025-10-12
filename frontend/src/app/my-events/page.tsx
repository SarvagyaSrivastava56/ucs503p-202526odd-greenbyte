'use client';
import MainLayout from '@/components/main-layout';
import { EventCard } from '@/components/event-card';
import { useEffect, useState } from 'react';
import { getUserEvents } from '@/lib/firebase-queries';
import type { Event } from '@/lib/types';
import { Info } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { EventCardSkeleton } from '@/components/event-card-skeleton';

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const userEvents = await getUserEvents(user.uid);
        setEvents(userEvents);
      } catch (error) {
        console.error('Error fetching user events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">My Events</h1>
        <p className="mt-2 text-muted-foreground">Events you have RSVPed to.</p>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-background/60 p-12 rounded-lg border-2 border-dashed">
            <Info className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-semibold">No RSVPs Yet</h2>
            <p>RSVP to an event and it will show up here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
