# 🚀 Deploy UniConnect to Netlify

Quick guide to deploy your UniConnect app to Netlify.

## 📋 Prerequisites

- GitHub account with your code pushed
- Netlify account (free tier is perfect)
- Firebase project set up

## 🎯 Deployment Steps

### Option 1: Connect GitHub Repository (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Click **"Add new site"** → **"Import an existing project"**

2. **Connect to GitHub**
   - Select **GitHub** as your Git provider
   - Authorize Netlify to access your repositories
   - Select your `uniconnect` repository

3. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/.next
   ```

4. **Add Environment Variables**
   Go to **Site settings** → **Environment variables** and add:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
   ```

5. **Deploy!**
   - Click **"Deploy site"**
   - Netlify will automatically build and deploy your app
   - Get your live URL: `https://your-site-name.netlify.app`

### Option 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=.next
   ```

## 🔄 Continuous Deployment

Once connected to GitHub, Netlify automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Rebuilds when you update environment variables

## 🌐 Your Live Site

After deployment, your UniConnect app will be available at:
```
https://your-site-name.netlify.app
```

### Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to add your domain
4. Netlify provides free HTTPS automatically

## 📊 Features on Netlify

- ✅ **Unlimited bandwidth** (100GB/month on free tier)
- ✅ **Automatic HTTPS**
- ✅ **CDN distribution**
- ✅ **Branch previews**
- ✅ **Form handling**
- ✅ **Analytics** (on paid plans)

## 🔧 Configuration

The project includes `netlify.toml` with optimized settings:
- Base directory set to `frontend/`
- Next.js plugin for optimal performance
- Redirects for SPA behavior
- Cache headers for static assets

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure `frontend/package.json` has all dependencies

### Page Not Found
- Check `netlify.toml` redirects are correct
- Verify publish directory is `frontend/.next`

### Environment Variables Not Working
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing variables

## 📱 Firebase Functions

**Note:** Firebase Cloud Functions in the `backend/` folder need to be deployed separately:

```bash
# From project root
firebase deploy --only functions
```

Netlify handles the frontend, Firebase handles the backend functions.

## 🎉 Success!

Your UniConnect app is now live and will automatically update with every Git push! 

Current deployment: https://rad-profiterole-4ece65.netlify.app

---

**Need help?** Check [Netlify Docs](https://docs.netlify.com/) or [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)

