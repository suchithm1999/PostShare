# Research: Database and Cloud Storage Solutions

**Feature**: 006-vercel-db-storage  
**Created**: 2025-12-25  
**Purpose**: Research and evaluate technology choices for migrating PostShare from localStorage to cloud storage

## Overview

This research document evaluates free-tier cloud database and image storage solutions compatible with Vercel deployment. The goal is to select services that provide reliable persistence, good developer experience, and sufficient free-tier resources for ~100 users.

---

## Decision 1: Cloud Database Selection

### Context
Need a cloud database that:
- Offers a generous free tier (512MB+ storage)
- Works seamlessly with Vercel serverless functions
- Supports JavaScript/Node.js drivers
- Provides good performance (<500ms query latency)
- Requires minimal setup

### Options Evaluated

| Service | Free Tier | Pros | Cons | Vercel Compatible |
|---------|-----------|------|------|-------------------|
| **MongoDB Atlas** | 512MB storage, 500 connections, shared cluster | Industry standard, excellent docs, flexible schema, official Node.js driver | Shared cluster can have variable performance | ✅ Yes |
| **Supabase** | 500MB database, 2GB file storage, 50MB file uploads | PostgreSQL-based, real-time subscriptions, built-in auth | SQL schema requires migrations, more complex setup | ✅ Yes |
| **Firebase Firestore** | 1GB storage, 50k reads/day, 20k writes/day | Real-time sync, offline support built-in, Google ecosystem | Daily limits can be restrictive, NoSQL document model | ✅ Yes |
| **PlanetScale** | 5GB storage, 1 billion row reads/month | MySQL-compatible, branching workflows | Free tier being phased out (2024), uncertain future | ⚠️ Limited |

### Decision: **MongoDB Atlas**

**Rationale**:
- **Schema Flexibility**: NoSQL document model perfect for blog posts (varying content structure)
- **Proven Reliability**: Battle-tested at scale, used by millions of applications
- **Developer Experience**: Excellent documentation, simple connection string setup
- **Free Tier Stability**: 512MB has been stable for years, no signs of changes
- **Connection Pooling**: Built-in connection pooling works well with serverless cold starts
- **PostShare Fit**: Blog posts naturally map to MongoDB documents

**Implementation Notes**:
- Use `mongodb` npm package (official driver)
- Connection string stored in Vercel environment variable: `MONGODB_URI`
- Enable connection pooling to handle serverless concurrency
- Index on `createdAt` for efficient feed queries

**Alternatives Considered**:
- **Supabase**: Excellent option but SQL migrations add complexity for this simple use case
- **Firestore**: Daily limits (50k reads) could be hit with ~100 active users browsing feeds
- **PlanetScale**: Avoiding due to uncertain free-tier future

---

## Decision 2: Image Storage Selection

### Context
Need cloud image storage that:
- Offers generous free tier (10GB+ storage, bandwidth)
- Provides direct browser upload (avoid serverless payload limits)
- Supports image optimization/compression
- Has simple API for upload and CDN delivery
- Works with Vercel

### Options Evaluated

| Service | Free Tier | Pros | Cons | Upload Method |
|---------|-----------|------|------|---------------|
| **Cloudinary** | 25GB storage, 25GB bandwidth/month, 7500 transformations | Industry leader, excellent docs, automatic optimization, crop/resize on-the-fly | Free tier limits reset monthly | Direct browser upload or server |
| **ImageKit** | 20GB bandwidth/month, unlimited images | Good free tier, real-time transformations, fast CDN | Bandwidth-focused limits (storage unlimited but impractical without bandwidth) | Direct upload |
| **Uploadcare** | 3GB storage, 3GB traffic | Simple API, good docs | Smaller free tier | Direct upload |
| **Vercel Blob** | 500MB storage (Hobby plan) | Native Vercel integration | Very limited storage (500MB too small for images) | ❌ Too small |

### Decision: **Cloudinary**

**Rationale**:
- **Generous Free Tier**: 25GB storage + 25GB bandwidth sufficient for ~500 images (50MB average each)
- **Image Optimization**: Automatic format conversion (WebP), quality optimization, compression before storage
- **On-the-Fly Transformations**: Can resize/crop images via URL parameters (7500/month included)
- **Direct Upload**: Browser can upload directly to Cloudinary, bypassing Vercel serverless size limits
- **Signed Uploads**: Security via signed upload presets (prevent abuse)
- **CDN**: Global CDN ensures fast image delivery

