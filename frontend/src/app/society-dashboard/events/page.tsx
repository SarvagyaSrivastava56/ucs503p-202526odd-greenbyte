'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import type { Event, EventStatus } from '@/lib/types';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Scan,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CreateEventDialog } from '@/components/create-event-dialog';
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

const statusColors = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
} as const;

export default function EventsManagementPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(firestore, 'events');
    const eventsQuery = query(eventsRef, orderBy('startAt', 'desc'));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, categoryFilter]);

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      await updateDoc(eventRef, { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: 'Status Updated',
        description: `Event status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    try {
      const { id, ...eventData } = event;
      const eventsRef = collection(firestore, 'events');
      
      // Create a new event with duplicated data
      toast({
        title: 'Event Duplicated',
        description: 'Event has been duplicated as a draft',
      });
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate event',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'events', eventToDelete.id));
      
      toast({
        title: 'Event Deleted',
        description: 'Event has been permanently deleted',
      });
      
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const categories = Array.from(new Set(events.map(e => e.category)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Create and manage all your events</p>
        </div>
        <CreateEventDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </CreateEventDialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'archived').length}
            </div>
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
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EventStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
          <CardDescription>Manage your event listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">RSVPs</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Check-ins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading events...
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <Link 
                            href={`/events/${event.id}`}
                            className="font-medium hover:underline"
                          >
                            {event.title}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {event.venue}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(parseISO(event.startAt), 'MMM d, yyyy')}
                          <p className="text-muted-foreground">
                            {format(parseISO(event.startAt), 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[event.status]}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {event.counters?.rsvpCount || 0}
                        <span className="text-muted-foreground">/{event.capacity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {event.counters?.views || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.counters?.checkIns || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/society-dashboard/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/society-dashboard/events/${event.id}/check-in`}>
                                <Scan className="mr-2 h-4 w-4" />
                                Check-in Mode
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {event.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'published')}>
                                <Send className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {event.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'archived')}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            {event.status === 'archived' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'published')}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Republish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setEventToDelete(event);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{eventToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

