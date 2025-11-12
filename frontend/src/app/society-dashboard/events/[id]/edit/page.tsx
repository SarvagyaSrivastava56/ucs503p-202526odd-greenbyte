'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '@/context/app-context';
import { QRCheckIn } from '@/components/qr-checkin';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useFirebase();
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    isOnline: false,
    onlineLink: '',
    startAt: '',
    endAt: '',
    capacity: '',
    isPaid: false,
    price: '',
    tags: '',
  });

  const eventId = params.id as string;

  // Check authentication and role
  if (isUserLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !currentUser || (currentUser.role !== 'society_admin' && currentUser.role !== 'super_admin')) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const eventRef = doc(firestore, 'events', eventId);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
          setEvent(eventData);
          
          // Populate form with existing data
          setFormData({
            title: eventData.title || '',
            description: eventData.description || '',
            category: eventData.category || '',
            venue: eventData.venue || '',
            isOnline: eventData.isOnline || false,
            onlineLink: eventData.onlineLink || '',
            startAt: eventData.startAt ? format(parseISO(eventData.startAt), "yyyy-MM-dd'T'HH:mm") : '',
            endAt: eventData.endAt ? format(parseISO(eventData.endAt), "yyyy-MM-dd'T'HH:mm") : '',
            capacity: eventData.capacity?.toString() || '',
            isPaid: eventData.isPaid || false,
            price: eventData.price?.toString() || '',
            tags: eventData.tags?.join(', ') || '',
          });
        } else {
          toast({
            title: 'Event Not Found',
            description: 'The event you are trying to edit does not exist.',
            variant: 'destructive',
          });
          router.push('/society-dashboard/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    try {
      const eventRef = doc(firestore, 'events', event.id);
      
      const updateData = {
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
        price: formData.isPaid ? parseFloat(formData.price) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        updatedAt: serverTimestamp(),
      };

      await updateDoc(eventRef, updateData);
      
      toast({
        title: 'Event Updated',
        description: 'Your event has been successfully updated.',
      });
      
      router.push('/society-dashboard/events');
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
          <p className="text-gray-600 mt-2">The event you are looking for does not exist.</p>
          <Button onClick={() => router.push('/society-dashboard/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/society-dashboard/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="font-headline text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a href={`/events/${event.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Networking">Networking</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start Date & Time *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => handleInputChange('startAt', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endAt">End Date & Time *</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => handleInputChange('endAt', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOnline"
                  checked={formData.isOnline}
                  onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isOnline">This is an online event</Label>
              </div>
              
              {formData.isOnline ? (
                <div className="space-y-2">
                  <Label htmlFor="onlineLink" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Online Link *
                  </Label>
                  <Input
                    id="onlineLink"
                    value={formData.onlineLink}
                    onChange={(e) => handleInputChange('onlineLink', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="venue" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Venue *
                  </Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Enter venue name or address"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="100"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={formData.isPaid}
                      onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isPaid">Paid Event</Label>
                  </div>
                  
                  {formData.isPaid && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/society-dashboard/events')}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{event.counters?.views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RSVPs</span>
                <span className="font-medium">{event.counters?.rsvpCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-ins</span>
                <span className="font-medium">{event.counters?.checkIns || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Event Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.bannerUrl ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={event.bannerUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No banner image</p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Change Banner
              </Button>
            </CardContent>
          </Card>

          {/* QR Check-in */}
          <Card>
            <CardHeader>
              <CardTitle>QR Check-in</CardTitle>
              <CardDescription>Scan attendee QR codes to verify and check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <QRCheckIn event={event} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
