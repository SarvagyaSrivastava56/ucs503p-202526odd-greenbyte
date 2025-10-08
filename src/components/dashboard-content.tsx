import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import RecommendedEvents from '@/components/recommended-events';
import TrendingEvents from '@/components/trending-events';
import { mockEvents, mockUser } from '@/lib/mock-data';
import { Separator } from './ui/separator';
import { CreateEventFab } from './create-event-fab';

export default function DashboardContent() {
  const user = mockUser;
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">
        Welcome to CampusConnect!
      </h1>
      
      <TrendingEvents />

      <Separator className="my-8" />
      
      <RecommendedEvents />

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
      {user.role === 'admin' && <CreateEventFab />}
    </div>
  );
}
