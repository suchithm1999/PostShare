# Cloud Services Setup Guide

**Feature**: 006-vercel-db-storage  
**Purpose**: Step-by-step instructions for setting up MongoDB Atlas, Cloudinary, and OAuth providers

---

## Prerequisites

- Node.js 20+ installed
- npm installed
- Git repository initialized
- Dependencies installed (`npm install` already run)

---

## 1. MongoDB Atlas Setup (T003)

### Create Free Tier Cluster

1. **Create Account**:
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google/GitHub

2. **Create M0 Free Cluster**:
   - Click "Build a Database"
   - Select "M0 FREE" tier (512MB storage, shared)
   - Choose cloud provider: **AWS** (recommended)
   - Region: Choose closest to your users
   - Cluster name: `PostShareCluster` (or any name)
   - Click "Create"

3. **Configure Network Access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP for security
   - Click "Confirm"

4. **Create Database User**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `postshare_admin` (or any name)
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

5. **Get Connection String**:
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy connection string:
     ```
     mongodb+srv://postshare_admin:<password>@postshare.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Replace `?retryWrites` with `/postshare?retryWrites` (add database name)

6. **Add to .env.local**:
   ```env
   MONGODB_URI=mongodb+srv://postshare_admin:YOUR_PASSWORD@postshare.xxxxx.mongodb.net/postshare?retryWrites=true&w=majority
   ```

**✅ Checklist**:
- [ ] MongoDB Atlas account created
- [ ] M0 free cluster provisioned
- [ ] Network access configured (0.0.0.0/0 or specific IP)
- [ ] Database user created
- [ ] Connection string copied and password replaced
- [ ] `MONGODB_URI` added to `.env.local`

---

## 2. Cloudinary Setup (T004)

### Create Free Tier Account

1. **Create Account**:
   - Go to https://cloudinary.com/users/register/free
   - Sign up with email

2. **Get Credentials**:
   - After signup, you'll be redirected to Dashboard
   - Copy these values:
     - **Cloud Name**: `dxxxxxxxxx`
     - **API Key**: `123456789012345`
     - **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Configure Upload Preset**:
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - **Preset name**: `postshare_uploads`
   - **Signing mode**: Signed
   - **Folder**: `postshare/posts`
   - **Unique filename**: Yes
   - **Overwrite**: No
   - **Allowed formats**: `jpg,png,webp,gif`
   - **Transformations**:
     - **Eager transformations**: `w_1920,h_1920,c_limit,q_auto,f_auto`
   - Click "Save"

4. **Create Avatar Preset** (for profile pictures):
   - Add another upload preset
   - **Preset name**: `postshare_avatars`
   - **Folder**: `postshare/avatars`
   - **Allowed formats**: `jpg,png,webp,gif`
   - **Transformations**:
     - **Eager transformations**: `w_400,h_400,c_fill,g_face,q_auto,f_auto`

5. **Add to .env.local**:
   ```env
   CLOUDINARY_CLOUD_NAME=dxxxxxxxxx
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Checklist**:
- [ ] Cloudinary account created
- [ ] Cloud name, API key, API secret copied
- [ ] Upload preset `postshare_uploads` created
- [ ] Upload preset `postshare_avatars` created
- [ ] Cloudinary credentials added to `.env.local`

---

## 3. Google OAuth 2.0 Setup (T005)

### Create OAuth Application

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Project name: `PostShare`
   - Click "Create"

2. **Enable Google+ API** (for user profile):
   - In the search bar, type "Google+ API"
   - Click "Google+ API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - Click "Create"
   - Fill in:
     - **App name**: PostShare
     - **User support email**: your@email.com
     - **Developer contact email**: your@email.com
   - Click "Save and Continue"
   - Scopes: Skip (default scopes are fine)
   - Test users: Add your email for testing
   - Click "Save and Continue"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `PostShare Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://your-app.vercel.app` (production - add later)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/oauth/google/callback`
     - `https://your-app.vercel.app/api/auth/oauth/google/callback` (add later)
   - Click "Create"

5. **Copy Credentials**:
   - **Client ID**: `123456789-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

6. **Add to .env.local**:
   ```env
   GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Checklist**:
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URIs added (localhost + production)
- [ ] Client ID and secret copied to `.env.local`

---

## 4. GitHub OAuth Setup (T006)

### Create OAuth App

1. **Go to Developer Settings**:
   - Go to https://github.com/settings/developers
   - Click "OAuth Apps" in left sidebar
   - Click "New OAuth App"

