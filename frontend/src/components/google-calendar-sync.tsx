'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';

interface GoogleCalendarSyncProps {
  event: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    venue?: string;
    isOnline: boolean;
    link?: string;
    bannerUrl?: string;
  };
}

export function GoogleCalendarSync({ event }: GoogleCalendarSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAppContext();

  const syncToGoogleCalendar = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to sync events to Google Calendar',
        variant: 'destructive',
      });
      return;
    }

    setSyncing(true);

    try {
      const response = await fetch('/api/integrations/google-calendar/sync-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          eventId: event.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSynced(true);
        toast({
          title: '🎉 Event Synced!',
          description: `"${event.title}" has been added to your Google Calendar`,
        });
      } else {
        throw new Error(data.error || 'Failed to sync event');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync event to Google Calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Google Calendar Sync
        </CardTitle>
        <CardDescription>
          Add this event to your Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {synced ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Event synced to Google Calendar</span>
          </div>
        ) : (
          <Button
            onClick={syncToGoogleCalendar}
            disabled={syncing}
            className="w-full"
            variant="outline"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing to Google Calendar...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync to Google Calendar
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
