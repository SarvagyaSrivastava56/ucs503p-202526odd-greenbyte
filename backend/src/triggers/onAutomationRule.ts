import * as admin from 'firebase-admin';
import { createEmailTransporter, sendEmail, renderEmailTemplate } from '../services/email-service';

/**
 * Executes automation rules when triggered
 */
export async function executeAutomationRule(
  rule: admin.firestore.DocumentData,
  triggerData: {
    eventId: string;
    eventData?: admin.firestore.DocumentData;
    userId?: string;
    userData?: admin.firestore.DocumentData;
    actionType: 'rsvp_created' | 'check_in' | 'capacity_reached';
  }
): Promise<void> {
  const db = admin.firestore();

  try {
    console.log(`Executing automation rule: ${rule.name} (${rule.action})`);

    switch (rule.action) {
      case 'send_email':
        await executeSendEmail(rule, triggerData, db);
        break;
      case 'send_notification':
        await executeSendNotification(rule, triggerData, db);
        break;
      case 'close_registration':
        await executeCloseRegistration(rule, triggerData, db);
        break;
      case 'open_waitlist':
        await executeOpenWaitlist(rule, triggerData, db);
        break;
      case 'send_thank_you':
        await executeSendThankYou(rule, triggerData, db);
        break;
      default:
        console.warn(`Unknown automation action: ${rule.action}`);
    }
  } catch (error) {
    console.error(`Failed to execute automation rule ${rule.name}:`, error);
    throw error;
  }
}

/**
 * Execute send_email action
 */
