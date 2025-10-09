'use client';

import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, BarChart2, Edit } from 'lucide-react';
import { CreateEventDialog } from '@/components/create-event-dialog';
import { mockEvents } from '@/lib/mock-data';
import { EventCard } from '@/components/event-card';

export default function SocietyDashboardPage() {
  const societyEvents = mockEvents.slice(0, 2); // Mock data for society's events

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline text-3xl font-bold">Society Dashboard</h1>
            <p className="text-muted-foreground">Manage your society's events and activities.</p>
          </div>
          <CreateEventDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </CreateEventDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{societyEvents.length}</div>
              <p className="text-xs text-muted-foreground">events hosted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {societyEvents.reduce((acc, event) => acc + event.participants, 0)}
              </div>
              <p className="text-xs text-muted-foreground">across all events</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Edit Society Profile</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Update your society's information.</p>
              <Button variant="outline" size="sm">Edit Profile</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="font-headline text-2xl font-semibold mb-4">Your Events</h2>
          {societyEvents.length > 0 ? (
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
      </div>
    </MainLayout>
  );
}
