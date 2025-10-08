'use client';
import MainLayout from '@/components/main-layout';
import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import { mockEvents } from '@/lib/mock-data';

export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="font-headline text-3xl font-bold">Explore Events</h1>
        <p className="mt-2 text-muted-foreground mb-6">Discover what's happening on campus.</p>
        <EventFilters />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
