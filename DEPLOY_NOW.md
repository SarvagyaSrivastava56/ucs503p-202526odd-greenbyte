# 🚀 Deploy Automation System to Production

Run these commands in your terminal to deploy the automation system:

## Step 1: Login to Firebase

```bash
firebase login
```

Follow the prompts to authenticate.

## Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This will update your Firestore security rules to allow automation rules.

## Step 3: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will deploy your automation functions to Firebase.

## Step 4: Configure Email (Optional but recommended)

After deploying functions, configure email credentials:

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password" email.from="noreply@campus-event-hub.com"

# Then redeploy functions:
firebase deploy --only functions
```

## Step 5: Verify

1. Go to your app: http://localhost:3000/society-dashboard/automation
2. The permissions error should be gone
3. You should be able to create automation rules

## Notes

- **Gmail App Passwords**: If using Gmail, you need to:
  1. Enable 2-Factor Authentication
  2. Generate an App Password: https://myaccount.google.com/apppasswords
  3. Use that password in the config

- **Testing**: After deployment, test by:
  1. Creating an automation rule
  2. Having a user RSVP to an event
  3. Checking if the email is sent

## Troubleshooting

If you see "Failed to authenticate":
- Run `firebase logout` then `firebase login` again

If functions fail to deploy:
- Check `backend/lib` exists (run `cd backend && npm run build`)
- Check Firebase project is linked (run `firebase use`)

## Success Checklist

- [ ] Firebase login successful
- [ ] Firestore rules deployed
- [ ] Functions deployed
- [ ] No permissions errors on automation page
- [ ] Can create automation rules
- [ ] Test automation works (optional)


