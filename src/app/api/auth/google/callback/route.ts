import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
import { doc, setDoc, getDoc, initializeFirestore } from 'firebase/firestore';
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
    const tokens = await googleCalendarService.exchangeCodeForTokens(code);
    
    // Get user's primary calendar
    const calendars = await googleCalendarService.getCalendars(tokens.access_token);
    const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];

    if (!primaryCalendar) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=no_calendar_found`);
    }

    // Save integration settings
    const integrationData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      calendarId: primaryCalendar.id,
      enabled: true,
      connectedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(firestore, 'users', userId, 'integrations', 'google-calendar'),
      integrationData
    );

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?success=google_calendar_connected`);

  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/society-dashboard/settings?error=connection_failed`);
  }
}
