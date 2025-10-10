import { NextRequest, NextResponse } from 'next/server';
import { linktreeService } from '@/lib/linktree';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

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
      doc(firestore, 'users', userId, 'integrations', 'linktree')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Linktree not connected' },
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

    // Sync event to Linktree
    const linktreeLink = await linktreeService.syncEventToLinktree(
      integration.accessToken,
      integration.profileId,
      event,
      event.linktreeLinkId // Check if already synced
    );

    // Store Linktree link ID for future updates
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        linktreeLinkId: linktreeLink.id,
        linktreeSyncAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      linktreeLink,
      linkUrl: `${integration.profile.url}/${linktreeLink.id}`,
    });

  } catch (error) {
    console.error('Linktree sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync event to Linktree' },
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
      doc(firestore, 'users', userId, 'integrations', 'linktree')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Linktree not connected' },
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

    if (!event.linktreeLinkId) {
      return NextResponse.json(
        { error: 'Event not synced to Linktree' },
        { status: 400 }
      );
    }

    // Update event in Linktree
    const updatedLink = await linktreeService.syncEventToLinktree(
      integration.accessToken,
      integration.profileId,
      event,
      event.linktreeLinkId
    );

    // Update sync timestamp
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        linktreeSyncAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      linktreeLink: updatedLink,
      linkUrl: `${integration.profile.url}/${updatedLink.id}`,
    });

  } catch (error) {
    console.error('Linktree update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event in Linktree' },
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
      doc(firestore, 'users', userId, 'integrations', 'linktree')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'Linktree not connected' },
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

    if (!event.linktreeLinkId) {
      return NextResponse.json(
        { error: 'Event not synced to Linktree' },
        { status: 400 }
      );
    }

    // Delete link from Linktree
    await linktreeService.deleteLink(
      integration.accessToken,
      integration.profileId,
      event.linktreeLinkId
    );

    // Remove Linktree link ID
    await setDoc(
      doc(firestore, 'events', eventId),
      {
        linktreeLinkId: null,
        linktreeSyncAt: null,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Event removed from Linktree',
    });

  } catch (error) {
    console.error('Linktree delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove event from Linktree' },
      { status: 500 }
    );
  }
}
