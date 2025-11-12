'use client';

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
import { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { getEvent } from '@/lib/firebase-queries';
import { doc, setDoc, deleteDoc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { createRsvp, cancelRsvp } from '@/lib/rsvp';
import { SponsorAdModal } from '@/components/sponsor-ad-modal';

type ChatMessage = {
  user: {
    name: string;
    avatar: string;
  };
  message: string;
};

const initialMessages: ChatMessage[] = [
    {
      user: { name: 'Jane Doe', avatar: 'https://picsum.photos/seed/user2/100/100' },
      message: 'So excited for this! 🔥',
    },
    {
      user: { name: 'Sam Miller', avatar: 'https://picsum.photos/seed/user3/100/100' },
      message: 'Is anyone forming a team for the hackathon?',
    },
];

export default function EventDetailContent({ id }: { id: string }) {
  const { currentUser } = useAppContext();
  const { user } = useFirebase();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasRsvpd, setHasRsvpd] = useState(false);
  const [isEventFavorite, setIsEventFavorite] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { toast } = useToast();

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(id);
        if (!eventData) {
          notFound();
        }
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Check RSVP status
  useEffect(() => {
    if (!user || !id) return;
    
    const rsvpRef = doc(firestore, 'users', user.uid, 'rsvps', id);
    const unsubscribe = onSnapshot(rsvpRef, (doc) => {
      setHasRsvpd(doc.exists() && doc.data()?.status === 'rsvped');
    });

    return () => unsubscribe();
  }, [user, id]);

  // Check favorite status
  useEffect(() => {
    if (!user || !id) return;
    
    const favoriteRef = doc(firestore, 'users', user.uid, 'favorites', id);
    const unsubscribe = onSnapshot(favoriteRef, (doc) => {
      setIsEventFavorite(doc.exists());
    });

    return () => unsubscribe();
  }, [user, id]);

  // Listen to chat messages
  useEffect(() => {
    if (!id) return;

    const messagesRef = collection(firestore, 'events', id, 'chat');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const chatMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          user: { name: data.userName, avatar: data.userAvatar },
          message: data.message,
        };
      });
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [id]);

  const performRsvp = async () => {
    if (!user || !event || hasRsvpd || isRsvping) return;

    setIsRsvping(true);
    try {
      const result = await createRsvp(user.uid, event.id);
      setShowConfetti(true);
      
      if (result.status === 'waitlisted') {
        toast({
          title: '📋 Added to Waitlist',
          description: `Event is at capacity. You've been added to the waitlist for ${event.title}.`,
        });
      } else {
        toast({
          title: '🎉 RSVP Successful!',
          description: `You're going to ${event.title}.`,
        });
      }
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'RSVP Failed',
        description: error.message || 'Failed to RSVP. Please try again.',
      });
    } finally {
      setIsRsvping(false);
    }
  };

  const handleRsvpClick = () => {
    if (!event || hasRsvpd || isRsvping) {
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to RSVP to this event.',
      });
      return;
    }

    if (event.sponsorAd?.videoUrl) {
      setShowSponsorModal(true);
      return;
    }

    void performRsvp();
  };

  const handleWithdraw = async () => {
    if (!user || !event || isCancelling) return;

    setIsCancelling(true);
    try {
      await cancelRsvp(user.uid, event.id);
      setHasRsvpd(false);
      toast({
        title: 'RSVP Withdrawn',
        description: `You have withdrawn your registration for ${event.title}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Withdraw Failed',
        description: error?.message || 'Failed to withdraw. Please try again.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user || !event) return;

    try {
      const favoriteRef = doc(firestore, 'users', user.uid, 'favorites', event.id);
      
      if (isEventFavorite) {
        await deleteDoc(favoriteRef);
        toast({
          title: 'Removed from Favorites',
          description: `${event.title} has been removed from your favorites.`,
        });
      } else {
        await setDoc(favoriteRef, {
          eventId: event.id,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Added to Favorites',
          description: `${event.title} has been added to your favorites.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
      });
    }
  };

  const handleAddToCalendar = () => {
    toast({
        title: 'Added to Calendar',
        description: `${event.title} has been added to your calendar.`,
    });
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !event) return;

    try {
      const messagesRef = collection(firestore, 'events', event.id, 'chat');
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        message: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }


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
  
  const userInitials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('') || 'U';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-8">
        {event.bannerUrl && (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
            data-ai-hint={event.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge variant="secondary" className="mb-2 backdrop-blur-sm bg-background/20 text-white border-none">{event.category}</Badge>
          <h1 className="font-headline text-3xl md:text-5xl font-bold">
            {event.title}
          </h1>
          <p className="text-lg">Hosted by a society</p>
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
            {messages.map((chat, index) => (
              <div key={index} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={chat.user.avatar} />
                  <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">{chat.user.name}</p>
                  <p className="text-sm text-muted-foreground">{chat.message}</p>
                </div>
              </div>
            ))}

            {user && (
              <form onSubmit={handleSendMessage} className="flex gap-3 items-center mt-4">
                <Avatar>
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                    <Input 
                      placeholder="Type a message..." 
                      className="pr-12"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Send className="h-4 w-4"/>
                    </Button>
                </div>
              </form>
            )}
          </div>

        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
            <div className="flex justify-center">
                <Confetti active={showConfetti} config={confettiConfig} />
            </div>
            {hasRsvpd ? (
              <div className="flex gap-3">
                <Button className="flex-1 text-lg h-12" disabled>
                  You're going!
                </Button>
                <Button variant="outline" className="flex-1 text-lg h-12" onClick={handleWithdraw} disabled={isCancelling}>
                  {isCancelling ? 'Withdrawing...' : 'Withdraw'}
                </Button>
              </div>
            ) : (
              <Button className="w-full text-lg h-12 mb-4" onClick={handleRsvpClick} disabled={isRsvping}>
                { isRsvping ? 'Processing...' : (user ? 'RSVP Now' : 'Login to RSVP') }
              </Button>
            )}
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
                <p className="font-semibold">{new Date(event.startAt).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{new Date(event.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <Users className="h-5 w-5 mt-1 text-primary" />
              <div>
                <p className="font-semibold">{(event.counters?.rsvpCount || 0) + (hasRsvpd ? 1 : 0)} people are going</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {event?.sponsorAd?.videoUrl && (
        <SponsorAdModal
          ad={event.sponsorAd}
          open={showSponsorModal}
          onContinue={() => {
            setShowSponsorModal(false);
            void performRsvp();
          }}
        />
      )}
    </div>
  );
}
