'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  Users, 
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { CreateEventDialog } from '@/components/create-event-dialog';
import { EventCard } from '@/components/event-card';
import { EventCardSkeleton } from '@/components/event-card-skeleton';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, isToday } from 'date-fns';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  draftEvents: number;
  totalRSVPs: number;
  rsvpsThisWeek: number;
  totalCheckIns: number;
  waitlistedCount: number;
}

export default function SocietyDashboardPage() {
  const { user } = useFirebase();
  const [societyEvents, setSocietyEvents] = useState<Event[]>([]);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    draftEvents: 0,
    totalRSVPs: 0,
    rsvpsThisWeek: 0,
    totalCheckIns: 0,
    waitlistedCount: 0,
  });
  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for events
    const eventsRef = collection(firestore, 'events');
    const eventsQuery = query(
      eventsRef,
      orderBy('startAt', 'desc')
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      // Filter events for today
      const today = events.filter(event => {
        try {
          return isToday(parseISO(event.startAt));
        } catch {
          return false;
        }
      });
      
      // Calculate stats
      const upcoming = events.filter(e => {
        try {
          return new Date(e.startAt) > now && e.status === 'published';
        } catch {
          return false;
        }
      });
      
      const drafts = events.filter(e => e.status === 'draft');
      
      const totalRSVPs = events.reduce((acc, e) => acc + (e.counters?.rsvpCount || 0), 0);
      const totalCheckIns = events.reduce((acc, e) => acc + (e.counters?.checkIns || 0), 0);
      
      setStats({
        totalEvents: events.length,
        upcomingEvents: upcoming.length,
        draftEvents: drafts.length,
        totalRSVPs,
        rsvpsThisWeek: 0, // Would need RSVPs collection to calculate
        totalCheckIns,
        waitlistedCount: 0, // Would need RSVPs collection to calculate
      });
      
      setSocietyEvents(events.slice(0, 6)); // Show recent 6 events
      setTodayEvents(today);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-6 space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/society-dashboard/announcements">
            <Button variant="outline">
              <Megaphone className="mr-2 h-4 w-4" />
              Announce
            </Button>
          </Link>
          <CreateEventDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CreateEventDialog>
        </div>
      </div>

      {/* Today's Events Alert */}
      {todayEvents.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Events ({todayEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <Link 
                  key={event.id} 
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(event.startAt), 'h:mm a')} • {event.venue}
                    </p>
                  </div>
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draftEvents} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RSVPs This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRSVPs}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Total across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.waitlistedCount} waitlisted
            </p>
          </CardContent>
        </Card>

        
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-2xl font-semibold">Recent Events</h2>
          <Link href="/society-dashboard/events">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : societyEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {societyEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center text-muted-foreground bg-background/60 p-12 rounded-lg border-2 border-dashed">
            <CardHeader>
              <CardTitle>No Events Yet</CardTitle>
              <CardDescription>Create your first event to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateEventDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </CreateEventDialog>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. RSVPs/Event</span>
                <span className="font-medium">
                  {stats.totalEvents > 0 
                    ? Math.round(stats.totalRSVPs / stats.totalEvents) 
                    : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Attendance Rate</span>
                <span className="font-medium">
                  {stats.totalRSVPs > 0 
                    ? Math.round((stats.totalCheckIns / stats.totalRSVPs) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/society-dashboard/events/new">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </Link>
            <Link href="/society-dashboard/rsvps">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Manage RSVPs
              </Button>
            </Link>
            <Link href="/society-dashboard/analytics">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="font-medium">New RSVPs</p>
                  <p className="text-muted-foreground text-xs">
                    {stats.totalRSVPs} total registrations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="font-medium">Events Published</p>
                  <p className="text-muted-foreground text-xs">
                    {stats.upcomingEvents} upcoming
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5"></div>
                <div>
                  <p className="font-medium">Draft Events</p>
                  <p className="text-muted-foreground text-xs">
                    {stats.draftEvents} need attention
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
