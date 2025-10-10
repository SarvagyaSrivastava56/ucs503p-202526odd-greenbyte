'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { 
  collection, 
  query,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Download,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, getHours, getDay } from 'date-fns';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AnalyticsPage() {
  const { user } = useFirebase();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(firestore, 'events');
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate analytics data
  const eventsByCategory = events.reduce((acc, event) => {
    const category = event.category;
    if (!acc[category]) {
      acc[category] = { name: category, events: 0, rsvps: 0 };
    }
    acc[category].events += 1;
    acc[category].rsvps += event.counters?.rsvpCount || 0;
    return acc;
  }, {} as Record<string, { name: string; events: number; rsvps: number }>);

  const categoryData = Object.values(eventsByCategory);

  // Event performance over time
  const eventPerformance = events.slice(0, 10).map(event => ({
    name: event.title.substring(0, 15) + '...',
    views: event.counters?.views || 0,
    rsvps: event.counters?.rsvpCount || 0,
    checkIns: event.counters?.checkIns || 0,
  }));

  // Best days heatmap data
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const eventsByDay = events.reduce((acc, event) => {
    try {
      const day = getDay(parseISO(event.startAt));
      acc[day] = (acc[day] || 0) + 1;
    } catch (e) {}
    return acc;
  }, {} as Record<number, number>);

  const bestDaysData = dayNames.map((name, index) => ({
    name,
    events: eventsByDay[index] || 0,
  }));

  // Best times heatmap data
  const eventsByHour = events.reduce((acc, event) => {
    try {
      const hour = getHours(parseISO(event.startAt));
      acc[hour] = (acc[hour] || 0) + 1;
    } catch (e) {}
    return acc;
  }, {} as Record<number, number>);

  const bestTimesData = Array.from({ length: 24 }, (_, i) => ({
    name: `${i}:00`,
    events: eventsByHour[i] || 0,
  }));

  // Conversion funnel
  const totalViews = events.reduce((acc, e) => acc + (e.counters?.views || 0), 0);
  const totalRSVPs = events.reduce((acc, e) => acc + (e.counters?.rsvpCount || 0), 0);
  const totalCheckIns = events.reduce((acc, e) => acc + (e.counters?.checkIns || 0), 0);

  const funnelData = [
    { name: 'Views', value: totalViews, percentage: 100 },
    { name: 'RSVPs', value: totalRSVPs, percentage: totalViews > 0 ? (totalRSVPs / totalViews) * 100 : 0 },
    { name: 'Check-ins', value: totalCheckIns, percentage: totalRSVPs > 0 ? (totalCheckIns / totalRSVPs) * 100 : 0 },
  ];

  // Stats
  const stats = {
    totalEvents: events.length,
    totalViews,
    totalRSVPs,
    totalCheckIns,
    avgRSVPRate: totalViews > 0 ? ((totalRSVPs / totalViews) * 100).toFixed(1) : 0,
    avgAttendanceRate: totalRSVPs > 0 ? ((totalCheckIns / totalRSVPs) * 100).toFixed(1) : 0,
  };

  const handleExport = (chartName: string) => {
    // Export functionality would go here
    alert(`Exporting ${chartName}...`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Insights and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Event page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              RSVP Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRSVPRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRSVPs.toLocaleString()} total RSVPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCheckIns.toLocaleString()} check-ins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>Views, RSVPs, and check-ins per event</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('Event Performance')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8b5cf6" name="Views" />
                <Bar dataKey="rsvps" fill="#06b6d4" name="RSVPs" />
                <Bar dataKey="checkIns" fill="#10b981" name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Events and RSVPs by category</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('Category Performance')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="events"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Days */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Best Days</CardTitle>
              <CardDescription>Events scheduled by day of week</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('Best Days')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bestDaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>From views to attendance</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('Conversion Funnel')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.name}</span>
                    <span className="text-muted-foreground">
                      {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage > 10 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {stage.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Times Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Best Times</CardTitle>
            <CardDescription>Most popular event start times</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport('Best Times')}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bestTimesData.filter(d => d.events > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="events" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated insights from your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Strong RSVP Rate</h4>
              <p className="text-sm text-muted-foreground">
                Your RSVP conversion rate of {stats.avgRSVPRate}% is above average
              </p>
            </div>
          </div>
          
          {categoryData.length > 0 && (
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Top Category</h4>
                <p className="text-sm text-muted-foreground">
                  {categoryData.sort((a, b) => b.events - a.events)[0].name} is your most popular category with {categoryData.sort((a, b) => b.events - a.events)[0].events} events
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <UserCheck className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Attendance Rate</h4>
              <p className="text-sm text-muted-foreground">
                {stats.avgAttendanceRate}% of RSVPs actually attend your events
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

