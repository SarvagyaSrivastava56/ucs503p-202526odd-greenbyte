import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return new NextResponse(
        `<html><body>
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: '${error}' }, '*');
            window.close();
          </script>
          <p>Authorization failed: ${error}</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return new NextResponse(
        `<html><body>
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: 'missing_params' }, '*');
            window.close();
          </script>
          <p>Missing authorization parameters</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Parse state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
    } catch (error) {
      console.error('Error parsing state:', error);
      return new NextResponse(
        `<html><body>
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: 'invalid_state' }, '*');
            window.close();
          </script>
          <p>Invalid state parameter</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.exchangeCodeForTokens(code);
    
    // Get user's primary calendar
    const calendars = await googleCalendarService.getCalendars(tokens.access_token);
    const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];

    if (!primaryCalendar) {
      return new NextResponse(
        `<html><body>
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: 'no_calendar_found' }, '*');
            window.close();
          </script>
          <p>No calendar found</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
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

    // Return success page that closes popup and notifies parent
    return new NextResponse(
      `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <script>
          window.opener.postMessage({ type: 'oauth_success', integration: 'google-calendar' }, '*');
          window.close();
        </script>
        <h2>✅ Success!</h2>
        <p>Google Calendar has been connected successfully.</p>
        <p>You can close this window.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return new NextResponse(
      `<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <script>
          window.opener.postMessage({ type: 'oauth_error', error: 'connection_failed' }, '*');
          window.close();
        </script>
        <h2>❌ Error</h2>
        <p>Authorization failed due to server error</p>
        <p>You can close this window.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