**Implementation Notes**:
- Use `cloudinary` npm package for server-side operations
- Use unsigned upload preset for browser uploads OR generate signed upload URLs server-side
- Store Cloudinary `public_id` in MongoDB post documents
- Environment variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Use upload preset with transformations: auto-format (WebP), auto-quality, max_dimensions

**Alternatives Considered**:
- **ImageKit**: Strong contender, but Cloudinary has better documentation and larger community
- **Uploadcare**: Too small (3GB) for growth
- **Vercel Blob**: 500MB far too small for image storage needs

---

## Decision 3: Vercel Serverless API Structure

### Context
Need API architecture for:
- CRUD operations on posts
- Image upload/delete operations
- localStorage migration
- Handling with Vercel's serverless constraints

### Best Practices Researched

**Serverless Function Design**:
- Keep functions small and focused (single responsibility)
- Use edge runtime for GET requests (faster cold starts)
- Use Node.js runtime for database/external API calls
- Implement connection pooling to reuse MongoDB connections
- Cache database connections in global scope (survives warm starts)

**Error Handling**:
- Return consistent JSON error responses: `{ error: "message", code: "ERROR_CODE" }`
- Use HTTP status codes properly (400 client errors, 500 server errors)
- Log errors to console for Vercel logs

**Security**:
- Validate all inputs (file types, sizes, content)
- Rate limiting via Vercel Edge Config or simple in-memory throttling
- CORS configuration for frontend domain
- Signed Cloudinary uploads to prevent abuse

### Recommended Structure

```
api/
├── posts/
│   ├── index.js          # GET all posts (edge runtime, lightweight)
│   ├── [id].js           # GET/PUT/DELETE single post
│   └── create.js         # POST new post
├── images/
│   ├── upload.js         # POST - Generate signed upload URL or handle upload
│   └── delete.js         # DELETE - Remove from Cloudinary
└── migrate.js            # POST - Server-side migration trigger (if needed)
```

**Rationale**:
- **File-based routing**: Vercel automatically maps `api/posts/index.js` to `/api/posts`
- **Separation**: Images and posts are separate concerns, separate endpoints
- **RESTful**: Standard REST operations for predictability

---

## Decision 4: Migration Strategy

### Context
Existing users have posts in localStorage. Need to migrate without data loss or user friction.

### Approach: **Client-Side Migration on App Load**

**Flow**:
1. On `App.jsx` mount, check if localStorage contains posts (`static_blog_posts` key)
2. If found AND not already migrated (check `migration_completed` flag):
   - Show migration status UI ("Migrating your posts...")
   - Read all posts from localStorage
   - For each post with base64 image:
     - Upload image to Cloudinary
     - Replace base64 with Cloudinary URL
   - Bulk insert posts to MongoDB via `/api/migrate` endpoint
   - Set `migration_completed = true` in localStorage
   - Clear `static_blog_posts` from localStorage
3. If no posts in localStorage OR already migrated:
   - Fetch posts from MongoDB normally

**Rationale**:
- **Client-side**: User's browser has direct access to localStorage, no need to send all data to server
- **One-time**: Migration happens once per user, then disabled
- **Resilient**: If migration fails, localStorage data preserved, retry on next load
- **User Visibility**: Shows progress, maintains trust

**Alternative**: Server-side migration (rejected because can't access user's localStorage from server)

---

## Decision 5: Offline-First Strategy

### Context
Requirement: "System MUST support offline mode by caching posts locally and syncing when connection is restored"

### Approach: **Service Worker + Sync Queue**

**Components**:
1. **Local Cache**: Use `IndexedDB` via `idb` library to cache fetched posts
2. **Optimistic Updates**: When creating/editing post, update local cache immediately, show success
3. **Sync Queue**: Failed API calls (offline/network errors) queued in IndexedDB
4. **Background Sync**: On reconnection, process queue (create/update pending items)

**Flow**:
- **Online**: API call → Update MongoDB → Update local cache → Update UI
- **Offline**: Queue action → Update local cache → Update UI → Show "Syncing when online" indicator
- **Reconnect**: Process queue → Sync each item → Clear from queue → Update UI

