import { NextRequest, NextResponse } from 'next/server';
import { linktreeService } from '@/lib/linktree';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { userId, code, state } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await linktreeService.exchangeCodeForTokens(code);
    
    // Get user's profile
    const profile = await linktreeService.getProfile(tokens.access_token);

    // Save integration settings
    const integrationData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      profileId: profile.id,
      enabled: true,
      autoSync: false,
      connectedAt: new Date().toISOString(),
      profile: {
        id: profile.id,
        username: profile.username,
        title: profile.title,
        description: profile.description,
        url: profile.url,
        avatar: profile.avatar,
      },
    };

    await setDoc(
      doc(firestore, 'users', userId, 'integrations', 'linktree'),
      integrationData
    );

    return NextResponse.json({
      success: true,
      integration: integrationData,
    });

  } catch (error) {
    console.error('Linktree connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Linktree' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get integration status
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'linktree')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json({
        connected: false,
        integration: null,
      });
    }

    const integration = integrationDoc.data();

    // Get current links to show sync status
    try {
      const links = await linktreeService.getLinks(
        integration.accessToken,
        integration.profileId
      );
      
      integration.links = links;
    } catch (error) {
      console.error('Error fetching links:', error);
      integration.links = [];
    }

    return NextResponse.json({
      connected: true,
      integration,
    });

  } catch (error) {
    console.error('Linktree status error:', error);
    return NextResponse.json(
      { error: 'Failed to get Linktree status' },
      { status: 500 }
    );
  }
}
