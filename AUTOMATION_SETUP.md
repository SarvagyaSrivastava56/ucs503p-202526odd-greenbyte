# Automation System Setup Guide

## Overview

The automation system allows society admins to set up rules that automatically perform actions based on triggers. Currently supports:

- **Triggers**: RSVP created, Check-in, Capacity reached
- **Actions**: Send thank you email, Send email, Send notification, Close registration, Open waitlist

## Backend Implementation

### Email Configuration

The system uses Nodemailer for sending emails. To configure email sending:

1. Set environment variables in Firebase Functions config:
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.from="noreply@campus-event-hub.com"
```

For Gmail, you'll need to:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use that App Password in the configuration

### Firestore Structure

Automation rules are stored in subcollections under societies:
```
societies/{societyId}/automations/{ruleId}
```

Each rule has:
- `name`: Display name
- `trigger`: One of: rsvp_created, check_in, capacity_reached, before_event, after_event
- `action`: One of: send_thank_you, send_email, send_notification, close_registration, open_waitlist
- `enabled`: Boolean flag
- `config`: Object containing action-specific settings (email subject, body, etc.)
- `createdAt`, `updatedAt`, `createdBy`: Metadata fields

### How It Works

1. When an RSVP is created/updated/deleted, the `onRsvpWrite` Cloud Function triggers
2. It checks for enabled automation rules matching the trigger type
3. For each matching rule, it executes the configured action

### Email Templates

The system supports email templates with placeholders:
- `{{userName}}` - User's display name
- `{{eventTitle}}` - Event title
- `{{eventDescription}}` - Event description
- `{{eventDate}}` - Formatted event date
- `{{eventVenue}}` - Event venue
- `{{eventLink}}` - Link to event
- `{{societyName}}` - Society name

Default "thank you" email template is built-in with professional styling.

## Frontend Implementation

### Accessing Automation Page

Navigate to: `/society-dashboard/automation`

### Creating a Rule

1. Enter rule name (e.g., "Send thank you email")
2. Select trigger (when the rule should run)
3. Select action (what should happen)
4. If action is email-based, configure:
   - Email subject
   - Email body (with placeholders)
5. Click "Create Automation"

### Managing Rules

- Toggle rule on/off using the switch
- Delete rule using the trash icon
- Rules are synchronized in real-time across all users

## Testing

To test the automation system:

1. **Setup**:
   - Ensure you have a society admin account with `societyIds` configured
   - Configure email credentials in Firebase Functions

2. **Create a Rule**:
   - Go to automation page
   - Create a rule: "Send thank you email" with trigger "New RSVP received"
   - Use action "Send thank you email"

3. **Test**:
   - Create an event as the society admin
   - Have another user RSVP to the event
   - Check that email is sent to the RSVPed user

4. **Deploy**:
   ```bash
   cd backend
   npm run build
   firebase deploy --only functions
   ```

## Deployment Notes

1. **Build the backend**:
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy Cloud Functions**:
   ```bash
   firebase deploy --only functions
   ```

3. **Update Firestore Rules** (if changes were made):
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Environment Variables**: Make sure to set email configuration in Firebase:
   ```bash
   firebase functions:config:set email.user="YOUR_EMAIL" email.password="YOUR_PASSWORD"
   firebase deploy --only functions
   ```

## Security Considerations

- Only society admins can create/manage automation rules
- Email credentials are stored securely in Firebase Functions config
- Firestore security rules prevent unauthorized access to automation data

## Future Enhancements

Potential improvements:
- Time-based triggers (before/after event)
- More email template options
- SMS notifications
- Integration with external services
- A/B testing for email templates
- Analytics on automation effectiveness


