'use client';
import MainLayout from '@/components/main-layout';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { mockEvents } from '@/lib/mock-data';
import { Info } from 'lucide-react';

export default function MyEventsPage() {
  const { rsvpEvents } = useAppContext();
  const events = mockEvents.filter(event => rsvpEvents.includes(event.id));

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">My Events</h1>
        <p className="mt-2 text-muted-foreground">Events you have RSVPed to.</p>
        {events.length > 0 ? (
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
