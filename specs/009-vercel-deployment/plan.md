# Implementation Plan: Vercel Full-Stack Deployment

**Feature**: Deploy complete PostShare application to Vercel  
**Branch**: 009-vercel-deployment  
**Created**: 2025-12-26  
**Status**: Planning

---

## Technical Context

### Current State Analysis
- **Application Architecture**: Full-stack MERN (MongoDB, Express-style API, React, Node.js)
- **Current Deployment**: Static frontend only on Vercel (localStorage-based posts)
- **Backend**: Node.js with custom server (server.js) running Express-style API routes
- **Database**: MongoDB (currently local development)
- **Authentication**: JWT + OAuth2 (Google), session-based
- **File Storage**: Cloudinary for image uploads
- **API Structure**: Routes in `/api` directory following Vercel serverless format

### Technology Stack
- **Frontend**: React 18+ with Vite build tool
- **Backend Runtime**: Node.js 18+ (Vercel serverless functions)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Image Storage**: Cloudinary CDN
- **Authentication**: JWT tokens + OAuth2
- **Deployment Platform**: Vercel (Hobby/Pro tier)

### Known Technical Constraints
- Vercel serverless functions have:
  - 10-second execution limit (Hobby), 60s (Pro)
  - 50MB function size limit (Hobby)
  - Stateless execution (no persistent filesystem)
  - Cold start delays on first invocation
- MongoDB Atlas free tier (M0):
  - 500 connection limit
  - Requires connection pooling strategy
- Cloudinary:
  - Already configured for external storage
  - No changes needed

### Integration Points
1. **Frontend ↔ Backend**: API calls from React to `/api/*` endpoints
2. **Backend ↔ Database**: MongoDB connection with pooling
3. **Backend ↔ Cloudinary**: Image upload/delete operations
4. **Backend ↔ OAuth Providers**: Google authentication flow
5. **Vercel ↔ Environment Variables**: Secure credential management

### Unknowns Requiring Research
None - the application is already built and follows Vercel-compatible patterns. Configuration details are well-documented by Vercel and MongoDB Atlas.

---

## Constitution Check

**Constitution Status**: Template (not yet customized for this project)

Since the project constitution is still in template form, we'll apply general best practices:

### Applicable Principles
- ✅ **Simplicity**: Use Vercel's standard deployment workflow, avoid custom build processes
- ✅ **Security**: Environment variables for all credentials, never commit secrets
- ✅ **Testing**: Validate deployment locally before production push
- ✅ **Documentation**: Clear setup guide in quickstart.md

### Gates & Validation
- [ ] All environment variables documented and configured
- [ ] Database connection pooling tested under load
- [ ] OAuth callbacks updated for production domain
- [ ] Build process completes successfully
- [ ] All API endpoints respond correctly in serverless environment

---

## Phase 0: Research & Investigation

### Research Tasks

#### 1. Vercel Serverless Best Practices
**Focus**: MongoDB connection pooling in serverless functions

**Key Findings**:
- Vercel recommends reusing database connections across function invocations
- Use global variables to cache connection instances
- Implement connection timeout and retry logic
- MongoDB Node.js driver handles connection pooling internally

**Decision**: Implement singleton pattern for MongoDB client with connection reuse

#### 2. Environment Variable Configuration
**Focus**: Secure credential management in Vercel

**Key Findings**:
- Vercel supports environment variables at deployment, preview, and development scopes
- Variables prefixed with `VITE_` are exposed to client (frontend)
- Backend-only variables remain server-side
- Can import from `.env` file or configure via dashboard

**Decision**: Use Vercel dashboard for sensitive credentials, `.env.example` for documentation

#### 3. OAuth Production Setup
**Focus**: Configuring Google OAuth for production domain

**Key Findings**:
- OAuth redirect URIs must match exactly (including protocol and path)
- Need separate OAuth credentials for production vs development
- Vercel provides preview URLs for testing before custom domain

**Decision**: Configure OAuth with Vercel-provided URL initially, update for custom domain later

**Output**: See research.md (generated below)

---

## Phase 1: Data Model & Contracts

### Data Model

The application's data model is already defined and implemented. Key entities:

#### Users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  displayName: String,
  avatarUrl: String (Cloudinary URL),
  bio: String,
  password: String (hashed),
  googleId: String (optional),
  isActive: Boolean,
  postCount: Number,
  followerCount: Number,
  followingCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Posts
```javascript
{
  _id: ObjectId,
  content: String,
  imageUrl: String (Cloudinary URL, optional),
  imagePublicId: String (Cloudinary ID),
  visibility: String ('public' | 'private'),
  authorId: ObjectId (ref: users),
  likeCount: Number,
  commentCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Follows
```javascript
{
  _id: ObjectId,
  followerId: ObjectId (ref: users),
  followingId: ObjectId (ref: users),
  status: String ('pending' | 'accepted'),
  createdAt: Date
}
```

**No changes** to data model required for deployment.

### API Contracts

All API endpoints are already implemented in `/api` directory. Key endpoints:

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user, return JWT
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/oauth/google` - Initiate Google OAuth flow
- `GET /api/auth/oauth/google/callback` - Handle OAuth callback