**Libraries**:
- `idb` (IndexedDB wrapper): Lightweight, promise-based
- `workbox` (optional): If need advanced service worker caching

**Rationale**:
- **Better UX**: Users can create posts offline (airplane mode, poor connectivity)
- **Data Safety**: Queued actions persist across page reloads
- **Minimal Complexity**: IndexedDB sufficient, no need for full service worker initially

---

## Decision 6: Image Compression Strategy

### Context
Requirement: "System MUST compress images before upload to optimize storage usage"

### Approach: **Client-Side Compression with `browser-image-compression`**

**Already Used**: PostShare already uses `browser-image-compression` library

**Enhancement Strategy**:
- Compress to max 1920px width (sufficient for blog images)
- Quality: 0.8 (80% quality, good balance size/visual quality)
- Target file size: <1MB per image (reduces upload time, stays well under 5MB limit)
- Convert HEIC/HEIF to JPEG before upload (browser compatibility)

**Compression Config**:
```javascript
{
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg' // or maintain original if PNG/WebP
}
```

**Rationale**:
- **Bandwidth Savings**: Reduces upload time, Cloudinary bandwidth usage
- **Storage Efficiency**: More images fit in 25GB free tier
- **Performance**: Compressed images load faster in feed
- **Existing Library**: Already in dependencies, no new package needed

---

## Decision 7: Authentication Method

### Context
Need user authentication system that:
- Supports email/password registration and login
- Supports social login (Google, GitHub)
- Works with Vercel serverless (stateless functions)
- Provides secure session management
- Minimal dependencies

### Options Evaluated

| Approach | Pros | Cons | Serverless Compatible |
|----------|------|------|----------------------|
| **JWT (JSON Web Tokens)** | Stateless (no server session storage), scales easily, works perfectly with serverless, client stores token | Token size (sent with every request), can't invalidate easily (until expiry), requires refresh token mechanism | ✅ Perfect fit |
| **Server Sessions (Redis)** | Can invalidate immediately, smaller request size | Requires session store (Redis/database), adds latency, complex in serverless | ⚠️ Possible but complex |
| **Passport.js Local Strategy** | Battle-tested library, handles bcrypt | Designed for Express (not serverless), requires sessions by default | ⚠️ Requires adaptation |
| **Auth0 / Clerk (SaaS)** | Fully managed, handles OAuth, MFA, etc. | Free tier limits (7000 users Auth0), vendor lock-in, external dependency | ✅ Yes, but overkill |

### Decision: **JWT Tokens + bcrypt**

**Rationale**:
- **Serverless-First**: JWTs are stateless, perfect for Vercel serverless functions (no shared session store needed)
- **Security**: Industry-standard when implemented correctly (short expiry + refresh tokens)
- **Simple**: Use `jsonwebtoken` npm package for signing/verification, `bcrypt` for password hashing
- **Scalability**: No session database needed, horizontal scaling trivial
- **OAuth Compatible**: JWT works seamlessly as the final token format for OAuth flows too

**Implementation Notes**:
- **Access Token**: Short-lived (15-30 minutes), contains user ID, email, username
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie, used to get new access token
- **Secret**: Store JWT secret in `JWT_SECRET` environment variable (generate with `openssl rand -base64 32`)
- **bcrypt**: Use cost factor 10 (balance security/performance), never store plain passwords

