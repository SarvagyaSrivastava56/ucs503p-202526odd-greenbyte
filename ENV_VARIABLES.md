# Environment Variables Reference

Complete list of all environment variables used in the UniConnect project.

## 📋 Frontend Environment Variables (NEXT_PUBLIC_*)

These variables are exposed to the browser and must be prefixed with `NEXT_PUBLIC_`.

### Firebase Configuration (Required)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Optional
```env
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id  # For Google Analytics
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key           # For push notifications
NEXT_PUBLIC_FIREBASE_EMULATORS=true                     # For local development (use Firebase emulators)
```

### Application Configuration
```env
NEXT_PUBLIC_APP_URL=https://rad-profiterole-4ece65.netlify.app  # Your app URL (for OAuth callbacks)
```

### Integration Keys (Public)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id       # For Google Calendar integration
NEXT_PUBLIC_LINKTREE_CLIENT_ID=your_linktree_client_id   # For Linktree integration
```

---

## 🔒 Backend Environment Variables (Cloud Functions)

These variables are server-side only and should be set in Firebase Cloud Functions environment.

### Email Service
```env
EMAIL_USER=your_email@gmail.com              # Gmail address for sending emails
EMAIL_PASSWORD=your_app_password             # Gmail app password (not regular password)
EMAIL_FROM=noreply@campus-event-hub.com      # Default sender email (optional)
```

### Google Calendar Integration (Server-side)
```env
GOOGLE_CLIENT_SECRET=your_google_client_secret  # For OAuth flow
```

### Linktree Integration (Server-side)
```env
LINKTREE_CLIENT_ID=your_linktree_client_id      # Linktree OAuth client ID
LINKTREE_CLIENT_SECRET=your_linktree_secret     # Linktree OAuth client secret
```

### WhatsApp Integration (Optional)
```env
WHATSAPP_VERIFY_TOKEN=your_verify_token              # For webhook verification
WHATSAPP_ACCESS_TOKEN=your_access_token              # WhatsApp Business API token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### AI/Genkit (Optional)
```env
GOOGLE_GENAI_API_KEY=your_genai_api_key         # For AI features (Gemini)
# OR
GOOGLE_API_KEY=your_google_api_key              # Alternative (same as above)
```

---

## 📝 Complete Example: `.env.local` (Frontend)

Create this file in the `frontend/` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-827010330-91b76.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-827010330-91b76
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-827010330-91b76.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=271282670485
NEXT_PUBLIC_FIREBASE_APP_ID=1:271282670485:web:49c4913d9655adfa55c49c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Application URL
NEXT_PUBLIC_APP_URL=https://rad-profiterole-4ece65.netlify.app
# For local development:
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Local Development (use Firebase emulators)
NEXT_PUBLIC_FIREBASE_EMULATORS=true

# Google Calendar Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Linktree Integration
NEXT_PUBLIC_LINKTREE_CLIENT_ID=your_linktree_client_id
```

---

## 🔧 Setting Backend Environment Variables (Firebase Cloud Functions)

To set environment variables for Cloud Functions, use the Firebase CLI:

```bash
# Set individual variables
firebase functions:config:set email.user="your_email@gmail.com"
firebase functions:config:set email.password="your_app_password"

# Or set multiple at once
firebase functions:config:set \
  email.user="your_email@gmail.com" \
  email.password="your_app_password" \
  google.client_secret="your_secret" \
  linktree.client_id="your_id" \
  linktree.client_secret="your_secret"

# View current config
firebase functions:config:get

# Deploy functions after setting config
firebase deploy --only functions
```

**Note:** For Firebase Functions v2+, use environment variables instead:
```bash
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set GOOGLE_CLIENT_SECRET
firebase functions:secrets:set LINKTREE_CLIENT_ID
firebase functions:secrets:set LINKTREE_CLIENT_SECRET
```

---

## 🌐 Netlify Environment Variables

For Netlify deployment, set these in the Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Add any server-side variables needed for API routes

**Required for Netlify:**
- All `NEXT_PUBLIC_FIREBASE_*` variables
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (for push notifications)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (if using Google Calendar)
- `NEXT_PUBLIC_LINKTREE_CLIENT_ID` (if using Linktree)
- `GOOGLE_GENAI_API_KEY` or `GOOGLE_API_KEY` (if using AI features)

---

## 🔐 Security Notes

1. **Never commit `.env.local` or `.env` files to Git**
2. **NEXT_PUBLIC_*** variables are exposed to the browser - don't put secrets there
3. **Backend secrets** should only be set in Firebase Cloud Functions environment
4. **Use Firebase Functions Secrets** for sensitive data (passwords, API keys)
5. **Rotate secrets regularly** and monitor usage

---

## 📍 Where to Find Values

### Firebase Configuration
- Firebase Console → Project Settings → General → Your apps
- Copy values from the Firebase SDK configuration

### Firebase VAPID Key
- Firebase Console → Project Settings → Cloud Messaging
- Under "Web configuration" → "Key pair" → Generate or copy existing key

### Google OAuth Credentials
- Google Cloud Console → APIs & Services → Credentials
- Create OAuth 2.0 Client ID

### Linktree Credentials
- Linktree Developer Portal → Create App → Get Client ID and Secret

### WhatsApp Business API
- Meta for Developers → WhatsApp Business API → Get credentials

### Gmail App Password
- Google Account → Security → 2-Step Verification → App passwords
- Generate app password for "Mail"

---

## ✅ Quick Setup Checklist

- [ ] Create `frontend/.env.local` with Firebase config
- [ ] Set `NEXT_PUBLIC_FIREBASE_VAPID_KEY` for push notifications
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Configure Firebase Functions environment variables (if using email service)
- [ ] Set up Google OAuth credentials (if using Google Calendar)
- [ ] Set up Linktree credentials (if using Linktree)
- [ ] Configure Netlify environment variables (for deployment)
- [ ] Test locally with `NEXT_PUBLIC_FIREBASE_EMULATORS=true`

---

## 🆘 Troubleshooting

**Issue: Push notifications not working**
- Check `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set correctly
- Verify Firebase Cloud Messaging is enabled in Firebase Console

**Issue: OAuth callbacks failing**
- Verify `NEXT_PUBLIC_APP_URL` matches your actual deployment URL
- Check redirect URIs in OAuth provider settings

**Issue: Email service not working**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set in Cloud Functions
- Use Gmail App Password, not regular password
- Check Firebase Functions logs for errors

**Issue: Environment variables not loading**
- Restart Next.js dev server after adding new variables
- Check variable names match exactly (case-sensitive)
- For Netlify: Redeploy after adding environment variables

