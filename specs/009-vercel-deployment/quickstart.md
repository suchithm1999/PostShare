# Quickstart: Deploy PostShare to Vercel

**Goal**: Deploy your full-stack PostShare application to Vercel in under 30 minutes  
**Prerequisites**: Git repository, Vercel account, MongoDB Atlas account  
**Last Updated**: 2025-12-26

---

## Overview

This guide walks you through deploying PostShare (React + Node.js + MongoDB) to Vercel's serverless platform. You'll configure the necessary files, set up external services, and deploy your application.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] PostShare code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Vercel account (sign up free at [vercel.com](https://vercel.com))
- [ ] MongoDB Atlas account (sign up free at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))
- [ ] Cloudinary account with credentials
- [ ] Google Cloud Console project with OAuth2 credentials
- [ ] Node.js 18+ installed locally for testing

---

## Part 1: Create Configuration Files (15 minutes)

### Step 1: Create vercel.json

Create a new file `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**What this does**:
- Tells Vercel to build your frontend with Vite
- Routes `/api/*` requests to serverless functions
- Routes all other requests to your React app (SPA mode)

### Step 2: Create .vercelignore

Create `.vercelignore` in your project root:

```
node_modules
.git
.env
.env.local
.env.*.local
*.log
.DS_Store
.vscode
.idea
specs/
*.md
README.md
```

**What this does**: Excludes unnecessary files from deployment to reduce bundle size

### Step 3: Update package.json

Add the `vercel-build` script to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "vite build"
  }
}
```

**What this does**: Tells Vercel how to build your frontend

### Step 4: Create .env.example

Create `.env.example` in your project root with all required variables (no actual values):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-secret-key-at-least-32-characters

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend (optional)
VITE_API_URL=
```

**What this does**: Documents required environment variables for team members

### Step 5: Commit Changes

```bash
git add vercel.json .vercelignore package.json .env.example
git commit -m "feat: add Vercel deployment configuration"
git push origin main
```

---

## Part 2: Set Up MongoDB Atlas (10 minutes)

### Step 1: Create Free Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Build a Database"
3. Choose **M0 Free** tier
4. Select a cloud provider and region (choose closest to your users)
5. Name your cluster (e.g., "PostShare")
6. Click "Create Cluster" (takes 1-3 minutes)

### Step 2: Create Database User

1. Go to **Database Access** in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `postshare-user` (or your choice)
5. Auto-generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 3: Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (required for Vercel serverless)
4. Click "Confirm"

⚠️ **Security Note**: `0.0.0.0/0` is required for Vercel's dynamic IPs. Your database is still protected by username/password.

### Step 4: Get Connection String

1. Go to **Database** in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" driver
5. Copy the connection string (looks like `mongodb+srv://...`)
6. **Important**: Replace `<password>` with your actual database user password
7. Replace `<dbname>` with `postshare` (or your database name)

**Example final string**:
```
mongodb+srv://postshare-user:your-password-here@cluster0.xxxxx.mongodb.net/postshare?retryWrites=true&w=majority
```

Save this string - you'll need it for Vercel environment variables!

---

## Part 3: Deploy to Vercel (10 minutes)

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will detect it as a Vite project

### Step 2: Configure Project

1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: `.` (leave as default)
3. **Build Command**: `npm run vercel-build` (or leave default)
4. **Output Directory**: `dist` (should auto-populate)

### Step 3: Add Environment Variables

Click "Environment Variables" and add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string from Part 2 | Production |
| `JWT_SECRET` | Generate a random 32+ character string | Production |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Production |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Production |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Production |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret | Production |

**How to generate JWT_SECRET**:
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (1-3 minutes)
3. You'll get a URL like `your-app.vercel.app`

---

## Part 4: Configure Google OAuth (5 minutes)

### Step 1: Get Your Vercel URL

After deployment, copy your Vercel URL (e.g., `https://postshare-xyz.vercel.app`)

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your OAuth project
3. Go to **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/oauth/google/callback
   ```
6. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
7. Click "Save"

---

## Part 5: Test Your Deployment (5 minutes)

### Quick Smoke Test

1. Visit your Vercel URL
2. Click "Sign Up"
3. Create a test account
4. Log in
5. Create a post (with and without image)
6. Test follow request feature
7. Log out and log back in (session should persist)

### Check Production Logs

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Your latest deployment
3. Click "Functions" tab to see API logs
4. Look for any errors (should be none if all working)

---

## Part 6: Optional Custom Domain

### If You Have a Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `postshare.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5 minutes to 24 hours)
5. **Important**: Update Google OAuth redirect URIs with new domain
6. SSL certificate automatically issues when DNS is configured

---

## Troubleshooting

### Build Fails

**Problem**: Build fails with errors  
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` has all dependencies
3. Test build locally: `npm run build`
4. Check for environment variable typos

### API Errors (500)

**Problem**: API requests return 500 errors  
**Solution**:
1. Check Function logs in Vercel dashboard
2. Verify MongoDB connection string is correct
3. Check MongoDB Atlas network access allows `0.0.0.0/0`
4. Verify database user has correct permissions

### OAuth Doesn't Work

**Problem**: Google sign-in fails  
**Solution**:
1. Verify redirect URI exactlymatches in Google Console
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
3. Ensure authorized JavaScript origins includes your Vercel URL
4. Try clearing browser cookies/cache

### Database Connection Timeouts

**Problem**: Requests timeout connecting to MongoDB  
**Solution**:
1. Verify MongoDB Atlas cluster is running (not paused)
2. Check network access rules allow connections
3. Verify connection string includes `?retryWrites=true&w=majority`
4. Check MongoDB Atlas status page for outages

### Images Don't Upload

**Problem**: Image uploads fail  
**Solution**:
1. Verify Cloudinary credentials are correct in environment variables
2. Check Cloudinary account is active
3. Verify Cloudinary upload preset (if using unsigned uploads)
4. Check Function logs for specific error messages

---

## Performance Optimization (Optional)

### After Initial Deployment

1. **Monitor Function Execution**:
   - Go to Vercel Dashboard → Analytics
   - Check average response times
   - Look for slow functions

2. **Optimize Cold Starts** (if needed):
   - Reduce bundle size (remove unused dependencies)
   - Consider upgrading to Pro tier for warmer functions

3. **Database Indexing**:
   - Run `scripts/setup-indexes.js` to create MongoDB indexes
   - Improves query performance

4. **Enable Vercel Analytics** (optional):
   - Go to Project Settings → Analytics
   - Enable Web Analytics for usage insights

---

## Maintenance

### Updating Your Deployment

```bash
# Make changes locally
git add .
git commit -m "feat: your changes"
git push origin main
```

Vercel automatically redeploys on push to main branch!

### Rollback to Previous Version

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### Monitoring

- **Uptime**: Vercel provides 99.9% SLA on Pro tier
- **Logs**: Check Function logs regularly for errors
- **Database**: Monitor MongoDB Atlas metrics (connections, operations)

---

## Security Checklist

After deployment, verify:

- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] All environment variables are set in Vercel dashboard
- [ ] MongoDB connection string includes password
- [ ] Google OAuth redirect URIs use HTTPS
- [ ] JWT secret is complex and unique
- [ ] No hardcoded credentials in source code
- [ ] Cloudinary API secret is secure
- [ ] MongoDB network access is configured
- [ ] Application uses HTTPS (Vercel provides automatically)

---

## Success!

Your PostShare app is now live on Vercel! 🎉

**Next Steps**:
1. Share your URL with friends/testers
2. Monitor logs for any issues
3. Add custom domain (optional)
4. Set up monitoring/analytics
5. Consider upgrading to Pro tier for better performance

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **PostShare Issues**: File an issue on your GitHub repo

---

**Estimated Total Time**: 30-45 minutes  
**Difficulty**: Intermediate  
**Cost**: Free (with free tiers of all services)
