# 🚀 Deploy to Netlify - Step-by-Step Guide

Your project is **successfully pushed to GitHub**! ✅

Repository: `https://github.com/p-raj2702/campus_event_hub`

---

## 📋 **Deploy to Netlify (5 minutes)**

### **Step 1: Go to Netlify**
Open: **https://app.netlify.com/**

### **Step 2: Sign Up/Login**
- Click **"Sign up"** or **"Log in"**
- Choose **"Sign up with GitHub"** (easiest option)
- Authorize Netlify to access your GitHub account

### **Step 3: Import Your Project**
1. Click **"Add new site"** → **"Import an existing project"**
2. Select **"Deploy with GitHub"**
3. Search for and select: **`campus_event_hub`**
4. Click on the repository

### **Step 4: Configure Build Settings**

Netlify will auto-detect Next.js. **Verify** these settings:

```
Build command: npm run build
Publish directory: .next
```

### **Step 5: Add Environment Variables**

Click **"Add environment variables"** and paste these **one by one**:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: studio-827010330-91b76.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: studio-827010330-91b76

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: studio-827010330-91b76.appspot.com

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 271282670485

NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:271282670485:web:49c4913d9655adfa55c49c

GOOGLE_GENAI_API_KEY
Value: AIzaSyBbRE4vqqiAxtCpvwaZgdYQAiiO9c4TyGk

GOOGLE_API_KEY
Value: AIzaSyBbRE4vqqiAxtCpvwaZgdYQAiiO9c4TyGk
```

### **Step 6: Deploy!**
Click **"Deploy uniconnect"**

---

## ⏱️ **Deployment Progress**

Netlify will:
1. ✅ Clone your repository
2. ✅ Install dependencies (`npm install`)
3. ✅ Build your app (`npm run build`)
4. ✅ Deploy to global CDN

**Expected time: 3-5 minutes**

---

## 🌐 **Your Live URL**

After deployment, you'll get a URL like:
```
https://uniconnect-xyz123.netlify.app
```

**Features:**
- ✅ **Unlimited concurrent users** (unlike Vercel's hobby plan)
- ✅ **100GB bandwidth/month FREE**
- ✅ **Automatic HTTPS**
- ✅ **Auto-deploy on git push**
- ✅ **Global CDN**

---

## 🎯 **Post-Deployment**

### **Custom Domain (Optional)**
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions

### **View Deployment Logs**
- Click on your site → **"Deploys"** tab
- View real-time build logs

### **Automatic Updates**
Every time you push to GitHub, Netlify will **automatically rebuild and deploy**! 🚀

---

## ✅ **Quick Checklist**

- [x] Code pushed to GitHub ✅
- [ ] Netlify account created
- [ ] Project imported from GitHub
- [ ] Environment variables added
- [ ] Deployment initiated
- [ ] Site live and accessible

---

## 🆘 **Troubleshooting**

### **Build fails?**
- Check the build logs in Netlify dashboard
- Verify all environment variables are set correctly
- Make sure `netlify.toml` is in your repository root

### **Can't see your site?**
- Wait 2-3 minutes for DNS propagation
- Clear browser cache
- Try incognito/private mode

### **Need help?**
Netlify has excellent docs: https://docs.netlify.com/

---

## 🎊 **You're Done!**

Your UniConnect is now:
- ✅ Live on the internet
- ✅ Supporting unlimited users
- ✅ Auto-deploying on updates
- ✅ Secured with HTTPS
- ✅ AI-powered recommendations enabled

**Share your live URL with your campus!** 🎉