async function executeSendEmail(
  rule: admin.firestore.DocumentData,
  triggerData: any,
  db: admin.firestore.Firestore
): Promise<void> {
  if (!triggerData.userData) {
    console.error('No user data provided for send_email action');
    return;
  }

  const userEmail = triggerData.userData.email;
  if (!userEmail) {
    console.error('User email not found');
    return;
  }

  // Get event data if available
  let eventData = triggerData.eventData;
  if (!eventData && triggerData.eventId) {
    const eventDoc = await db.collection('events').doc(triggerData.eventId).get();
    if (eventDoc.exists) {
      eventData = eventDoc.data();
    }
  }

  // Get society data
  const societyId = triggerData.eventData?.societyId || eventData?.societyId;
  let societyData = null;
  if (societyId) {
    const societyDoc = await db.collection('societies').doc(societyId).get();
    if (societyDoc.exists) {
      societyData = societyDoc.data();
    }
  }

  const transporter = createEmailTransporter();
  
  const emailTemplate = rule.config?.emailTemplate || `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>{{eventTitle}}</h2>
      <p>Dear {{userName}},</p>
      {{body}}
      <p>Best regards,<br>{{societyName}}</p>
    </div>
  `;

  const formattedDate = eventData?.startAt
    ? new Date(eventData.startAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const htmlBody = renderEmailTemplate(rule.config?.body || 'Thank you for your participation!', {
    userName: triggerData.userData.displayName || triggerData.userData.name || 'Participant',
    eventTitle: eventData?.title || '',
    eventDescription: eventData?.description || '',
    eventDate: formattedDate,
    eventVenue: eventData?.venue || '',
    eventLink: triggerData.eventId ? `https://your-app.com/events/${triggerData.eventId}` : '',
    societyName: societyData?.name || '',
  });

  const emailHtml = renderEmailTemplate(emailTemplate, {
    userName: triggerData.userData.displayName || triggerData.userData.name || 'Participant',
    eventTitle: eventData?.title || '',
    eventDescription: eventData?.description || '',
    eventDate: formattedDate,
    eventVenue: eventData?.venue || '',
    eventLink: triggerData.eventId ? `https://your-app.com/events/${triggerData.eventId}` : '',
    societyName: societyData?.name || '',
  }).replace('{{body}}', htmlBody);

  await sendEmail(transporter, {
    to: userEmail,
    subject: rule.config?.subject || `${eventData?.title || 'Event'} - Confirmation`,
    html: emailHtml,
  });
}

/**
 * Execute send_thank_you action
 */
async function executeSendThankYou(
  rule: admin.firestore.DocumentData,
  triggerData: any,
  db: admin.firestore.Firestore
): Promise<void> {
  // Get user data
  let userData = triggerData.userData;
  if (!userData && triggerData.userId) {
    const userDoc = await db.collection('users').doc(triggerData.userId).get();
    if (userDoc.exists) {
      userData = userDoc.data();
    }
  }

  if (!userData?.email) {
    console.error('User email not found');
    return;
  }

  // Get event data
  let eventData = triggerData.eventData;
  if (!eventData && triggerData.eventId) {
    const eventDoc = await db.collection('events').doc(triggerData.eventId).get();
    if (eventDoc.exists) {
      eventData = eventDoc.data();
    }
  }

  // Get society data
  const societyId = triggerData.eventData?.societyId || eventData?.societyId;
  let societyData = null;
  if (societyId) {
    const societyDoc = await db.collection('societies').doc(societyId).get();
    if (societyDoc.exists) {
      societyData = societyDoc.data();
    }
  }

  const transporter = createEmailTransporter();
  
  const formattedDate = eventData?.startAt
    ? new Date(eventData.startAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Thank You for Registering!</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">Dear ${userData.displayName || userData.name || 'Participant'},</p>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Thank you for registering for <strong style="color: #2563eb;">${eventData?.title || 'the event'}</strong>.
        </p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; color: #555; margin: 10px 0;"><strong>Event Details:</strong></p>
          <ul style="font-size: 16px; color: #555; line-height: 1.8;">
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Venue:</strong> ${eventData?.venue || 'TBA'}</li>
          </ul>
        </div>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          We look forward to seeing you there! If you have any questions, feel free to reach out to us.
        </p>
        <p style="font-size: 16px; color: #555; margin-top: 30px;">
          Best regards,<br>
          <strong>${societyData?.name || 'Event Team'}</strong>
        </p>
      </div>
    </div>
  `;

  await sendEmail(transporter, {
    to: userData.email,
    subject: `Thank You for Registering: ${eventData?.title || 'Event'}`,
    html: htmlBody,
  });
}

/**
 * Execute send_notification action (FCM push notification)
 */
async function executeSendNotification(
  rule: admin.firestore.DocumentData,
  triggerData: any,
  db: admin.firestore.Firestore
): Promise<void> {
  if (!triggerData.userId) {
    console.error('No user ID provided for send_notification action');
    return;
  }

  const userDoc = await db.collection('users').doc(triggerData.userId).get();
  if (!userDoc.exists) {
    console.error(`User ${triggerData.userId} not found`);
    return;
  }

  const userData = userDoc.data();
  const deviceTokens = userData?.deviceTokens || [];

  if (deviceTokens.length === 0) {
    console.log(`No device tokens found for user ${triggerData.userId}`);
    return;
  }

  // Get event data
  let eventData = triggerData.eventData;
  if (!eventData && triggerData.eventId) {
    const eventDoc = await db.collection('events').doc(triggerData.eventId).get();
    if (eventDoc.exists) {
      eventData = eventDoc.data();
    }
  }

  const message: admin.messaging.MulticastMessage = {
    tokens: deviceTokens,
    notification: {
      title: rule.config?.subject || 'Event Update',
      body: rule.config?.body || 'You have an event update',
    },
    data: {
      eventId: triggerData.eventId || '',
      type: 'automation',
      ruleId: rule.id || '',
    },
    android: {
      priority: 'high',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  console.log(`Notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
}

/**
 * Execute close_registration action
 */
async function executeCloseRegistration(
  rule: admin.firestore.DocumentData,
  triggerData: any,
  db: admin.firestore.Firestore
): Promise<void> {
  if (!triggerData.eventId) {
    console.error('No event ID provided for close_registration action');
    return;
  }

  await db.collection('events').doc(triggerData.eventId).update({
    status: 'archived',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Registration closed for event ${triggerData.eventId}`);
}

/**
 * Execute open_waitlist action
 */
async function executeOpenWaitlist(
  rule: admin.firestore.DocumentData,
  triggerData: any,
  db: admin.firestore.Firestore
): Promise<void> {
  if (!triggerData.eventId) {
    console.error('No event ID provided for open_waitlist action');
    return;
  }

  const eventRef = db.collection('events').doc(triggerData.eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    console.error(`Event ${triggerData.eventId} not found`);
    return;
  }

  // Note: Waitlist is a UI concept, we might store a flag on the event
  console.log(`Waitlist opened for event ${triggerData.eventId}`);
}

