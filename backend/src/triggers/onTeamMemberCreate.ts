import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createEmailTransporter, sendEmail } from '../services/email-service';

/**
 * Triggered when a team member is created/invited.
 * Sends an invitation email to the new team member.
 */
export const onTeamMemberCreate = functions.firestore
  .document('societies/{societyId}/team/{memberId}')
  .onCreate(async (snap, context) => {
    const memberData = snap.data();
    const { societyId } = context.params;
    const db = admin.firestore();

    try {
      // Only send email if status is pending (new invitation)
      if (memberData.status !== 'pending') {
        console.log('Not a pending invitation, skipping email');
        return;
      }

      console.log(`Sending team invitation to ${memberData.email} for society ${societyId}`);

      // Get society data
      const societyDoc = await db.collection('societies').doc(societyId).get();
      const societyData = societyDoc.exists ? societyDoc.data() : null;
      const societyName = societyData?.name || 'the team';

      // Get inviter data
      let inviterName = 'Team Admin';
      if (memberData.invitedBy) {
        const inviterDoc = await db.collection('users').doc(memberData.invitedBy).get();
        if (inviterDoc.exists) {
          const inviterData = inviterDoc.data();
          inviterName = inviterData?.displayName || inviterData?.name || 'Team Admin';
        }
      }

      const transporter = createEmailTransporter();

      // Create invitation email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">You've been invited to join ${societyName}!</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Dear ${memberData.email},
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              ${inviterName} has invited you to join <strong>${societyName}</strong> as a <strong>${memberData.role}</strong>.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 14px; color: #555; margin: 0;"><strong>Your Role:</strong> ${memberData.role}</p>
              <p style="font-size: 14px; color: #555; margin: 5px 0 0 0;">
                ${getRoleDescription(memberData.role)}
              </p>
            </div>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Please log in to your Campus Event Hub account to accept this invitation.
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://your-app.com/login" style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Log In to Accept
              </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #555; margin-top: 20px;">
              Best regards,<br>
              <strong>The Campus Event Hub Team</strong>
            </p>
          </div>
        </div>
      `;

      await sendEmail(transporter, {
        to: memberData.email,
        subject: `You've been invited to join ${societyName}`,
        html: emailHtml,
      });

      console.log(`Invitation email sent successfully to ${memberData.email}`);
    } catch (error) {
      console.error('Error sending team invitation email:', error);
      // Don't throw - we don't want failed emails to prevent team member creation
    }
  });

/**
 * Get role description for email
 */
function getRoleDescription(role: string): string {
  const descriptions: { [key: string]: string } = {
    'owner': 'Full access to all features and settings',
    'admin': 'Can manage events, team members, and settings',
    'editor': 'Can create and edit events',
    'check-in-only': 'Can only check-in attendees at events',
  };
  return descriptions[role] || 'Team member';
}


