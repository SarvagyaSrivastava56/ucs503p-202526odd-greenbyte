import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
import { doc, getDoc, setDoc, initializeFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
let firestore: any;
if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  firestore = initializeFirestore(app, {});
} else {
  firestore = initializeFirestore(getApps()[0], {});
}

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'google-calendar')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    const integration = integrationDoc.data();

    // Get event data
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
    
    if (!eventDoc.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };

    // Convert to Google Calendar format
    const googleEvent = googleCalendarService.convertToGoogleEvent(event);

    // Create event in Google Calendar
    const createdEvent = await googleCalendarService.createEvent(
      integration.accessToken,
      integration.calendarId,
      googleEvent
    );

    // Store Google Calendar event ID for future updates
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        googleCalendarEventId: createdEvent.id,
        googleCalendarSyncAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      googleEventId: createdEvent.id,
      eventUrl: createdEvent.htmlLink,
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync event to Google Calendar' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'google-calendar')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    const integration = integrationDoc.data();

    // Get event data
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
    
    if (!eventDoc.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };

    if (!event.googleCalendarEventId) {
      return NextResponse.json(
        { error: 'Event not synced to Google Calendar' },
        { status: 400 }
      );
    }

    // Convert to Google Calendar format
    const googleEvent = googleCalendarService.convertToGoogleEvent(event);

    // Update event in Google Calendar
    const updatedEvent = await googleCalendarService.updateEvent(
      integration.accessToken,
      integration.calendarId,
      event.googleCalendarEventId,
      googleEvent
    );

    // Update sync timestamp
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        googleCalendarSyncAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      googleEventId: updatedEvent.id,
      eventUrl: updatedEvent.htmlLink,
    });

  } catch (error) {
    console.error('Google Calendar update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event in Google Calendar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'google-calendar')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    const integration = integrationDoc.data();

    // Get event data
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
    
    if (!eventDoc.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };

    if (!event.googleCalendarEventId) {
      return NextResponse.json(
        { error: 'Event not synced to Google Calendar' },
        { status: 400 }
      );
    }

    // Delete event from Google Calendar
    await googleCalendarService.deleteEvent(
      integration.accessToken,
      integration.calendarId,
      event.googleCalendarEventId
    );

    // Remove Google Calendar event ID
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        googleCalendarEventId: null,
        googleCalendarSyncAt: null,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Event removed from Google Calendar',
    });

  } catch (error) {
    console.error('Google Calendar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove event from Google Calendar' },
      { status: 500 }
    );
  }
}
