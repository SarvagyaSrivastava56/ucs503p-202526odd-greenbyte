'use client';

import { mockEvents, mockUser } from '@/lib/mock-data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Heart,
  CalendarPlus,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-dom-confetti';
import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';

export default function EventDetailContent({ id }: { id: string }) {
  const {
    isRsvpd: isEventRsvpd,
    addRsvp,
    isFavorite,
    toggleFavorite,
  } = useAppContext();
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  const hasRsvpd = isEventRsvpd(event.id);
  const isEventFavorite = isFavorite(event.id);

  const handleRsvp = () => {
    if (hasRsvpd) return;
    addRsvp(event.id);
    setShowConfetti(true);
    toast({
      title: '🎉 RSVP Successful!',
      description: `You're going to ${event.title}.`,
    });
    setTimeout(() => setShowConfetti(false), 3000); // Reset confetti
  };

  const handleFavoriteClick = () => {
    toggleFavorite(event.id);
    toast({
      title: isEventFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${event.title} has been ${isEventFavorite ? 'removed from' : 'added to'} your favorites.`,
    });
  };

  const handleAddToCalendar = () => {
    toast({
        title: 'Added to Calendar',
        description: `${event.title} has been added to your calendar.`,
    });
  };


  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-8">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          data-ai-hint={event.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge variant="secondary" className="mb-2 backdrop-blur-sm bg-background/20 text-white border-none">{event.category}</Badge>
          <h1 className="font-headline text-3xl md:text-5xl font-bold">
            {event.title}
          </h1>
          <p className="text-lg">Hosted by {event.club}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="font-headline text-2xl font-semibold mb-4">About this event</h2>
          <p className="text-foreground/80 leading-relaxed">
            {event.description}
          </p>

          <Separator className="my-8" />

          <h2 className="font-headline text-2xl font-semibold mb-6">Live Chat</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user2/100/100" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-sm text-muted-foreground">So excited for this! 🔥</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user3/100/100" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Sam Miller</p>
                <p className="text-sm text-muted-foreground">Is anyone forming a team for the hackathon?</p>
              </div>
            </div>
             <div className="flex gap-3 items-center mt-4">
                <Avatar>
                    <AvatarImage src={mockUser.avatarUrl} />
                    <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Send className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
          </div>

        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
            <div className="flex justify-center">
                <Confetti active={showConfetti} config={confettiConfig} />
            </div>
            <Button className="w-full text-lg h-12 mb-4" onClick={handleRsvp} disabled={hasRsvpd}>
                {hasRsvpd ? "You're going!" : "RSVP Now"}
            </Button>
            <div className="flex justify-around text-center">
              <Button variant="ghost" className="flex flex-col h-auto gap-1" onClick={handleFavoriteClick}>
                <Heart className={cn("h-6 w-6", isEventFavorite && "text-destructive fill-destructive")} />
                <span>Favorite</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto gap-1" onClick={handleAddToCalendar}>
                <CalendarPlus className="h-6 w-6" />
                <span>Add to Calendar</span>
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg space-y-4">
            <h3 className="font-headline text-lg font-semibold">Details</h3>
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <Users className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{event.participants + (hasRsvpd ? 1 : 0)} people are going</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
