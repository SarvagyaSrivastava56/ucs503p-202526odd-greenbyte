import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
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
    const tokens = await googleCalendarService.exchangeCodeForTokens(code);
    
    // Get user's primary calendar
    const calendars = await googleCalendarService.getCalendars(tokens.access_token);
    const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];

    if (!primaryCalendar) {
      return NextResponse.json(
        { error: 'No calendar found' },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      integration: integrationData,
      calendar: primaryCalendar,
    });

  } catch (error) {
    console.error('Google Calendar connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Google Calendar' },
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
      doc(firestore, 'users', userId, 'integrations', 'google-calendar')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json({
        connected: false,
        integration: null,
      });
    }

    const integration = integrationDoc.data();

    // Check if token is expired
    const isExpired = Date.now() > integration.expiresAt;
    
    if (isExpired) {
      try {
        // Refresh token
        const newTokens = await googleCalendarService.refreshAccessToken(
          integration.refreshToken
        );

        // Update tokens
        await setDoc(
          doc(firestore, 'users', userId, 'integrations', 'google-calendar'),
          {
            ...integration,
            accessToken: newTokens.access_token,
            expiresAt: Date.now() + (newTokens.expires_in * 1000),
          },
          { merge: true }
        );

        integration.accessToken = newTokens.access_token;
        integration.expiresAt = Date.now() + (newTokens.expires_in * 1000);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return NextResponse.json({
          connected: false,
          integration: null,
          error: 'Token expired and refresh failed',
        });
      }
    }

    return NextResponse.json({
      connected: true,
      integration,
    });

  } catch (error) {
    console.error('Google Calendar status error:', error);
    return NextResponse.json(
      { error: 'Failed to get Google Calendar status' },
      { status: 500 }
    );
  }
}
