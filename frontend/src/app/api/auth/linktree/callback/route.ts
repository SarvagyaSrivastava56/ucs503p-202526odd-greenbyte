import { NextRequest, NextResponse } from 'next/server';
import { linktreeService } from '@/lib/linktree';
import { doc, setDoc, initializeFirestore } from 'firebase/firestore';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=missing_parameters`);
    }

    // Parse state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
    } catch (error) {
      console.error('Error parsing state:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=invalid_state`);
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

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?success=linktree_connected`);

  } catch (error) {
    console.error('Linktree callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=connection_failed`);
  }
}
