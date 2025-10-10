import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber, businessAccountId, accessToken } = await request.json();

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Real WhatsApp Business API Integration
    const whatsappAccessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappBusinessId = businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!whatsappAccessToken) {
      return NextResponse.json({
        error: 'WhatsApp Business API access token not configured',
        message: 'Please add WHATSAPP_ACCESS_TOKEN to environment variables',
      }, { status: 400 });
    }

    // Verify WhatsApp Business API credentials by making a test API call
    let isVerified = false;
    let businessInfo = null;

    if (whatsappAccessToken && whatsappAccessToken !== 'your-whatsapp-access-token') {
      try {
        const verifyResponse = await fetch(
          `https://graph.facebook.com/v18.0/${whatsappBusinessId || 'me'}`,
          {
            headers: {
              'Authorization': `Bearer ${whatsappAccessToken}`,
            },
          }
        );

        if (verifyResponse.ok) {
          businessInfo = await verifyResponse.json();
          isVerified = true;
        }
      } catch (verifyError) {
        console.error('WhatsApp API verification error:', verifyError);
      }
    }
    
    const integrationData = {
      phoneNumber: phoneNumber.replace(/\D/g, ''), // Remove non-digits
      businessAccountId: whatsappBusinessId || null,
      accessToken: whatsappAccessToken ? '***' : null, // Don't store full token in client-visible doc
      enabled: true,
      verified: isVerified,
      businessInfo: businessInfo ? {
        id: businessInfo.id,
        name: businessInfo.name,
      } : null,
      connectedAt: new Date().toISOString(),
      isDemo: !isVerified, // Only demo mode if not verified
    };

    // Store in Firestore
    await setDoc(
      doc(firestore, 'users', userId, 'integrations', 'whatsapp'),
      integrationData
    );

    // Store full access token securely in a separate document
    if (whatsappAccessToken && isVerified) {
      await setDoc(
        doc(firestore, 'users', userId, 'integrations', 'whatsapp_secure'),
        {
          accessToken: whatsappAccessToken,
          businessAccountId: whatsappBusinessId,
          updatedAt: new Date().toISOString(),
        }
      );
    }

    return NextResponse.json({
      success: true,
      integration: integrationData,
      message: isVerified 
        ? '✅ WhatsApp Business API connected! You can now send real messages to users.'
        : '📱 WhatsApp connected in demo mode. Add WHATSAPP_ACCESS_TOKEN for real messaging.',
    });

  } catch (error) {
    console.error('WhatsApp connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect WhatsApp' },
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
      doc(firestore, 'users', userId, 'integrations', 'whatsapp')
    );

    if (!integrationDoc.exists()) {
      return NextResponse.json({
        connected: false,
        integration: null,
      });
    }

    const integration = integrationDoc.data();

    return NextResponse.json({
      connected: true,
      integration,
    });

  } catch (error) {
    console.error('WhatsApp status error:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}
