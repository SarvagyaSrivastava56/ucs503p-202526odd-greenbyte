
'use client';
import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import { mockEvents } from '@/lib/mock-data';
import { Separator } from './ui/separator';
import { CreateEventFab } from './create-event-fab';
import { useAppContext } from '@/context/app-context';
import React from 'react';

type DashboardContentProps = {
  trendingEvents: React.ReactNode;
  recommendedEvents: React.ReactNode;
};

export default function DashboardContent({ trendingEvents, recommendedEvents }: DashboardContentProps) {
  const { currentUser } = useAppContext();
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
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
      {currentUser?.role === 'society' && <CreateEventFab />}
    </div>
  );
}
