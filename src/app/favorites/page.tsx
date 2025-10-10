'use client';
import MainLayout from '@/components/main-layout';
import { EventCard } from '@/components/event-card';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Event } from '@/lib/types';
import { Info } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { EventCardSkeleton } from '@/components/event-card-skeleton';
import { getEvent } from '@/lib/firebase-queries';

export default function FavoritesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's favorite event IDs from their favorites subcollection
        const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
        const favoritesSnap = await getDocs(favoritesRef);
        
        const eventIds = favoritesSnap.docs.map(doc => doc.id);
        
        if (eventIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch the actual events
        const eventPromises = eventIds.map(id => getEvent(id));
        const fetchedEvents = await Promise.all(eventPromises);
        
        // Filter out null values (in case some events don't exist)
        setEvents(fetchedEvents.filter(e => e !== null) as Event[]);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">Favorites</h1>
        <p className="mt-2 text-muted-foreground">Your favorite events.</p>
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
            <h2 className="text-xl font-semibold">No Favorites Yet</h2>
            <p>Click the heart icon on an event to save it here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
