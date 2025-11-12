'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useAppContext } from '@/context/app-context';
import { firestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCheckIn } from '@/components/qr-checkin';
import { ArrowLeft, Calendar, MapPin, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function EventCheckInPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useFirebase();
  const { currentUser } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = params.id as string;

  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(firestore, 'events', eventId);
    const unsubscribe = onSnapshot(eventRef, (snapshot) => {
      if (!snapshot.exists()) {
        setEvent(null);
      } else {
        setEvent({ id: snapshot.id, ...snapshot.data() } as Event);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  if (isUserLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!user || !currentUser || (currentUser.role !== 'society_admin' && currentUser.role !== 'super_admin')) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
          <div className="min-h-[240px] animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/society-dashboard/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Event not found or no longer available.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push('/society-dashboard/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <h1 className="font-headline text-3xl font-bold">Check-in for {event.title}</h1>
          <p className="text-muted-foreground">Scan attendee QR codes and monitor attendance in real time.</p>
        </div>
        <Badge variant="outline" className="text-sm uppercase tracking-wide">
          {event.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <QRCheckIn event={event} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Event schedule</p>
                  <p>{format(new Date(event.startAt), 'EEEE, MMM d yyyy • h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Venue</p>
                  <p>{event.venue || 'To be announced'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Check-in tips</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Ask attendees to prepare their QR code before reaching the entrance</li>
                    <li>Use the switch camera button for rear/front camera</li>
                    <li>Ensure the QR code is well lit and inside the scanning frame</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