**Token Payload**:
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  username: "johndoe",
  iat: 1640000000,
  exp: 1640001800  // 30 min expiry
}
```

**Alternatives Considered**:
- **Server Sessions**: Too complex for serverless, requires Redis/database for session store
- **Auth0**: Overkill for this use case, free tier limits too restrictive for growth
- **No refresh tokens**: Rejected - forces frequent re-login (poor UX)

---

## Decision 8: OAuth Provider Selection

### Context
Need social login to reduce signup friction. Spec requires Google and GitHub.

### Options Evaluated

| Provider | Free Tier | User Base | OAuth 2.0 Complexity | PostShare Value |
|----------|-----------|-----------|---------------------|----------------|
| **Google OAuth 2.0** | Unlimited | Largest (3B+ Gmail users) | Simple, well-documented | ✅ High - most users have Google account |
| **GitHub OAuth** | Unlimited | 100M+ developers | Very simple, minimal scopes | ✅ Medium - tech-savvy audience |
| Facebook Login | Unlimited | 2.9B users | More complex, privacy concerns | ⚠️ Lower - declining trust |
| Twitter OAuth | Paid API tiers | 450M users | Complex (OAuth 1.0a legacy) | ❌ Not specified in spec |

### Decision: **Google OAuth 2.0 + GitHub OAuth**

**Rationale**:
- **Google**: Covers vast majority of users, simple OAuth 2.0 flow, excellent documentation
- **GitHub**: Perfect for developer/tech audience that might use PostShare, simplest OAuth implementation
- **Combined Coverage**: Between Google and GitHub, covers 95%+ of target user base
- **Simple Implementation**: Both use standard OAuth 2.0 (state parameter, authorization code flow)

**Implementation Notes**:

**Google OAuth Setup**:
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Configure OAuth consent screen (app name, logo, privacy policy URL)
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/oauth/google/callback`
6. Get Client ID and Client Secret → environment variables

**GitHub OAuth Setup**:
1. Go to Settings → Developer Settings → OAuth Apps
2. Create New OAuth App
3. Set callback URL: `https://your-app.vercel.app/api/auth/oauth/github/callback`
4. Get Client ID and Client Secret → environment variables

**OAuth Flow** (same for both):
1. User clicks "Sign in with Google/GitHub"
2. Redirect to `/api/auth/oauth/{provider}` → generates OAuth URL with state parameter
3. User authorizes on provider site
4. Provider redirects to `/api/auth/oauth/{provider}/callback?code=...&state=...`
5. Server exchanges code for access token
6. Server fetches user profile (email, name, avatar)
7. Server creates/updates user in MongoDB
8. Server generates JWT token
9. Redirect to app with JWT in cookie or URL param

**Libraries**:
- **passport** with `passport-google-oauth20` and `passport-github2` strategies
- OR custom implementation using `axios` (lighter weight)

**Alternatives Considered**:
- **Facebook**: Privacy concerns, declining user trust, not in spec
- **Twitter**: Complex OAuth 1.0a, paid API tiers

---

## Decision 9: Password Reset Strategy

### Context
Edge case identified: "What happens if a user clicks 'Forgot Password'?"

### Decision: **OUT OF SCOPE for this feature (v1)**

**Rationale**:
- **Complexity**: Password reset requires email sending infrastructure (SendGrid, AWS SES, etc.)
- **Free Tier Limits**: Email services have sending limits (SendGrid: 100 emails/day free)
- **Security**: Requires secure token generation, expiry tracking, database storage
- **Workaround**: Users can use social login (Google/GitHub) if they forget password
- **Future Enhancement**: Add in v2 when email infrastructure is needed for other features

**Suggested v2 Approach** (for future reference):
- Use SendGrid for email delivery (100 emails/day free tier)
- Generate password reset token (UUID), store in MongoDB with expiry (1 hour)
- Email link: `https://app.vercel.app/reset-password?token=...`
- User clicks link, enters new password, token validated and invalidated

---

## Decision 10: Social Features - Following Model

### Context
Users can follow each other to see posts in personalized feed. Need to determine following mechanics.

### Options Evaluated

| Model | User Experience | Database Complexity | Privacy Impact |
|-------|----------------|--------------------|--------------------|
| **Instant Follow** | Click follow → immediately following | Simple (one write) | Controlled via post visibility |
| **Follow Requests** | Click follow → pending → approval | Complex (pending state, notifications) | Higher privacy, but friction |
| **Mutual Follow** | Both must follow each other | Medium (check both directions) | Very restrictive |

### Decision: **Instant Follow (No Approval)**

**Rationale (from spec clarification)**:
- **Simplicity**: One-click follow, no approval workflow, reduces code complexity
- **Growth**: Encourages network building, lowers barriers to connection
- **Privacy**: Users control privacy via per-post public/private setting (not via follow approval)
- **Standard Pattern**: Twitter, Instagram, TikTok all use instant follow
- **Spec Alignment**: Spec explicitly chose instant follow for better UX

**Implementation Notes**:
- **Data Model**: `follows` collection with `{followerId, followingId, createdAt}`
- **Uniqueness**: Compound index on `(followerId, followingId)` prevents duplicate follows
- **Idempotent**: Clicking follow twice does nothing (no error, just already followed)
- **Counts**: Denormalize follower/following counts on `users` collection for fast profile loads
- **Feed Query**: `SELECT posts WHERE authorId IN (followingIds) AND visibility='public'`

