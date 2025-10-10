# 🔐 Google Calendar OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Project name: `Campus Event Hub`
   - Click "Create"

## Step 2: Enable Google Calendar API

1. **Navigate to APIs & Services**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

2. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Campus Event Hub"

## Step 3: Configure OAuth Consent Screen

1. **Set up OAuth consent screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: "External" (unless you have Google Workspace)
   - Fill in required fields:
     - App name: `Campus Event Hub`
     - User support email: Your email
     - Developer contact: Your email

2. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Save and continue

## Step 4: Configure Authorized Redirect URIs

1. **Add Redirect URIs**
   - In your OAuth 2.0 Client ID settings
   - Add these URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://rad-profiterole-4ece65.netlify.app/api/auth/google/callback` (for production)

2. **Get Your Credentials**
   - Copy your "Client ID" and "Client Secret"

## Step 5: Update Environment Variables

### For Local Development:
Create `.env.local` file:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### For Netlify Deployment:
1. Go to your Netlify dashboard
2. Navigate to your site → "Site settings" → "Environment variables"
3. Add these variables:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret

## Step 6: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test the OAuth flow**
   - Go to Society Dashboard → Settings → Integrations
   - Click "Connect" on Google Calendar
   - Complete the OAuth flow
   - Verify connection success

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure your redirect URI exactly matches what's in Google Console
   - Check for trailing slashes or HTTP vs HTTPS

2. **"Access blocked"**
   - Your app might be in testing mode
   - Add your email as a test user in OAuth consent screen

3. **"Scope not authorized"**
   - Make sure you've added the required scopes in OAuth consent screen

### Production Checklist:

- ✅ OAuth consent screen configured
- ✅ Required scopes added
- ✅ Redirect URIs configured
- ✅ Environment variables set in Netlify
- ✅ App published (if not in testing mode)

## 🚀 Ready to Go!

Once you've completed these steps, your Google Calendar integration will work with real OAuth authentication!
