import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Flame,
} from 'lucide-react';
import type { Event } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20">
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative">
          <Image
            src={event.imageUrl}
            alt={event.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
            data-ai-hint={event.imageHint}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {event.isTrending && (
              <Badge variant="destructive" className="flex items-center gap-1 backdrop-blur-sm bg-destructive/80">
                <Flame className="h-3 w-3" />
                Trending
              </Badge>
            )}
            <Badge variant="secondary" className="backdrop-blur-sm bg-secondary/80">{event.category}</Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <Link href={`/events/${event.id}`} className="block">
            <h3 className="font-headline text-lg font-semibold leading-tight mb-2 truncate">
              {event.title}
            </h3>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Heart className="h-5 w-5 text-muted-foreground hover:text-destructive hover:fill-destructive transition-colors" />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.participants} going</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