**Alternatives Considered**:
- **Follow Requests**: Too much friction, not in spec
- **Mutual Follow**: Too restrictive, not a social network pattern

---

## Decision 11: Feed Composition Algorithm

### Context
User feed must show: (1) user's own posts (all visibility), (2) public posts from followed users.

### Approach: **Query-Based Feed (Pull Model)**

**Algorithm**:
1. Get current user's ID
2. Get list of user IDs they follow
3. Query posts WHERE:
   - `(authorId = currentUserId)` OR
   - `(authorId IN followingIds AND visibility = 'public')`
4. Sort by `createdAt DESC` (newest first)
5. Paginate (limit 20, offset for load more)

**MongoDB Query**:
```javascript
db.posts.find({
  $or: [
    { authorId: currentUserId },  // Own posts (any visibility)
    { 
      authorId: { $in: followingIds },  // Followed users
      visibility: 'public'               // Only public posts
    }
  ]
}).sort({ createdAt: -1 }).limit(20).skip(offset)
```

**Rationale**:
- **Simple**: Single query, easy to understand and debug
- **Correct Privacy**: Enforces public/private at query level
- **Performant**: Indexes on `authorId` and `createdAt` make this fast (\u003c100ms)
- **Scalable**: Works up to ~1000 following (sufficient for free tier target)

**Performance Optimizations**:
- Index: `{ authorId: 1, createdAt: -1 }` (compound index for feed queries)
- Index: `{ authorId: 1, visibility: 1, createdAt: -1 }` (if privacy filter becomes bottleneck)
- Denormalize author info (username, avatar) in post document (avoid JOIN)

**Alternative** (Push Model - rejected):
- **Push Model**: On post create, write to all followers' feed collections
- **Why Rejected**: Complex (requires fan-out writes), doesn't scale with serverless, over-engineering for this scale

---

## Decision 12: Privacy Model - Post Visibility

### Context
Users can mark each post as public or private. Privacy must be enforced at all levels.

### Approach: **Visibility Field + Query-Level Enforcement**

**Data Model**:
- Add `visibility` field to `posts` collection: `'public' | 'private'`
- Default: `'public'` (encourage sharing)
- UI: Toggle on post create/edit form

**Enforcement Layers**:

**1. Database Query** (Primary enforcement):
```javascript
// Feed query (public posts from followed users)
{ authorId: { $in: followingIds }, visibility: 'public' }

// Profile view (only show public if not own profile)
if (profileUserId !== currentUserId) {
  query.visibility = 'public';
}
```

**2. API Middleware** (Secondary enforcement):
```javascript
// Before returning post by ID
if (post.visibility === 'private' && post.authorId !== currentUserId) {
  return 403 Forbidden;
}
```

**3. Frontend UI** (Tertiary - convenience):
- Don't render private post links in feeds if not author
- Show lock icon on private posts in own feed
- Hide "private" posts from public profile page

**Edge Cases**:
- **Changing visibility public → private**: Post immediately removed from followers' feeds (next query won't include it)
- **Changing visibility private → public**: Post appears in followers' feeds on next load
- **Direct link to private post**: API returns 403 if not author

**Rationale**:
- **Simple**: Single field, boolean logic
- **Secure**: Query-level enforcement prevents data leaks
- **Flexible**: User controls per-post (not all-or-nothing account privacy)

---

## Technology Stack Summary

### Frontend (Existing + New)
- **Framework**: React 18+, Vite
- **State Management**: React hooks (useState, useEffect, useContext), **AuthContext** (new)
- **Routing**: React Router (**protected routes** for authenticated pages)
- **Image Compression**: `browser-image-compression` (existing)
- **Icons**: `lucide-react` (existing)
- **Styling**: Tailwind CSS (existing)
- **Offline Storage**: IndexedDB via `idb` (new)
- **HTTP Client**: `axios` or `fetch` (for API calls)

