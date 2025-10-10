
'use client';
import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import { Separator } from './ui/separator';
import { CreateEventFab } from './create-event-fab';
import { useAppContext } from '@/context/app-context';
import { useFirebase } from '@/firebase';
import React, { useEffect, useState } from 'react';
import { getEvents } from '@/lib/firebase-queries';
import type { Event } from '@/lib/types';
import { EventCardSkeleton } from './event-card-skeleton';

type DashboardContentProps = {
  trendingEvents: React.ReactNode;
  recommendedEvents: React.ReactNode;
};

export default function DashboardContent({ trendingEvents, recommendedEvents }: DashboardContentProps) {
  const { currentUser } = useAppContext();
  const { user } = useFirebase();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getEvents({ limitCount: 20 });
        setEvents(result.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const isSocietyAdmin = user?.email?.includes('@society.') || user?.email?.includes('.society');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">
        Welcome to CampusConnect!
      </h1>
      
      {trendingEvents}

      <Separator className="my-8" />
      
      {recommendedEvents}

      <Separator className="my-8" />

      <div>
        <h2 className="font-headline text-2xl font-semibold mb-4">All Events</h2>
        <EventFilters />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-lg">No events yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
      {isSocietyAdmin && <CreateEventFab />}
    </div>
  );
}
