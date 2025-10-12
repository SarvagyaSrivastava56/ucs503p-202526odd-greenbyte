import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId, recipients, message } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'whatsapp')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'WhatsApp not connected' },
        { status: 400 }
      );
    }

    const integration = integrationDoc.data();

    // Get secure token if not in demo mode
    let accessToken = null;
    let businessAccountId = integration.businessAccountId;
    if (!integration.isDemo) {
      const secureDoc = await getDoc(
        doc(firestore, 'users', userId, 'integrations', 'whatsapp_secure')
      );
      if (secureDoc.exists()) {
        const secureData = secureDoc.data();
        accessToken = secureData.accessToken;
        businessAccountId = secureData.businessAccountId || businessAccountId;
      }
    }

    // Get event data
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
    
    if (!eventDoc.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };

    // Create share message
    const shareMessage = message || whatsappService.createEventShareMessage(event);

    const results = {
      total: recipients?.length || 1,
      sent: 0,
      failed: 0,
      shareUrls: [] as string[],
      errors: [] as string[],
    };

    if (recipients && recipients.length > 0) {
      // Send to multiple recipients
      for (const phoneNumber of recipients) {
        try {
          if (integration.isDemo || !accessToken) {
            // In demo mode, just generate share URLs
            const shareUrl = whatsappService.generateWebShareUrl(phoneNumber, shareMessage);
            results.shareUrls.push(shareUrl);
            results.sent++;
          } else {
            // Send via real WhatsApp Business API
            const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
            if (!phoneId) {
              throw new Error('WHATSAPP_PHONE_NUMBER_ID not configured');
            }

            const sendResponse = await fetch(
              `https://graph.facebook.com/v18.0/${phoneId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: phoneNumber.replace(/\D/g, ''),
                  type: 'text',
                  text: { body: shareMessage },
                }),
              }
            );

            if (sendResponse.ok) {
              results.sent++;
            } else {
              const errorData = await sendResponse.json();
              results.failed++;
              results.errors.push(`Failed to send to ${phoneNumber}: ${errorData.error?.message || 'Unknown error'}`);
            }
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Error sending to ${phoneNumber}: ${error}`);
        }
      }
    } else {
      // Generate single share URL
      const shareUrl = whatsappService.generateWebShareUrl(
        integration.phoneNumber || '1234567890',
        shareMessage
      );
      results.shareUrls.push(shareUrl);
      results.sent = 1;
    }

    return NextResponse.json({
      success: true,
      results,
      message: integration.isDemo 
        ? 'Share URLs generated (demo mode)'
        : `${results.sent} messages sent successfully`,
    });

  } catch (error) {
    console.error('WhatsApp share error:', error);
    return NextResponse.json(
      { error: 'Failed to share event via WhatsApp' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationDoc = await getDoc(
      doc(firestore, 'users', userId, 'integrations', 'whatsapp')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json(
        { error: 'WhatsApp not connected' },
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

    // Create share message
    const shareMessage = whatsappService.createEventShareMessage(event);

    // Generate share URLs
    const webShareUrl = whatsappService.generateWebShareUrl(
      integration.phoneNumber || '1234567890',
      shareMessage
    );

    const mobileShareUrl = whatsappService.generateMobileShareUrl(
      integration.phoneNumber || '1234567890',
      shareMessage
    );

    return NextResponse.json({
      success: true,
      shareUrls: {
        web: webShareUrl,
        mobile: mobileShareUrl,
      },
      message: shareMessage,
      isDemo: integration.isDemo,
    });

  } catch (error) {
    console.error('WhatsApp share URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp share URLs' },
      { status: 500 }
    );
  }
}