### Backend (New)
- **Runtime**: Node.js 18+ (Vercel serverless)
- **Database**: MongoDB Atlas (free tier M0)
- **Database Driver**: `mongodb` npm package
- **Image Storage**: Cloudinary (free tier)
- **Image SDK**: `cloudinary` npm package
- **API Framework**: Vercel serverless functions (file-based routing)
- **Authentication**: 
  - `bcrypt` (password hashing, cost factor 10)
  - `jsonwebtoken` (JWT generation/verification)
  - `passport` + `passport-google-oauth20` (Google OAuth)
  - `passport-github2` (GitHub OAuth)
  - OR `axios` for lightweight custom OAuth implementation
- **Validation**: `validator` (email validation, input sanitization)

### Testing
- **Unit**: Vitest (fast, Vite-native)
- **Component**: React Testing Library
- **E2E**: Playwright (covers full user flows including migration)
- **API**: Supertest or direct fetch calls in integration tests

### DevOps
- **Hosting**: Vercel (frontend + serverless functions)
- **CI/CD**: Vercel Git integration (auto-deploy on push)
- **Environment Variables**: Vercel dashboard + `.env.local` for local dev
- **Monitoring**: Vercel Analytics (free tier), console.log for serverless logs

---

## Implementation Risks and Mitigations

### Risk 1: Free Tier Limits Exceeded
**Mitigation**:
- Implement quotas in code (max images per user, total storage tracking)
- Show warnings at 80% capacity
- Document upgrade path to paid tiers if needed
- Compression reduces storage by ~50%

### Risk 2: Serverless Cold Starts
**Impact**: First request after idle may be slow (2-3 seconds)
**Mitigation**:
- Use MongoDB connection pooling (reuse connections in warm functions)
- Consider edge runtime for read-only GET requests
- Accept trade-off (free tier limitation)

### Risk 3: Migration Failures
**Impact**: Users lose data if migration crashes
**Mitigation**:
- Never clear localStorage until migration confirmed successful
- Retry mechanism on errors
- Detailed error logging
- Fallback: Manual export/import feature

### Risk 4: Cloudinary Upload Failures
**Impact**: Posts created without images
**Mitigation**:
- Show clear upload status/progress
- Retry failed uploads
- Allow saving post as draft without image
- Queue image uploads for later (offline support)

### Risk 5: OAuth Provider Downtime
**Impact**: Users can't sign up/login via social login
**Mitigation**:
- Offer both email/password AND social login (fallback options)
- Show clear error messages when OAuth fails
- Retry mechanism with exponential backoff
- Monitor OAuth provider status pages

### Risk 6: JWT Token Security Breaches
**Impact**: Stolen JWT allows unauthorized access
**Mitigation**:
- Short access token expiry (30 minutes max)
- httpOnly cookies for refresh tokens (not accessible via JavaScript)
- HTTPS-only transmission (Vercel default)
- Rotate JWT secret periodically
- Don't store sensitive data in JWT payload

### Risk 7: Password Security
**Impact**: Weak passwords or brute-force attacks
**Mitigation**:
- Enforce password strength (min 8 characters, mix of types)
- bcrypt with cost factor 10 (slow enough to prevent brute-force)
- Rate limit login attempts (max 5 per 15 minutes per IP)
- Lock account after 10 failed attempts (requires admin unlock)

### Risk 8: Privacy Leaks (Private Posts Exposed)
**Impact**: Private posts accidentally shown to non-authors
**Mitigation**:
- Triple-layer enforcement (query, API middleware, frontend)
- Comprehensive E2E tests for privacy scenarios
- Code review checklist for all post-fetching code
- Regular security audits of feed queries

### Risk 9: Follow Spam
**Impact**: Malicious users mass-following to spam or harass
**Mitigation**:
- Rate limit follows (max 50 per hour per user)
- Allow users to block followers (future enhancement)
- Report/flag mechanism (future enhancement)
- Monitor for abnormal follow patterns

---

## Next Steps (Phase 1)

With research complete, proceed to:
1. **Data Model**: Define MongoDB schemas and IndexedDB structure
2. **API Contracts**: OpenAPI specs for all endpoints
3. **Quickstart Guide**: Setup instructions for MongoDB Atlas and Cloudinary accounts

---

## References

- [MongoDB Atlas Free Tier](https://www.mongodb.com/pricing)
- [Cloudinary Free Tier](https://cloudinary.com/pricing)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb library](https://github.com/jakearchibald/idb)
