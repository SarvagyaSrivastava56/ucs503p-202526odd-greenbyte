# 🚨 RUN THESE COMMANDS IN YOUR TERMINAL

Open your **own terminal** and run these commands **ONE AT A TIME**:

## Step 1: Navigate to your project

```bash
cd /Users/piyushraj/campus_event_hub
```

## Step 2: Login to Firebase

```bash
firebase login
```

**When prompted:**
- Press Enter to continue
- It will open a browser window
- Authorize Firebase in the browser
- Come back to terminal when done

## Step 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**Wait for it to complete** - you should see "Deploy complete!"

## Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

**Wait for it to complete** - this may take 2-3 minutes

## Step 5: Check if it worked

Refresh your browser at: http://localhost:3000/society-dashboard/automation

The permissions error should be GONE! ✅

---

## Optional: Configure Email (for actual emails)

If you want automation to send REAL emails:

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
firebase deploy --only functions
```

**For Gmail:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate an app password
3. Use that password in the command above

---

## ⚠️ IMPORTANT

I cannot run these commands for you because they require:
1. Interactive authentication (browser login)
2. Your Firebase account credentials
3. Deployment permissions to your Firebase project

**You MUST run these in YOUR terminal!**