2. **Fill in Application Details**:
   - **Application name**: PostShare
   - **Homepage URL**: `http://localhost:3000` (development)
   - **Application description**: A social blogging platform for sharing posts
   - **Authorization callback URL**: `http://localhost:3000/api/auth/oauth/github/callback`
   - Click "Register application"

3. **Get Credentials**:
   - **Client ID**: `Ov23abcdefghijklmnop`
   - Click "Generate a new client secret"
   - **Client Secret**: `xxxxxxxxxxxxxxxxxxxxx` (save immediately, shown only once!)

4. **Add Production Callback** (later, after Vercel deployment):
   - Go back to your OAuth app settings
   - Update **Homepage URL**: `https://your-app.vercel.app`
   - Update **Authorization callback URL**: Add both:
     - `http://localhost:3000/api/auth/oauth/github/callback`
     - `https://your-app.vercel.app/api/auth/oauth/github/callback`
   - Click "Update application"

5. **Add to .env.local**:
   ```env
   GITHUB_CLIENT_ID=Ov23abcdefghijklmnop
   GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Checklist**:
- [ ] GitHub OAuth app created
- [ ] Application name and URLs configured
- [ ] Client ID copied
- [ ] Client secret generated and copied
- [ ] Credentials added to `.env.local`

---

## 5. JWT Secret Generation (T007)

### Generate Secure Secret

1. **Generate Secret** (Mac/Linux):
   ```bash
   openssl rand -base64 32
   ```

   Output example:
   ```
   3kJ8nF2mP9xR5tY7wQ0sU3vZ6bN1cM4hL8gD5fA2eT9i
   ```

2. **Alternative** (if openssl not available):
   - Use online generator: https://www.grc.com/passwords.htm
   - Copy the "63 random printable ASCII characters" value
   - Or use Node.js:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

3. **Add to .env.local**:
   ```env
   JWT_SECRET=3kJ8nF2mP9xR5tY7wQ0sU3vZ6bN1cM4hL8gD5fA2eT9i
   ```

**⚠️ Security Note**: Never commit this secret to Git! It's already in `.gitignore` via `.env.local`.

**✅ Checklist**:
- [ ] JWT secret generated (32+ characters, base64)
- [ ] Secret added to `.env.local`
- [ ] Verified `.env.local` is in `.gitignore`

---

## 6. Final .env.local Verification

Your `.env.local` should now look like this:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://postshare_admin:YOUR_PASSWORD@postshare.xxxxx.mongodb.net/postshare?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT
JWT_SECRET=3kJ8nF2mP9xR5tY7wQ0sU3vZ6bN1cM4hL8gD5fA2eT9i

# Google OAuth
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23abcdefghijklmnop
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx

# App URLs
VITE_API_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:3000
```

**✅ Final Checklist**:
- [ ] All 9 environment variables set
- [ ] No placeholder values remain
- [ ] File is named `.env.local` (not `.env.example`)
- [ ] File is in project root (same directory as `package.json`)

---

## 7. Vercel Deployment (Later - After Implementation)

When ready to deploy to Vercel:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add authentication and storage features"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your repository
   - Add all environment variables from `.env.local` to Vercel:
     - Go to Settings → Environment Variables
     - Add each variable (without `VITE_` prefix for backend vars)

3. **Update OAuth Redirect URLs**:
   - Update Google OAuth authorized redirect URIs
   - Update GitHub OAuth callback URL
   - Add `https://your-app.vercel.app/api/auth/oauth/*/callback`

---

## Troubleshooting

### MongoDB Connection Issues
- **Error: "IP not whitelisted"**: Add your IP to Network Access in MongoDB Atlas
- **Error: "Authentication failed"**: Check username and password in connection string
- **Error: "Database not found"**: Ensure `/postshare` is in connection string

### Cloudinary Upload Issues
- **Error: "Invalid API key"**: Verify CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
- **Error: "Upload preset not found"**: Create upload presets as described above

### OAuth Issues
- **Google "redirect_uri_mismatch"**: Verify callback URL matches exactly in Google Console
- **GitHub "redirect_uri_mismatch"**: Verify callback URL in GitHub OAuth app settings
- **"Invalid client"**: Client ID or secret is incorrect

### JWT Issues
- **"Invalid signature"**: JWT secret mismatch between environments (ensure same secret everywhere)

---

## Next Steps

After completing this setup:
1. Verify all environment variables in `.env.local`
2. Restart development server: `npm run dev`
3. Test database connection (will be implemented in Phase 2)
4. Proceed with Phase 2: Foundation implementation

**Status**: Phase 1 setup complete! Ready for Phase 2 (Foundation utilities).