#### Posts
- `GET /api/posts` - List posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (with image upload)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### Users & Profiles
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:username` - Get public user profile
- `POST /api/users/me/avatar` - Upload avatar image

#### Follow System
- `POST /api/users/:username/follow` - Follow user
- `DELETE /api/users/:username/follow` - Unfollow user
- `GET /api/users/me/follow-requests` - List incoming follow requests
- `POST /api/users/me/follow-requests/:id` - Accept/decline request

**No API changes** needed - all routes are Vercel-compatible.

### Configuration Files

#### vercel.json (New)
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
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary-cloud-name",
    "CLOUDINARY_API_KEY": "@cloudinary-api-key",
    "CLOUDINARY_API_SECRET": "@cloudinary-api-secret",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret"
  }
}
```

#### package.json Updates
Add build script for Vercel:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

---

## Phase 2: Implementation Strategy

### Step 1: Prepare Configuration Files

**Tasks**:
1. Create `vercel.json` in project root with routing configuration
2. Add `.vercelignore` to exclude unnecessary files from deployment
3. Update `package.json` with `vercel-build` script
4. Create `.env.example` with all required environment variables (as template)

**Validation**:
- Configuration files follow Vercel's format specification
- `.env.example` lists all required variables without actual values

### Step 2: Update Database Connection

**Tasks**:
1. Review `/lib/mongodb.js` for connection pooling implementation
2. Ensure connection reuse across serverless invocations
3. Add connection timeout and retry logic
4. Test connection with MongoDB Atlas URI format

**Validation**:
- Database connections are reused (logged connection count stays stable)
- No connection timeout errors under load
- Graceful error handling for connection failures

### Step 3: Configure MongoDB Atlas

**Tasks**:
1. Create MongoDB Atlas account (if not exists)
2. Create new cluster (M0 free tier is sufficient)
3. Configure network access to allow Vercel IPs (0.0.0.0/0 for serverless)
4. Create database user with read/write permissions
5. Get connection string in format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

**Validation**:
- Connection string is valid and accessible
- Database user has correct permissions
- Network access allows connections from anywhere (required for serverless)

### Step 4: Configure Environment Variables in Vercel

**Tasks**:
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Navigate to Project Settings → Environment Variables
4. Add all required variables:
   - `MONGODB_URI` (from Atlas)
   - `JWT_SECRET` (generate random 32+ character string)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
   - `VITE_API_URL` (set to empty string for same-origin API)

**Validation**:
- All variables are set in "production" environment
- No sensitive values are committed to Git
- Frontend-accessible variables use `VITE_` prefix

### Step 5: Update OAuth Configuration

**Tasks**:
1. Get Vercel deployment URL (e.g., `your-app.vercel.app`)
2. Update Google OAuth Console:
   - Add authorized redirect URI: `https://your-app.vercel.app/api/auth/oauth/google/callback`
   - Add authorized JavaScript origin: `https://your-app.vercel.app`
3. Test OAuth flow on deployed app

**Validation**:
- OAuth redirect completes successfully
- User is authenticated and session persists
- Tokens are stored correctly

### Step 6: Deploy to Vercel

**Tasks**:
1. Commit all configuration changes to Git
2. Push to main branch (or create deployment branch)
3. Vercel auto-deploys (or trigger manual deployment)
4. Monitor build logs for errors
5. Wait for deployment to complete

**Validation**:
- Build completes without errors
- Deployment status shows "Ready"
- All serverless functions deploy successfully

### Step 7: Post-Deployment Validation

**Tasks**:
1. Visit deployed URL
2. Test user signup flow
3. Test user login (email + Google OAuth)
4. Create a post with image upload
5. Test follow request system
6. Verify posts persist across sessions
7. Check API response times (use browser DevTools)

**Validation**:
- All features work identically to local development
- No 500 errors in production logs
- API responses are reasonably fast (<2s for most requests)
- Database operations complete successfully

### Step 8: Configure Custom Domain (Optional)

**Tasks**:
1. Purchase domain or use existing
2. Add domain in Vercel Project Settings → Domains
3. Update DNS records as instructed by Vercel
4. Update OAuth redirect URIs with custom domain
5. Wait for DNS propagation

**Validation**:
- Custom domain resolves to Vercel deployment
- SSL certificate is issued and active
- OAuth works with custom domain

### Step 9: Monitor and Optimize

**Tasks**:
1. Enable Vercel Analytics (if available)
2. Monitor function execution logs
3. Check MongoDB Atlas metrics (connections, operations)
4. Optimize cold start times if needed
5. Document any deployment-specific configuration

**Validation**:
- Uptime meets 99% target over 30 days
- Error rate stays below 2%
- Database connections don't exceed Atlas limits
- Cold starts are within acceptable range (<3s)

---

## Phase 3: Testing Strategy

### Pre-Deployment Testing (Local)

