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

    // For demo purposes, we'll store the integration without actual API verification
    // In production, you'd verify the WhatsApp Business API credentials
    
    const integrationData = {
      phoneNumber: phoneNumber.replace(/\D/g, ''), // Remove non-digits
      businessAccountId: businessAccountId || null,
      accessToken: accessToken || null,
      enabled: true,
      connectedAt: new Date().toISOString(),
      // Demo mode flag
      isDemo: true, // Always demo mode for presentation
    };

    await setDoc(
      doc(firestore, 'users', userId, 'integrations', 'whatsapp'),
      integrationData
    );

    return NextResponse.json({
      success: true,
      integration: integrationData,
      message: 'WhatsApp connected in demo mode! Generate share URLs instantly.',
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
