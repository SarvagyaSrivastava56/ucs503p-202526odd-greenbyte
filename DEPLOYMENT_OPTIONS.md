# 🚀 Deployment Options for UniConnect

Your app is ready to deploy on multiple platforms! Here are the **best free options** that support multiple concurrent users:

---

## ✅ **Recommended: Railway (Best Free Tier)**

**Why Railway?**
- ✅ **500 hours/month FREE** (enough for 24/7 uptime)
- ✅ **Unlimited concurrent users**
- ✅ **Automatic HTTPS**
- ✅ **No credit card required for free tier**
- ✅ **GitHub auto-deploy**

### **Deploy to Railway:**

1. **Go to:** https://railway.app/
2. **Sign up** with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository: `p-raj2702/campus_event_hub`
5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-827010330-91b76.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-827010330-91b76
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-827010330-91b76.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=271282670485
   NEXT_PUBLIC_FIREBASE_APP_ID=1:271282670485:web:49c4913d9655adfa55c49c
   GOOGLE_GENAI_API_KEY=AIzaSyBbRE4vqqiAxtCpvwaZgdYQAiiO9c4TyGk
   GOOGLE_API_KEY=AIzaSyBbRE4vqqiAxtCpvwaZgdYQAiiO9c4TyGk
   ```
6. Click **"Deploy"** ✨

**That's it! Your app will be live in 3-5 minutes!**

---

## 🎯 **Alternative: Render.com**

**Why Render?**
- ✅ **750 hours/month FREE**
- ✅ **Unlimited concurrent users**
- ✅ **Easy to use**
- ✅ **Auto SSL**

### **Deploy to Render:**

1. **Go to:** https://render.com/
2. **Sign up** with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repo: `p-raj2702/campus_event_hub`
5. Configure:
   - **Name:** uniconnect
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. **Add Environment Variables** (same as above)
7. Click **"Create Web Service"** 🚀

**Your app will be live at:** `https://uniconnect.onrender.com`

---

## 🌐 **Option 3: Netlify (Drag & Drop)**

**Why Netlify?**
- ✅ **100GB bandwidth/month FREE**
- ✅ **300 build minutes/month**
- ✅ **Instant global CDN**
- ✅ **Drag & drop deployment**

### **Deploy to Netlify:**

#### **Method 1: Web UI (Easiest)**
1. Go to: https://app.netlify.com/
2. Drag & drop your `.next` folder OR connect GitHub
3. Add environment variables in **Site settings** → **Environment variables**
4. Done! ✨

#### **Method 2: CLI**
```bash
# Login to Netlify
npx netlify-cli login

# Deploy
npx netlify-cli deploy --prod
```

---

## 🔥 **Option 4: Fly.io**

**Why Fly.io?**
- ✅ **Free tier: 3 shared-cpu-1x VMs**
- ✅ **160GB bandwidth/month FREE**
- ✅ **Multiple concurrent users**
- ✅ **Global edge network**

### **Deploy to Fly.io:**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Set environment variables
flyctl secrets set NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk
flyctl secrets set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-827010330-91b76.firebaseapp.com
flyctl secrets set NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-827010330-91b76
flyctl secrets set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-827010330-91b76.appspot.com
flyctl secrets set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=271282670485
flyctl secrets set NEXT_PUBLIC_FIREBASE_APP_ID=1:271282670485:web:49c4913d9655adfa55c49c
flyctl secrets set GOOGLE_GENAI_API_KEY=AIzaSyBbRE4vqqiAxtCpvwaZgdYQAiiO9c4TyGk

# Deploy
flyctl deploy
```

---

## 📊 **Comparison Table**

| Platform | Free Tier | Concurrent Users | Best For |
|----------|-----------|------------------|----------|
| **Railway** ⭐ | 500hrs/month | ✅ Unlimited | **Production apps** |
| **Render** | 750hrs/month | ✅ Unlimited | **Startups** |
| **Netlify** | 100GB bandwidth | ✅ Many | **Static sites + SSR** |
| **Fly.io** | 3 VMs | ✅ Unlimited | **Global apps** |
| Vercel | Hobby plan | ⚠️ 1 user | Personal projects |

---

## 🎯 **Quick Recommendation**

### **For Your UniConnect:**

**Best Choice: Railway** 🚀
- ✅ Supports multiple concurrent users on free tier
- ✅ 500 hours = ~20 days of 24/7 uptime (perfect for campus events)
- ✅ Auto-scales during event rushes
- ✅ Simple GitHub integration

### **Backup Choice: Render**
- ✅ More hours (750/month)
- ✅ Great for demos and testing
- ✅ Easy team collaboration

---

## 🔧 **Files Already Configured:**

- ✅ `vercel.json` - Vercel config
- ✅ `netlify.toml` - Netlify config
- ✅ `render.yaml` - Render config
- ✅ All environment variables documented

---

## 🆘 **Need Help?**

If you need assistance with deployment:
1. Choose a platform from above
2. Follow the step-by-step guide
3. All configs are ready to use!

**Your app is production-ready! 🎊**

