# Quickstart Guide: Setting Up Cloud Storage for PostShare

**Feature**: 006-vercel-db-storage  
**Created**: 2025-12-25  
**Purpose**: Step-by-step guide to set up MongoDB Atlas, Cloudinary, and deploy to Vercel

---

## Overview

This guide walks you through setting up the required cloud services:
1. **MongoDB Atlas** (database) - FREE tier: 512MB storage
2. **Cloudinary** (image storage) - FREE tier: 25GB storage + bandwidth
3. **Vercel** (deployment) - FREE tier: 100GB bandwidth, 100hr serverless

**Time Required**: ~20-30 minutes

---

## Prerequisites

- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] GitHub account (for Vercel)
- [ ] Email address for MongoDB Atlas and Cloudinary sign-ups

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Sign up** with Google, email, or GitHub
3. **Select**:
   - Cloud Provider: **AWS** (or GCP/Azure)
   - Region: **Closest to your users** (e.g., us-east-1, eu-west-1)
   - Cluster Tier: **M0 Sandbox** (FREE - 512MB)
4. **Cluster Name**: `postshare-cluster` (or any name)
5. Click **Create Cluster** (takes 3-5 minutes)

### Step 2: Configure Database Access

1. In MongoDB Atlas dashboard, click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. **Authentication Method**: Password
4. **Username**: `postshare_user` (or any name)
5. **Password**: Click **Autogenerate** (copy it! You'll need it later)
   - Or set a custom password (save it securely)
6. **User Privileges**: Select **Read and write to any database**
7. Click **Add User**

### Step 3: Configure Network Access

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. **Select**: **Allow access from anywhere** (0.0.0.0/0)
   - ⚠️ This is OK because we use authentication
   - Vercel serverless functions have dynamic IPs, so we need wildcard
4. Click **Confirm**

### Step 4: Get Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Click **Connect your application**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy** the connection string:
   ```
   mongodb+srv://<username>:<password>@postshare-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace**:
   - `<username>` with `postshare_user` (or your username)
   - `<password>` with the password you copied in Step 2
8. **Add database name** before `?`:
   ```
   mongodb+srv://postshare_user:YOUR_PASSWORD@postshare-cluster.xxxxx.mongodb.net/postshare?retryWrites=true&w=majority
   ```

**Save this connection string! You'll add it to Vercel environment variables later.**

---

## Part 2: Cloudinary Setup (Image Storage)

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
2. **Sign up** with email or Google
3. **Fill out** the registration form:
   - Choose "Developer" as your role
   - Select "All" for use case (or "Media Management")
4. **Verify email** if required

### Step 2: Get API Credentials

1. After login, go to **Dashboard** (default page)
2. Find **Account Details** section
3. **Copy** these values (you'll need all 3):
   - **Cloud Name**: e.g., `dxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmn_OPQRST` (click "eye" icon to reveal)

**Save these credentials! You'll add them to Vercel environment variables.**

### Step 3: Create Upload Preset (Optional but Recommended)

1. Go to **Settings** (gear icon top-right)
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. **Preset name**: `postshare_uploads`
6. **Signing Mode**: **Signed** (more secure)
7. **Folder**: `postshare/posts/`
8. **Enable**:
   - ✅ Unique filename
   - ✅ Use filename
9. **Transformations** (optional):
   - Incoming: `c_limit,w_1920,h_1920,q_auto,f_auto`
   - (Limits to 1920px, auto quality, auto format)
10. Click **Save**

---

## Part 3: Local Development Setup

### Step 1: Clone and Install

```bash
cd /Users/suchithm/Desktop/PostShare
git checkout 006-vercel-db-storage
npm install
```

### Step 2: Install New Dependencies

```bash
# Database and image storage
npm install mongodb cloudinary

# Offline support
npm install idb

# Development/Testing
npm install -D @types/node
```

### Step 3: Create Environment File

Create `.env.local` in the project root:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://postshare_user:YOUR_PASSWORD@postshare-cluster.xxxxx.mongodb.net/postshare?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmn_OPQRST

# Optional: Upload preset name
CLOUDINARY_UPLOAD_PRESET=postshare_uploads
```

**Replace** with your actual credentials from Part 1 and Part 2.

### Step 4: Add to .gitignore

Ensure `.env.local` is in `.gitignore`:

```bash
echo ".env.local" >> .gitignore
```

### Step 5: Test Connection (After Implementation)

```bash
# Run development server
npm run dev
```

Open browser to `http://localhost:3000`. If API routes are implemented, test:

```bash
# Test MongoDB connection
curl http://localhost:3000/api/posts

# Should return empty array or existing posts
```

---

## Part 4: Vercel Deployment

### Step 1: Create Vercel Account

1. Go to [Vercel Sign Up](https://vercel.com/signup)
2. **Sign up with GitHub** (recommended for easy deployment)
3. **Authorize** Vercel to access your repositories

### Step 2: Import Project

1. Click **Add New** → **Project**
2. **Import Git Repository**:
   - Find `PostShare` repository
   - Click **Import**
3. **Configure Project**:
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)
4. **Don't deploy yet!** We need to add environment variables first.

### Step 3: Add Environment Variables

1. Click **Environment Variables** (expand section)
2. **Add** each variable:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://postshare_user:...` |
   | `CLOUDINARY_CLOUD_NAME` | `dxxxxxx` |
   | `CLOUDINARY_API_KEY` | `123456789012345` |
   | `CLOUDINARY_API_SECRET` | `abcdefghijklmn_OPQRST` |
   | `CLOUDINARY_UPLOAD_PRESET` | `postshare_uploads` |

3. **For each variable**:
   - Select **All** environments (Production, Preview, Development)
   - Click **Add**

### Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build and deployment
3. **Success!** You'll get a URL like: `https://postshare-abc123.vercel.app`

### Step 5: Test Deployment

1. Open your Vercel URL
2. Try creating a post with an image
3. Verify it persists after refresh
4. Check MongoDB Atlas dashboard:
   - Go to **Database** → **Browse Collections**
   - Should see `posts` collection with your data

---

## Part 5: Verification Checklist

After deployment, verify everything works:

- [ ] **Database Connection**: Posts load from MongoDB (check via Vercel Logs)
- [ ] **Image Upload**: Can upload images to Cloudinary
- [ ] **Image Display**: Images show correctly from Cloudinary CDN
- [ ] **Create Post**: New posts save to MongoDB
- [ ] **Edit Post**: Can update existing posts
- [ ] **Delete Post**: Posts and images delete properly
- [ ] **Migration**: Existing localStorage posts migrated (if applicable)
- [ ] **Offline Support**: App works offline, syncs when online (if implemented)

---

## Troubleshooting

### MongoDB Connection Issues

**Error**: "MongoServerError: bad auth"

**Solution**:
- Double-check username and password in `MONGODB_URI`
- Ensure password doesn't have special characters (or URL-encode them)
- Verify database user has "Read and write" permissions

**Error**: "MongoNetworkError: connection timed out"

**Solution**:
- Check Network Access in MongoDB Atlas allows 0.0.0.0/0
- Verify connection string includes `retryWrites=true&w=majority`

### Cloudinary Upload Issues

**Error**: "Invalid API credentials"

**Solution**:
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are correct
- Check for typos or extra spaces
- Ensure API Secret matches (not API Base URL or other values)

**Error**: "Upload preset not found"

**Solution**:
- Verify upload preset name matches exactly (`postshare_uploads`)
- Or remove `CLOUDINARY_UPLOAD_PRESET` from env vars and use default upload

### Vercel Deployment Issues

**Error**: "Environment variable not found"

**Solution**:
- Re-deploy after adding environment variables
- Or go to **Settings** → **Environment Variables** → Add missing vars → **Redeploy**

**Error**: "Serverless function timeout"

**Solution**:
- Check MongoDB connection pooling is configured
- Verify queries have indexes (see data-model.md)
- Check Vercel function logs for details

---

## Free Tier Limits Summary

| Service | Storage | Bandwidth | Other Limits |
|---------|---------|-----------|--------------|
| **MongoDB Atlas M0** | 512MB | Unlimited | Shared CPU, 500 connections |
| **Cloudinary Free** | 25GB | 25GB/month | 7500 transformations/month |
| **Vercel Hobby** | Unlimited | 100GB/month | 100hr serverless execution |

**Estimated Capacity** (with these limits):
- **Posts**: ~100,000 posts (without images)
- **Images**: ~500 images (@ 50MB average, compressed)
- **Users**: ~100 concurrent users (typical blog traffic)

---

## Next Steps

After setup is complete:

1. **Implement API routes** (see contracts/api-posts.yaml, api-images.yaml)
2. **Implement frontend services** (see data-model.md)
3. **Add offline support** (IndexedDB + sync queue)
4. **Implement migration** (localStorage → MongoDB)
5. **Run tests** (see testing strategy in plan.md)
6. **Monitor usage**:
   - MongoDB Atlas: Database → Metrics
   - Cloudinary: Dashboard → Usage
   - Vercel: Analytics → Overview

---

## Support Resources

- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Vercel Docs**: https://vercel.com/docs
- **PostShare GitHub**: Create an issue if you encounter problems

---

## Security Best Practices

✅ **DO**:
- Use environment variables for all credentials
- Keep `.env.local` in `.gitignore`
- Use signed Cloudinary uploads
- Validate all inputs server-side

❌ **DON'T**:
- Commit credentials to Git
- Share environment variables publicly
- Use unsigned Cloudinary uploads (can be abused)
- Trust client-side validation alone

---

**Setup Complete!** You're now ready to implement the cloud storage features. 🚀
