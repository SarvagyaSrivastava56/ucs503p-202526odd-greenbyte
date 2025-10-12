'use client';

import { useEffect, useState } from 'react';
import { EventCard } from './event-card';
import { EventCardSkeletonGrid } from './event-card-skeleton';
import { subscribeToEvents } from '@/lib/firebase-queries';
import type { Event } from '@/lib/types';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface EventsListProps {
  category?: string;
  societyId?: string;
  limitCount?: number;
}

export function EventsList({ category, societyId, limitCount = 20 }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEvents(
      (fetchedEvents) => {
        setEvents(fetchedEvents);
        setLoading(false);
      },
      { category, societyId, limitCount }
    );

    return () => unsubscribe();
  }, [category, societyId, limitCount]);

  if (loading) {
    return <EventCardSkeletonGrid count={8} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">No events found</p>
        <p className="text-sm text-muted-foreground">
          {category && `Try removing the "${category}" filter or `}
          Check back later for new events!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

