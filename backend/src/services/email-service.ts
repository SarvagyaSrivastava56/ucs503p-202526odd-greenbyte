import * as nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Creates and returns an email transporter
 * Uses Gmail SMTP by default
 */
export function createEmailTransporter(config?: EmailConfig): nodemailer.Transporter {
  if (config) {
    return nodemailer.createTransport(config);
  }

  // Try to use Gmail with app password from environment
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (emailUser && emailPassword) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  // Fallback: Use a mock transporter for development
  console.warn('Email credentials not configured. Using mock transporter.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user',
      pass: 'ethereal.pass',
    },
  });
}

/**
 * Sends an email using nodemailer
 */
export async function sendEmail(
  transporter: nodemailer.Transporter,
  options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }
): Promise<void> {
  try {
    await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM || 'noreply@campus-event-hub.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Renders an email template with event and user data
 */
export function renderEmailTemplate(
  template: string,
  data: {
    userName?: string;
    eventTitle?: string;
    eventDescription?: string;
    eventDate?: string;
    eventVenue?: string;
    eventLink?: string;
    societyName?: string;
  }
): string {
  let rendered = template;

  // Replace placeholders
  rendered = rendered.replace(/\{\{userName\}\}/g, data.userName || 'Participant');
  rendered = rendered.replace(/\{\{eventTitle\}\}/g, data.eventTitle || '');
  rendered = rendered.replace(/\{\{eventDescription\}\}/g, data.eventDescription || '');
  rendered = rendered.replace(/\{\{eventDate\}\}/g, data.eventDate || '');
  rendered = rendered.replace(/\{\{eventVenue\}\}/g, data.eventVenue || '');
  rendered = rendered.replace(/\{\{eventLink\}\}/g, data.eventLink || '');
  rendered = rendered.replace(/\{\{societyName\}\}/g, data.societyName || '');

  return rendered;
}

/**
 * Default templates for common automation actions
 */
export const defaultEmailTemplates = {
  thankYou: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank You for Registering!</h2>
      <p>Dear {{userName}},</p>
      <p>Thank you for registering for <strong>{{eventTitle}}</strong>.</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> {{eventDate}}</li>
        <li><strong>Venue:</strong> {{eventVenue}}</li>
      </ul>
      <p>We look forward to seeing you there!</p>
      <p>Best regards,<br>{{societyName}}</p>
    </div>
  `,

  checkInConfirmation: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Check-In Confirmed</h2>
      <p>Dear {{userName}},</p>
      <p>You have successfully checked in to <strong>{{eventTitle}}</strong>.</p>
      <p>Enjoy the event!</p>
      <p>Best regards,<br>{{societyName}}</p>
    </div>
  `,

  eventReminder: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Event Reminder</h2>
      <p>Dear {{userName}},</p>
      <p>This is a reminder that <strong>{{eventTitle}}</strong> is coming up soon!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> {{eventDate}}</li>
        <li><strong>Venue:</strong> {{eventVenue}}</li>
      </ul>
      <p>See you there!</p>
      <p>Best regards,<br>{{societyName}}</p>
    </div>
  `,
};


