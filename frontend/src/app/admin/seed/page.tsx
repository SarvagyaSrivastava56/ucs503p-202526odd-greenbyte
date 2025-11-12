'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { Loader2, Database, Trash2 } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sampleEvents = [
    {
      title: 'Starlight Concert Series',
      description: 'Join us for an evening of live music under the stars. Featuring local bands and artists from our campus. Bring your friends and a blanket for a memorable night of tunes and good vibes.',
      bannerUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&h=800',
      category: 'Music',
      venue: 'Main Quad',
      isOnline: false,
      capacity: 200,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-1',
      counters: { rsvpCount: 28, views: 150, checkIns: 0 },
    },
    {
      title: 'Tech Workshop: AI Fundamentals',
      description: 'Learn the basics of artificial intelligence and machine learning in this hands-on workshop. Perfect for beginners! No prior experience needed.',
      bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=800',
      category: 'Tech',
      venue: 'Computer Lab 2',
      isOnline: false,
      capacity: 50,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-2',
      counters: { rsvpCount: 15, views: 80, checkIns: 0 },
    },
    {
      title: 'Art Exhibition: Student Showcase',
      description: 'Explore creative works from our talented student artists. Paintings, sculptures, digital art, and more. Reception with refreshments included.',
      bannerUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=800',
      category: 'Art',
      venue: 'Fine Arts Gallery',
      isOnline: false,
      capacity: 100,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-3',
      counters: { rsvpCount: 42, views: 200, checkIns: 0 },
    },
    {
      title: 'Basketball Tournament Finals',
      description: 'The championship game is here! Come cheer for your favorite team as they battle for the trophy. Expect high-flying dunks and thrilling plays.',
      bannerUrl: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=1200&h=800',
      category: 'Sports',
      venue: 'University Gymnasium',
      isOnline: false,
      capacity: 300,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-4',
      counters: { rsvpCount: 180, views: 450, checkIns: 0 },
    },
    {
      title: 'Career Fair 2025',
      description: 'Meet recruiters from top companies in various fields. A great opportunity to land an internship or job. Bring your resume and dress to impress.',
      bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800',
      category: 'Networking',
      venue: 'Student Union Ballroom',
      isOnline: false,
      capacity: 250,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-5',
      counters: { rsvpCount: 95, views: 320, checkIns: 0 },
    },
    {
      title: 'Yoga & Meditation Workshop',
      description: 'Start your wellness journey with guided yoga and meditation sessions. All levels welcome. Mats provided.',
      bannerUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800',
      category: 'Workshop',
      venue: 'Recreation Center',
      isOnline: false,
      capacity: 40,
      isPaid: false,
      status: 'published',
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      societyId: 'society-1',
      counters: { rsvpCount: 22, views: 90, checkIns: 0 },
    },
  ];

  const seedDatabase = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      
      for (const event of sampleEvents) {
        await addDoc(collection(firestore, 'events'), {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        successCount++;
      }

      toast({
        title: '🎉 Success!',
        description: `Created ${successCount} sample events. Go check out the Explore page!`,
      });
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create events. Check console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(firestore, 'events');
      const querySnapshot = await getDocs(eventsRef);
      
      let deletedCount = 0;
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(firestore, 'events', document.id));
        deletedCount++;
      }

      toast({
        title: '🗑️ All Events Deleted!',
        description: `Removed ${deletedCount} events from the database.`,
      });
    } catch (error: any) {
      console.error('Error clearing events:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to clear events. Check console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Database Seeder</CardTitle>
          </div>
          <CardDescription>
            Populate your database with sample events for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What will be created:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{sampleEvents.length} sample events across different categories</li>
              <li>Events scheduled for the next 2 weeks</li>
              <li>Realistic event details and images</li>
              <li>Sample RSVP counts and view statistics</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              onClick={seedDatabase}
              disabled={loading}
              size="lg"
              className="w-full text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Events...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" />
                  Seed Database
                </>
              )}
            </Button>

            <Button
              onClick={clearAllEvents}
              disabled={loading}
              variant="destructive"
              size="lg"
              className="w-full text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Clearing Events...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear All Events
                </>
              )}
            </Button>

            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const eventsRef = collection(firestore, 'events');
                  const q = query(eventsRef, where('title', '==', 'Career Fair 2024'));
                  const querySnapshot = await getDocs(q);

                  if (!querySnapshot.empty) {
                    for (const document of querySnapshot.docs) {
                      const eventId = document.id;
                      const eventRef = doc(firestore, 'events', eventId);
                      await updateDoc(eventRef, {
                        title: 'Career Fair 2025'
                      });
                    }
                    toast({
                      title: 'Success!',
                      description: 'Updated "Career Fair 2024" to "Career Fair 2025"',
                    });
                  } else {
                    toast({
                      title: 'Not Found',
                      description: 'No "Career Fair 2024" event found to update',
                      variant: 'destructive',
                    });
                  }
                } catch (error) {
                  console.error('Error updating event:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to update event',
                    variant: 'destructive',
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full text-lg"
            >
              Update Career Fair 2024 → 2025
            </Button>

            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const eventsRef = collection(firestore, 'events');
                  const querySnapshot = await getDocs(eventsRef);
                  
                  // Group events by title to find duplicates
                  const eventsByTitle = new Map();
                  const duplicates = [];

                  querySnapshot.forEach((doc) => {
                    const eventData = doc.data();
                    const title = eventData.title;
                    
                    if (eventsByTitle.has(title)) {
                      // This is a duplicate
                      duplicates.push({ id: doc.id, title, data: eventData });
                    } else {
                      eventsByTitle.set(title, { id: doc.id, data: eventData });
                    }
                  });

                  if (duplicates.length === 0) {
                    toast({
                      title: 'No Duplicates Found',
                      description: 'All events are unique!',
                    });
                  } else {
                    // Delete duplicates (keep the first occurrence)
                    let deletedCount = 0;
                    for (const duplicate of duplicates) {
                      await deleteDoc(doc(firestore, 'events', duplicate.id));
                      deletedCount++;
                    }
                    
                    toast({
                      title: 'Duplicates Removed!',
                      description: `Deleted ${deletedCount} duplicate events`,
                    });
                  }
                } catch (error) {
                  console.error('Error removing duplicates:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to remove duplicates',
                    variant: 'destructive',
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full text-lg"
            >
              Remove Duplicate Events
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>This will add sample events to Firestore.</p>
              <p className="mt-1">
                After seeding, go to{' '}
                <a href="/explore" className="text-primary hover:underline">
                  Explore Page
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



