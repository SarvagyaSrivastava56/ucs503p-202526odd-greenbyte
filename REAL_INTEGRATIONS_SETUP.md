# 🚀 Real Integrations Setup Guide

This guide explains how to set up **production-ready, real API integrations** for WhatsApp Business API and Linktree.

## 📱 **WhatsApp Business API Integration**

### **What You Get:**
- ✅ **Real message sending** - Send WhatsApp messages programmatically
- ✅ **Business verification** - Verified business account badge
- ✅ **Template messages** - Pre-approved message templates
- ✅ **Bulk messaging** - Send to multiple recipients
- ✅ **Delivery reports** - Track message status
- ✅ **Rich media** - Send images, documents, location

### **Prerequisites:**
1. **Facebook Business Account**
2. **WhatsApp Business Account**
3. **Meta Business Suite access**
4. **Phone number for WhatsApp Business**

### **Setup Steps (10-15 minutes):**

#### **1. Create Facebook Business Account**
1. Go to https://business.facebook.com/
2. Click "Create Account"
3. Follow the setup wizard

#### **2. Set Up WhatsApp Business API**
1. Go to Meta for Developers: https://developers.facebook.com/
2. Create a new app → "Business" type
3. Add "WhatsApp" product to your app
4. Follow the WhatsApp setup wizard

#### **3. Get Your Credentials**
You need these 3 values:

**a) Access Token:**
- Go to your app → WhatsApp → API Setup
- Copy the "Temporary access token" (or generate a permanent one)
- Value looks like: `EAABsbCS1iHgBOZBGbI...`

**b) Phone Number ID:**
- In WhatsApp → API Setup
- Find "Phone Number ID" under "From"
- Value looks like: `109876543210123`

**c) Business Account ID (Optional):**
- In WhatsApp → Settings → Business Settings
- Copy your "WhatsApp Business Account ID"
- Value looks like: `123456789012345`

#### **4. Add to Netlify Environment Variables**
1. Go to Netlify dashboard → Environment variables
2. Add these variables:

```
WHATSAPP_ACCESS_TOKEN = [Your access token from step 3a]
WHATSAPP_PHONE_NUMBER_ID = [Your phone number ID from step 3b]
WHATSAPP_BUSINESS_ACCOUNT_ID = [Your business account ID from step 3c]
```

#### **5. Verify Phone Number**
1. In Meta Business Suite
2. WhatsApp Manager → Phone Numbers
3. Verify your business phone number (SMS or voice call)

#### **6. Test the Integration**
1. Visit your deployed site
2. Login as society admin
3. Go to Settings → Integrations → WhatsApp
4. Click "Connect"
5. See "✅ WhatsApp Business API connected!"

### **How to Use:**
```typescript
// The integration will automatically:
// 1. Verify your WhatsApp Business API credentials
// 2. Store access token securely
// 3. Enable real message sending

// When you share an event:
// - In demo mode: Generates wa.me share URLs
// - In production: Sends real WhatsApp messages via API
```

### **Pricing:**
- **Free tier**: 1,000 conversations/month
- **After that**: ~$0.005-0.09 per conversation (varies by country)
- See: https://developers.facebook.com/docs/whatsapp/pricing

---

## 🔗 **Linktree OAuth Integration**

### **What You Get:**
- ✅ **Auto-create links** - Automatically add events to Linktree
- ✅ **OAuth 2.0 authentication** - Secure authorization
- ✅ **Link management** - Create, update, delete links
- ✅ **Analytics** - Track link clicks
- ✅ **Custom branding** - Use your Linktree theme

### **Prerequisites:**
1. **Linktree Pro account** (OAuth API requires Pro)
2. **Linktree account** with admin access

### **Setup Steps (Coming Soon):**

Linktree's official OAuth API is currently in beta. Here are alternatives:

#### **Option 1: Manual Link Management (Current)**
- Share event links directly
- Copy event URL to Linktree manually
- Works with any Linktree plan

#### **Option 2: Zapier Integration**
1. Connect Zapier to your Linktree
2. Set up automation: "New Event → Create Linktree Link"
3. Works today with free Zapier tier

#### **Option 3: Wait for Linktree API**
Linktree is rolling out their API access. You can:
- Join waitlist: https://linktr.ee/api
- Get notified when API is available
- Then follow OAuth setup similar to Google Calendar

---

## 🚨 **Production Deployment Checklist**

### **WhatsApp Business API:**
- [ ] Created Facebook Business Account
- [ ] Set up WhatsApp Business API
- [ ] Verified phone number
- [ ] Got access token and phone number ID
- [ ] Added environment variables to Netlify
- [ ] Tested connection in Settings
- [ ] Sent test message successfully

### **Security:**
- [ ] Access tokens stored in environment variables
- [ ] Tokens encrypted in Firestore
- [ ] Rate limiting implemented (for bulk sends)
- [ ] Error handling for failed messages
- [ ] Logging for message delivery

### **Compliance:**
- [ ] Read WhatsApp Business Policy
- [ ] Follow opt-in requirements
- [ ] Include opt-out option in messages
- [ ] Comply with data privacy laws (GDPR, etc.)

---

## 📊 **Features Comparison**

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| **WhatsApp** |
| Share URLs | ✅ Yes | ✅ Yes |
| Send Messages | ❌ No | ✅ Yes |
| Bulk Sending | ❌ No | ✅ Yes |
| Delivery Reports | ❌ No | ✅ Yes |
| Business Badge | ❌ No | ✅ Yes |
| **Linktree** |
| Share Links | ✅ Yes | ✅ Yes |
| Auto-create Links | ❌ No | ⏳ Coming |
| Link Analytics | ❌ No | ⏳ Coming |

---

## 🎯 **Next Steps**

### **For Your Demo:**
1. **Show demo mode** - Share URLs work instantly
2. **Explain production mode** - "Add API keys for real messaging"
3. **Highlight security** - "Tokens stored securely"

### **For Production:**
1. **Get WhatsApp Business API access** (15 minutes)
2. **Add environment variables** (2 minutes)
3. **Test thoroughly** (5 minutes)
4. **Deploy** ✅

---

## 💡 **Pro Tips**

### **WhatsApp Best Practices:**
1. **Use Templates** - Pre-approved message templates for marketing
2. **Respect Opt-Ins** - Only message users who opted in
3. **Monitor Limits** - Watch for rate limits (80 msg/sec)
4. **Handle Errors** - Retry failed messages gracefully

### **Message Templates:**
```
🎉 New Event: {{event_name}}

📅 {{event_date}}
📍 {{event_location}}

RSVP: {{event_url}}

Reply STOP to unsubscribe.
```

---

## 🆘 **Troubleshooting**

### **WhatsApp Issues:**

**"Access token invalid"**
- Check token hasn't expired
- Generate new permanent token
- Update Netlify environment variable

**"Phone number not verified"**
- Complete phone verification in Meta Business Suite
- May take up to 24 hours

**"Rate limit exceeded"**
- You're sending too fast
- Reduce to < 80 messages/second
- Implement exponential backoff

### **Need Help?**
- WhatsApp Docs: https://developers.facebook.com/docs/whatsapp
- Meta Support: https://business.facebook.com/help
- Community: https://stackoverflow.com/questions/tagged/whatsapp-business-api

---

**Your integrations are production-ready!** 🎉

**Current Status:**
- ✅ WhatsApp Business API: **Fully Implemented**
- ⏳ Linktree OAuth: **Demo Mode (API in beta)**
- ✅ Google Calendar: **Fully Implemented**

All code is deployed and ready for real API keys! 🚀
