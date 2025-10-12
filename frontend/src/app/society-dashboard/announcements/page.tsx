'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { 
  collection, 
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone,
  Send,
  Calendar,
  Users,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  societyId: string;
  title: string;
  body: string;
  targets: string[];
  scheduledAt?: string;
  createdAt: any;
  sentAt?: string;
}

export default function AnnouncementsPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>(['all']);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    if (!user) return;

    const announcementsRef = collection(firestore, 'announcements');
    const announcementsQuery = query(announcementsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      
      setAnnouncements(announcementsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendAnnouncement = async () => {
    if (!title || !body) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const announcementsRef = collection(firestore, 'announcements');
      
      const announcementData = {
        societyId: user?.societyIds?.[0] || 'default',
        title,
        body,
        targets: targetAudience,
        createdAt: serverTimestamp(),
        ...(isScheduled && scheduleTime ? { 
          scheduledAt: new Date(scheduleTime).toISOString() 
        } : { 
          sentAt: new Date().toISOString() 
        }),
      };

      await addDoc(announcementsRef, announcementData);

      toast({
        title: 'Success',
        description: isScheduled 
          ? 'Announcement scheduled successfully' 
          : 'Announcement sent successfully',
      });

      // Reset form
      setTitle('');
      setBody('');
      setTargetAudience(['all']);
      setScheduleTime('');
      setIsScheduled(false);
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to send announcement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTarget = (target: string) => {
    if (target === 'all') {
      setTargetAudience(['all']);
    } else {
      const newTargets = targetAudience.includes('all') 
        ? [target] 
        : targetAudience.includes(target)
          ? targetAudience.filter(t => t !== target)
          : [...targetAudience, target];
      
      setTargetAudience(newTargets.length === 0 ? ['all'] : newTargets);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Announcements & Messaging</h1>
          <p className="text-muted-foreground">Send notifications to your followers</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Announcement Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Create Announcement
            </CardTitle>
            <CardDescription>
              Send push notifications to your event attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Write your announcement message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                {body.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={targetAudience.includes('all')}
                    onCheckedChange={() => toggleTarget('all')}
                  />
                  <label htmlFor="all" className="text-sm cursor-pointer">
                    All Followers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rsvps"
                    checked={targetAudience.includes('rsvps')}
                    onCheckedChange={() => toggleTarget('rsvps')}
                  />
                  <label htmlFor="rsvps" className="text-sm cursor-pointer">
                    Event RSVPs Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category"
                    checked={targetAudience.includes('category')}
                    onCheckedChange={() => toggleTarget('category')}
                  />
                  <label htmlFor="category" className="text-sm cursor-pointer">
                    By Category/Interest
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                />
                <Label htmlFor="schedule" className="cursor-pointer">
                  Schedule for later
                </Label>
              </div>
              
              {isScheduled && (
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={handleSendAnnouncement}
              disabled={loading}
            >
              <Send className="mr-2 h-4 w-4" />
              {isScheduled ? 'Schedule Announcement' : 'Send Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">{announcements.filter(a => a.sentAt).length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold">{announcements.filter(a => a.scheduledAt && !a.sentAt).length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Reach</p>
                    <p className="text-2xl font-bold">~500</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <p>Keep messages concise and actionable</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <p>Include event details and timing</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <p>Schedule reminders 24h and 30m before events</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <p>Target specific audiences for better engagement</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcement History */}
      <Card>
        <CardHeader>
          <CardTitle>Announcement History</CardTitle>
          <CardDescription>Recent notifications sent to your followers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No announcements sent yet
              </div>
            ) : (
              announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <Badge variant={announcement.sentAt ? 'default' : 'secondary'}>
                        {announcement.sentAt ? 'Sent' : 'Scheduled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.body}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {announcement.targets.join(', ')}
                      </span>
                      <span>
                        {announcement.sentAt 
                          ? `Sent ${format(new Date(announcement.sentAt), 'MMM d, h:mm a')}`
                          : announcement.scheduledAt 
                            ? `Scheduled for ${format(new Date(announcement.scheduledAt), 'MMM d, h:mm a')}`
                            : 'Date unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