1. **Environment Parity**
   - Test with production MongoDB Atlas connection string locally
   - Verify all environment variables work in local `.env`
   - Test OAuth flow with production credentials (using localhost redirect)

2. **Build Process**
   - Run `npm run build` locally
   - Verify build completes without errors
   - Check `dist/` output for correct file structure
   - Test built frontend locally with `npx serve dist`

3. **API Compatibility**
   - Verify all `/api` routes export default function
   - Check for file system dependencies (should use Cloudinary only)
   - Ensure no long-running operations exceed Vercel limits

### Post-Deployment Testing (Production)

1. **Smoke Tests**
   - Homepage loads
   - Login page accessible
   - Signup creates user in database
   - Login authenticates successfully

2. **Feature Tests**
   - Create post with text only
   - Create post with image upload
   - Edit post
   - Delete post
   - Follow another user
   - Accept/decline follow requests

3. **Performance Tests**
   - Measure API response times (target: <2s)
   - Test under concurrent load (multiple users)
   - Monitor cold start behavior
   - Check database connection pooling effectiveness

4. **Security Tests**
   - Environment variables not exposed in client
   - OAuth redirects are secure (HTTPS)
   - JWT tokens validated correctly
   - File uploads restricted to allowed types

### Rollback Plan

If deployment fails:
1. Immediately rollback to previous Vercel deployment (can do via dashboard)
2. Review deployment logs for errors
3. Fix issues locally
4. Re-test before re-deploying
5. If MongoDB migration needed, restore from backup (if available)

---

## Risk Assessment

### High Risk
- **MongoDB connection limits**: Mitigated by connection pooling implementation
- **OAuth configuration errors**: Mitigated by testing redirect URIs before production
- **Environment variable misconfiguration**: Mitigated by `.env.example` template

### Medium Risk
- **Cold start performance**: Acceptable for low-traffic apps, monitor and optimize if needed
- **Function timeout**: Most operations complete quickly, but complex queries may need optimization
- **Database migration**: No migration needed for new deployment

### Low Risk
- **Build failures**: Build process is standard Vite build, well-tested
- **Domain configuration**: Optional step, can use Vercel URL initially
- **Static asset serving**: Vite output is standard, Vercel handles automatically

---

## Success Criteria Mapping

| Success Criterion | Validation Method |
|-------------------|------------------|
| All features work in production | Manual testing of all user flows |
| Accessible at domain | Browser navigation to deployed URL |
| 95% of API requests <2s | Vercel Analytics or manual DevTools measurement |
| 99% uptime over 30 days | Vercel uptime monitoring |
| Users can authenticate | Test signup, login, session persistence |
| Data persists in MongoDB | Create content, verify after logout/login |
| <2% server error rate | Vercel function logs and error tracking |
| No credentials exposed | Code review, browser DevTools network inspection |

---

## Dependencies & Prerequisites

### External Accounts Required
1. **Vercel Account** (free tier sufficient)
   - Sign up at vercel.com
   - Connect to GitHub repository

2. **MongoDB Atlas Account** (free tier sufficient)
   - Sign up at mongodb.com/cloud/atlas
   - Create M0 cluster
   - Get connection string

3. **Cloudinary Account** (already configured)
   - Existing credentials should work in production
   - No additional setup needed

4. **Google Cloud Console** (for OAuth)
   - Create OAuth2 credentials
   - Configure redirect URIs for production

### Technical Prerequisites
- Git repository with all code committed
- All dependencies in `package.json`
- Environment variables documented in `.env.example`
- No hardcoded credentials in code

---

## Deliverables

### Configuration Files
1. ✅ `vercel.json` - Deployment and routing configuration
2. ✅ `.vercelignore` - Files to exclude from deployment
3. ✅ `.env.example` - Template for required environment variables
4. ✅ Updated `package.json` with build scripts

### Documentation
1. ✅ `quickstart.md` - Step-by-step deployment guide
2. ✅ `research.md` - Technical decisions and rationale
3. ✅ This `plan.md` - Complete implementation plan

### Deployment Artifacts
1. ✅ Deployed application on Vercel
2. ✅ MongoDB Atlas cluster configured
3. ✅ Environment variables configured in Vercel
4. ✅ OAuth credentials configured for production

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| **Preparation** | Create config files, review code | 1-2 hours |
| **MongoDB Setup** | Create Atlas cluster, configure access | 30 minutes |
| **Vercel Setup** | Connect repo, configure env vars | 30 minutes |
| **Initial Deployment** | Push code, monitor build | 15 minutes |
| **OAuth Configuration** | Update Google Console settings | 15 minutes |
| **Testing & Validation** | Test all features in production | 1-2 hours |
| **Optimization** | Monitor, fix issues, optimize | Ongoing |

**Total Initial Setup**: 3-5 hours  
**Ongoing Maintenance**: As needed

---

## Next Steps

After plan approval:
1. Generate `research.md` with detailed technical decisions
2. Generate `quickstart.md` with step-by-step deployment instructions
3. Run `/speckit.tasks` to break down into actionable task list
4. Begin implementation starting with configuration file creation

---

**Status**: Ready for review and task generation
