# How to Upgrade Firebase to Blaze Plan

## Quick Steps

1. **Go to Firebase Console**: https://console.firebase.google.com/project/studio-827010330-91b76/usage/details

2. **Click "Modify Plan"** or "Upgrade to Blaze"

3. **Follow the prompts**:
   - Enter payment information (Google account)
   - Accept terms
   - Confirm upgrade

4. **Wait for activation** (usually instant)

## What is the Blaze Plan?

### Blaze (Pay-As-You-Go)
- **Free tier included**: $0/month base
- **Only pay for what you use** beyond free tier
- Required for Cloud Functions (email sending)
- Free tier covers most small-scale usage

### Free Tier Limits (included with Blaze)
- **Cloud Functions**: 
  - 2 million invocations/month
  - 400,000 GB-seconds memory
  - 200,000 CPU-seconds
  
- **Firestore**:
  - 1 GB storage
  - 50,000 reads/day
  - 20,000 writes/day

### Email Sending Costs
Most email sending will be **FREE**:
- First 1,200 emails/month: FREE
- After that: ~$0.02 per 1,000 emails

**For a campus app**: You'll likely stay within free tiers!

## After Upgrade

Once upgraded:

1. **Deploy functions** (now they'll work):
```bash
firebase deploy --only functions
```

2. **Configure email**:
```bash
firebase functions:config:set email.user="your@email.com" email.password="app-password"
firebase deploy --only functions
```

3. **Test**:
   - Create an automation rule
   - Have someone RSVP
   - Check email sent!

## Cost Estimation

For a typical campus event hub:
- **Month 1-6**: ~$0-2/month (within free tiers)
- **Active campus**: ~$5-15/month
- **Very active**: ~$20-50/month

Most small apps: **Under $10/month**

## Why Blaze?

Required for:
- ✅ Cloud Functions (automation emails)
- ✅ Cloud Functions (team invite emails)
- ✅ Scheduled functions (reminders)
- ✅ Email sending capabilities

## Safety

- Can downgrade anytime
- Google shows usage and costs clearly
- Free tier is generous
- Can set budget alerts

## Alternative

If you don't want to upgrade yet:
- Automation UI works
- No real emails sent
- Can test locally with emulators
- Upgrade when ready for production

## Need Help?

- Firebase Console: https://console.firebase.google.com
- Pricing Details: https://firebase.google.com/pricing
- Support: Firebase Support Chat


