'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainLayout from '@/components/main-layout';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import type { Event as EventType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  List,
  Grid,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventType;
}

export default function CalendarPage() {
  const { user } = useFirebase();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for events
    const eventsRef = collection(firestore, 'events');
    const eventsQuery = query(
      eventsRef,
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EventType[];
      
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Transform events for calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startAt),
      end: new Date(event.endAt),
      resource: event,
    }));
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setDialogOpen(true);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const categoryColors: Record<string, string> = {
      Music: '#8b5cf6',
      Tech: '#06b6d4',
      Art: '#f59e0b',
      Sports: '#10b981',
      Workshop: '#ec4899',
      Social: '#ef4444',
      Conference: '#6366f1',
      Party: '#f97316',
      Networking: '#14b8a6',
    };

    const backgroundColor = categoryColors[event.resource.category] || '#6366f1';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = toolbar.date;
      return (
        <span className="font-semibold text-lg">
          {format(date, 'MMMM yyyy')}
        </span>
      );
    };

    return (
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="ml-4">{label()}</div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="month">
                <Grid className="h-4 w-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="week">
                <List className="h-4 w-4 mr-2" />
                Week
              </TabsTrigger>
              <TabsTrigger value="day">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Day
              </TabsTrigger>
              <TabsTrigger value="agenda">
                <List className="h-4 w-4 mr-2" />
                Agenda
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view calendar</h2>
          <p className="text-muted-foreground mb-4">
            Log in to see all campus events in calendar view
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline text-3xl font-bold">Event Calendar</h1>
            <p className="text-muted-foreground">View all campus events in calendar format</p>
          </div>
          {user.role === 'society_admin' && (
            <Link href="/society-dashboard/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          )}
        </div>

        {/* Calendar Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => {
                  const eventDate = new Date(e.startAt);
                  return eventDate.getMonth() === date.getMonth() && 
                         eventDate.getFullYear() === date.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(events.map(e => e.category)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.capacity, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="calendar-container" style={{ height: '700px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                view={view}
                date={date}
                eventPropGetter={eventStyleGetter}
                components={{
                  toolbar: CustomToolbar,
                }}
                popup
                selectable
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold mb-2">
                        {selectedEvent.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{selectedEvent.category}</Badge>
                        <Badge variant={selectedEvent.isPaid ? 'default' : 'secondary'}>
                          {selectedEvent.isPaid ? `$${selectedEvent.price}` : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Event Banner */}
                  {selectedEvent.bannerUrl && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
                      <img 
                        src={selectedEvent.bannerUrl} 
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(selectedEvent.startAt), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedEvent.startAt), 'h:mm a')} - {format(new Date(selectedEvent.endAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{selectedEvent.venue}</p>
                        {selectedEvent.isOnline && selectedEvent.link && (
                          <a 
                            href={selectedEvent.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Join Online
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {selectedEvent.counters?.rsvpCount || 0} / {selectedEvent.capacity} attending
                        </p>
                        <div className="w-full bg-secondary rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ 
                              width: `${((selectedEvent.counters?.rsvpCount || 0) / selectedEvent.capacity) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">About this event</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Link href={`/events/${selectedEvent.id}`} className="flex-1">
                      <Button className="w-full">
                        View Full Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        
        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          font-size: 0.875rem;
          border-bottom: 2px solid hsl(var(--border));
          background: hsl(var(--muted));
        }
        
        .rbc-today {
          background-color: hsl(var(--accent));
        }
        
        .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3);
        }
        
        .rbc-event {
          padding: 2px 5px;
          cursor: pointer;
        }
        
        .rbc-event:hover {
          opacity: 1 !important;
        }
        
        .rbc-month-view,
        .rbc-time-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
        }
        
        .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
        }
        
        .rbc-agenda-view {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .rbc-agenda-table {
          border: 1px solid hsl(var(--border));
        }
        
        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          padding: 12px;
        }
        
        .rbc-selected-cell {
          background-color: hsl(var(--accent));
        }
      `}</style>
    </MainLayout>
  );
}

