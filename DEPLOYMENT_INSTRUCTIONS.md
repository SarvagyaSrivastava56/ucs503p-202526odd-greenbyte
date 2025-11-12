# Deployment Instructions for Automation System

## Quick Deploy

To deploy the automation system to production, run these commands:

```bash
# Deploy Firestore rules (REQUIRED for automation to work)
firebase deploy --only firestore:rules

# Deploy Cloud Functions (REQUIRED for emails to be sent)
cd backend
npm run build
cd ..
firebase deploy --only functions
```

## Email Configuration

Before the automation system can send emails, you need to configure email credentials:

```bash
# For Gmail users:
# 1. Enable 2-Factor Authentication on your Google account
# 2. Generate an App Password: https://myaccount.google.com/apppasswords
# 3. Set the configuration:
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password" email.from="noreply@campus-event-hub.com"

# Then deploy functions again:
firebase deploy --only functions
```

## Testing

After deployment:

1. Log in to the app
2. Navigate to `/society-dashboard/automation`
3. Create a test automation rule:
   - Name: "Send thank you email"
   - Trigger: "New RSVP received"
   - Action: "Send thank you email"
4. Have a user RSVP to one of your events
5. Check that the email was sent

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause:** Firestore rules not deployed
**Fix:** Run `firebase deploy --only firestore:rules`

### Emails Not Sending

**Causes:**
- Email credentials not configured
- Functions not deployed
- Invalid email credentials

**Fix:**
1. Check email configuration: `firebase functions:config:get`
2. Reconfigure if needed: `firebase functions:config:set email.user="..." email.password="..."`
3. Redeploy: `firebase deploy --only functions`
4. Check logs: `firebase functions:log`

### No Society Found

**Cause:** User doesn't have `societyIds` configured
**Fix:** Ensure your user document in Firestore has a `societyIds` array with at least one valid society ID

## Verification Checklist

After deployment, verify:

- ✅ Firestore rules deployed successfully
- ✅ Cloud Functions deployed successfully  
- ✅ Email configuration set
- ✅ Can access automation page without errors
- ✅ Can create automation rules
- ✅ Can enable/disable automation rules
- ✅ Emails sent when rules trigger (test with a real RSVP)

## Rollback

If something goes wrong:

```bash
# Rollback Firestore rules
firebase firestore:rules:rollback

# Rollback Functions
firebase functions:rollback
```

## Environment-Specific Notes

### Development
- Uses production Firebase by default
- Can use Firebase Emulators for local testing
- Run `firebase emulators:start` before starting frontend

### Production  
- All changes must be deployed to take effect
- Monitor function logs for errors
- Set up Cloud Function alerts

## Support

For issues:
1. Check Firebase Console for errors
2. Review function logs: `firebase functions:log`
3. Check Firestore rules are deployed correctly
4. Verify user permissions in Firestore


