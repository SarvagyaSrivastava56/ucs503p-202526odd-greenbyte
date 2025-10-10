'use client';
import MainLayout from '@/components/main-layout';
import { EventCard } from '@/components/event-card';
import { AdvancedEventFilters, FilterOptions } from '@/components/advanced-event-filters';
import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/firebase-queries';
import { filterEvents } from '@/services/event-service';
import type { Event } from '@/lib/types';
import { EventCardSkeleton } from '@/components/event-card-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, History } from 'lucide-react';

export default function ExplorePage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getEvents({ limitCount: 100 });
        setAllEvents(result.events);
        setFilteredEvents(result.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleFilterChange = (filters: FilterOptions) => {
    const filtered = filterEvents(allEvents, filters);
    setFilteredEvents(filtered);
  };

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.startAt) >= new Date()
  );
  
  const pastEvents = filteredEvents.filter(
    (event) => new Date(event.startAt) < new Date()
  );

  const renderEvents = (events: Event[]) => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ));
    }

    if (events.length === 0) {
      return (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm">Try adjusting your filters or check back later</p>
        </div>
      );
    }

    return events.map((event) => <EventCard key={event.id} event={event} />);
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">Explore Events</h1>
          <p className="mt-2 text-muted-foreground">Discover what's happening on campus</p>
        </div>

        {/* Advanced Filters */}
        <AdvancedEventFilters onFilterChange={handleFilterChange} />

        {/* Tabs for All/Upcoming/Past */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Calendar className="h-4 w-4" />
              All
              <span className="ml-1 text-xs">({filteredEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Clock className="h-4 w-4" />
              Upcoming
              <span className="ml-1 text-xs">({upcomingEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History className="h-4 w-4" />
              Past
              <span className="ml-1 text-xs">({pastEvents.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {renderEvents(filteredEvents)}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {renderEvents(upcomingEvents)}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {renderEvents(pastEvents)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
