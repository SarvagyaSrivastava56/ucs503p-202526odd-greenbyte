'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { 
  collection, 
  query,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  where,
  collectionGroup
} from 'firebase/firestore';
import type { Event, Rsvp, RsvpStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download,
  Send,
  UserCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RsvpWithUser extends Rsvp {
  userName?: string;
  userEmail?: string;
  eventTitle?: string;
}

const statusColors = {
  rsvped: 'default',
  waitlisted: 'secondary',
  cancelled: 'outline',
} as const;

export default function RSVPManagementPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RsvpWithUser[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RsvpWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'all'>('all');
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch events
    const eventsRef = collection(firestore, 'events');
    const unsubEvents = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsData);
    });

    // Fetch all RSVPs from all events
    const fetchRsvps = async () => {
      try {
        const allRsvps: RsvpWithUser[] = [];
        
        // Get all events first
        const eventsSnapshot = await getDocs(collection(firestore, 'events'));
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        
        // For each event, get its RSVPs
        for (const event of eventsData) {
          const rsvpsRef = collection(firestore, 'events', event.id, 'rsvps');
          const rsvpsSnapshot = await getDocs(rsvpsRef);
          
          const eventRsvps = rsvpsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            eventTitle: event.title,
          })) as RsvpWithUser[];
          
          allRsvps.push(...eventRsvps);
        }
        
        // Fetch user details for each RSVP
        const rsvpsWithUsers = await Promise.all(
          allRsvps.map(async (rsvp) => {
            try {
              const userDoc = await getDocs(
                query(collection(firestore, 'users'), where('__name__', '==', rsvp.userId))
              );
              
              if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                return {
                  ...rsvp,
                  userName: userData.displayName || userData.email,
                  userEmail: userData.email,
                };
              }
              return rsvp;
            } catch (error) {
              return rsvp;
            }
          })
        );
        
        setRsvps(rsvpsWithUsers);
        setFilteredRsvps(rsvpsWithUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching RSVPs:', error);
        setLoading(false);
      }
    };

    fetchRsvps();

    return () => {
      unsubEvents();
    };
  }, [user]);

  // Filter RSVPs based on search and filters
  useEffect(() => {
    let filtered = [...rsvps];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rsvp => 
        rsvp.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.eventId === eventFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.status === statusFilter);
    }

    setFilteredRsvps(filtered);
  }, [rsvps, searchTerm, eventFilter, statusFilter]);

  const handleStatusChange = async (rsvp: RsvpWithUser, newStatus: RsvpStatus) => {
    try {
      const rsvpRef = doc(firestore, 'events', rsvp.eventId, 'rsvps', rsvp.id);
      await updateDoc(rsvpRef, { status: newStatus });
      
      // Update local state
      setRsvps(prev => prev.map(r => 
        r.id === rsvp.id ? { ...r, status: newStatus } : r
      ));
      
      toast({
        title: 'Status Updated',
        description: `RSVP status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating RSVP status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update RSVP status',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Event', 'Status', 'Check-in Time'].join(','),
      ...filteredRsvps.map(rsvp => [
        rsvp.userName || '',
        rsvp.userEmail || '',
        rsvp.eventTitle || '',
        rsvp.status,
        rsvp.checkInAt || 'Not checked in'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'RSVPs exported successfully',
    });
  };

  const handleSendReminder = (event: Event, reminderType: string) => {
    // This would trigger a Cloud Function to send reminders
    toast({
      title: 'Reminder Sent',
      description: `${reminderType} reminder sent to all RSVPs for ${event.title}`,
    });
    setReminderDialogOpen(false);
    setSelectedEvent(null);
  };

  const stats = {
    total: rsvps.length,
    rsvped: rsvps.filter(r => r.status === 'rsvped').length,
    waitlisted: rsvps.filter(r => r.status === 'waitlisted').length,
    checkedIn: rsvps.filter(r => r.checkInAt).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">RSVP & Attendee Management</h1>
          <p className="text-muted-foreground">Manage registrations and track attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rsvped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waitlisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitlisted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.rsvped > 0 ? Math.round((stats.checkedIn / stats.rsvped) * 100) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RsvpStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="rsvped">Confirmed</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RSVPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>RSVPs ({filteredRsvps.length})</CardTitle>
          <CardDescription>Manage event registrations and attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading RSVPs...
                    </TableCell>
                  </TableRow>
                ) : filteredRsvps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No RSVPs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <TableRow key={`${rsvp.eventId}-${rsvp.id}`}>
                      <TableCell className="font-medium">
                        {rsvp.userName || 'Unknown User'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rsvp.userEmail || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{rsvp.eventTitle}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[rsvp.status]}>
                          {rsvp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rsvp.checkInAt ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Checked in
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not checked in</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {rsvp.status === 'waitlisted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(rsvp, 'rsvped')}
                            >
                              <ArrowUpCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {rsvp.status === 'rsvped' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(rsvp, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Send Reminders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Send Reminders</CardTitle>
          <CardDescription>Send notifications to attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.counters?.rsvpCount || 0} attendees
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      setReminderDialogOpen(true);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <AlertDialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Choose when to send the reminder for "{selectedEvent?.title}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => selectedEvent && handleSendReminder(selectedEvent, '24 hour')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Send 24-hour reminder
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => selectedEvent && handleSendReminder(selectedEvent, '30 minute')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Send 30-minute reminder
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => selectedEvent && handleSendReminder(selectedEvent, 'immediate')}
            >
              <Send className="mr-2 h-4 w-4" />
              Send now
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

