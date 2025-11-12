'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Scan,
  UserCheck,
  Mail,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Event } from '@/lib/types';
import { EventCheckInScanner } from '@/components/event-checkin-scanner';
import { format } from 'date-fns';

interface QRCheckInProps {
  event: Event;
}

type RecentCheckIn = {
  id: string;
  name: string;
  email: string;
  time: string;
  alreadyCheckedIn: boolean;
};

export function QRCheckIn({ event }: QRCheckInProps) {
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);

  const handleCheckIn = (attendee: RecentCheckIn) => {
    setRecentCheckIns((prev) => [attendee, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instructions">
            <QrCode className="mr-2 h-4 w-4" />
            Attendee QR Codes
          </TabsTrigger>
          <TabsTrigger value="scanner">
            <Scan className="mr-2 h-4 w-4" />
            Check-in Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How attendee QR codes work</CardTitle>
              <CardDescription>
                Each attendee receives a unique QR code when they RSVP to your event. They can access it from the event
                detail page or their confirmation email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Attendee workflow</p>
                    <ul className="mt-2 space-y-2 list-disc pl-5">
                      <li>RSVP to the event from the public event page</li>
                      <li>Open the RSVP confirmation dialog and save the QR code</li>
                      <li>Present the QR code at the entrance for quick validation</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Need to share codes manually?</p>
                    <p className="mt-2">
                      You can download the RSVP list from the export tools and distribute QR codes to attendees if needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{event.counters?.checkIns || 0}</div>
                  <p className="text-sm text-muted-foreground">Total check-ins</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{event.counters?.rsvpCount || 0}</div>
                  <p className="text-sm text-muted-foreground">Total RSVPs</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">
                    {event.counters?.rsvpCount
                      ? Math.round(((event.counters?.checkIns || 0) / event.counters.rsvpCount) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-muted-foreground">Attendance rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan attendee QR codes</CardTitle>
              <CardDescription>
                Use your device camera to validate and register attendee arrivals in real time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EventCheckInScanner eventId={event.id} onCheckIn={handleCheckIn} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent check-ins</CardTitle>
              <CardDescription>Latest attendees who scanned their QR code</CardDescription>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No check-ins yet. Start scanning QR codes to see attendees here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCheckIns.map((entry) => (
                    <div
                      key={`${entry.id}-${entry.time}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">{entry.email || 'No email on file'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={entry.alreadyCheckedIn ? 'secondary' : 'default'} className="mb-1">
                          {entry.alreadyCheckedIn ? 'Already checked in' : 'Checked in'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.time), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

