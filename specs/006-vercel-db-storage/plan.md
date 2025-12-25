# Implementation Plan: Persistent Database, Cloud Storage, Authentication & Social Features

**Branch**: `006-vercel-db-storage` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-vercel-db-storage/spec.md`

**Note**: This plan has been **EXPANDED** to include user authentication and social features (follow system, personalized feeds, privacy controls) in addition to the original database and cloud storage migration.

## Summary

This feature migrates the PostShare blog application from browser-based localStorage to cloud-based persistent storage **AND** adds comprehensive authentication and social networking capabilities. 

**Original Scope**: Enable users to access their blog posts from any device while supporting reliable image uploads up to 5MB via cloud storage.

**Expanded Scope** (Session 2025-12-25): Add user authentication (email/password + Google/GitHub OAuth), user profiles (username, display name, avatar), social following system (instant follow, no approval), per-post visibility control (public/private), and personalized feeds showing user's own posts plus public posts from followed users.

**Technical Approach**: 
- **Database**: MongoDB Atlas (free tier: 512MB, shared cluster) for posts, users, follows, sessions
- **Image Storage**: Cloudinary (free tier: 25GB storage, 25GB bandwidth/month) for post images and profile pictures
- **Authentication**: JWT tokens + bcrypt password hashing, OAuth 2.0 for Google/GitHub
- **Architecture**: Vercel serverless API routes + React frontend with offline-first capabilities

## Technical Context

**Language/Version**: JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime)  
**Primary Dependencies**: 
- Frontend: React, React Router, `browser-image-compression`, `lucide-react`
- Backend: MongoDB Node.js Driver, Cloudinary SDK, Vercel serverless functions
- Authentication: `bcrypt` (password hashing), `jsonwebtoken` (JWT), `passport` (OAuth strategies)
**Storage**: 
- Database: MongoDB Atlas (free tier M0: 512MB, shared cluster, 500 connections)
- Images: Cloudinary (free tier: 25GB storage, 25GB bandwidth/month, 7500 transformations/month)
**Testing**: Vitest (unit), React Testing Library (component), Playwright (E2E)  
**Target Platform**: Web (Vercel serverless deployment, browser localStorage fallback)
**Project Type**: Web application (frontend + serverless API backend)  
**Performance Goals**: 
- Post load time: <3 seconds (P95)
- Image upload: <10 seconds for 5MB (P95)
- Database queries: <500ms (P95)
- Authentication: <5 seconds for signup/login (P95)
- Social actions (follow): <2 seconds (P95)
**Constraints**: 
- Must work with Vercel free tier (100GB bandwidth, 100h serverless execution)
- Must stay within MongoDB Atlas M0 limits (512MB storage, shared infrastructure)
- Must stay within Cloudinary free tier (25GB storage, 25GB bandwidth)
- Zero data loss during localStorage migration
- Offline-first: App must work without connectivity, sync when online
- Authentication required: No public browsing (login page only for unauthenticated users)
**Scale/Scope**: 
- Users: ~100 concurrent users (free tier target)
- Data: ~1000 posts, ~500 images, ~100 user accounts, ~500 follow relationships
- Storage: ~12GB total (posts + images + users)
- Request volume: ~10,000 API calls/month (increased from 5000 due to social features)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS

The project constitution file contains only template placeholders. No specific principles are defined yet. This expanded feature follows general best practices:

- **Technology Choice**: Using proven, well-supported free-tier services (MongoDB Atlas, Cloudinary, OAuth providers)
- **Testing**: Plan includes comprehensive testing strategy (unit, component, E2E) covering auth flows and social features
- **Simplicity**: Reasonable complexity for the scope - using existing React app structure, adding serverless API layer, standard OAuth patterns
- **Observability**: Error handling and user feedback built into requirements for both storage and auth operations
- **Security**: Industry-standard practices (bcrypt, JWT, OAuth 2.0, HTTPS-only, input validation)

**Post-Phase 1 Re-check**: Will verify that data model and contracts maintain simplicity and testability despite expanded scope.

## Project Structure

### Documentation (this feature)

```text
specs/006-vercel-db-storage/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (UPDATED with auth research)
├── data-model.md        # Phase 1 output (UPDATED with User, Follow, Session)
├── quickstart.md        # Phase 1 output (UPDATED with OAuth setup)
├── contracts/           # Phase 1 output (UPDATED with auth endpoints)
│   ├── api-posts.yaml   # Posts API OpenAPI spec (UPDATED: user ownership)
│   ├── api-images.yaml  # Images API OpenAPI spec (UPDATED: profile pictures)
│   ├── api-auth.yaml    # [NEW] Authentication API spec
│   ├── api-users.yaml   # [NEW] User profiles & following API spec
│   └── BlogService.ts   # TypeScript interfaces (UPDATED)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # Existing React components
│   ├── EditPostModal.jsx
│   ├── ImageModal.jsx
│   ├── Navbar.jsx      # [UPDATE] Add user menu, logout
│   ├── PostCard.jsx    # [UPDATE] Show author, visibility indicator
│   ├── PostForm.jsx    # [UPDATE] Add visibility toggle
│   ├── LoginForm.jsx   # [NEW] Email/password + social login
│   ├── SignupForm.jsx  # [NEW] User registration
│   ├── ProfileCard.jsx # [NEW] User profile display
│   ├── FollowButton.jsx # [NEW] Follow/unfollow button
│   └── UserAvatar.jsx  # [NEW] Profile picture component
├── pages/               # Existing page components
│   ├── CreatePost.jsx  # [EXISTING]
│   ├── Feed.jsx        # [UPDATE] Personalized feed logic
│   ├── Login.jsx       # [NEW] Login/signup page
│   ├── Profile.jsx     # [NEW] User profile page
│   └── EditProfile.jsx # [NEW] Profile editing
├── services/            # Data services
│   ├── blogService.js   # [EXISTING] Currently uses localStorage
│   ├── apiClient.js     # [NEW] HTTP client for API calls
│   ├── authService.js   # [NEW] Authentication operations (login, signup, OAuth)
│   ├── userService.js   # [NEW] User profile operations
│   ├── followService.js # [NEW] Follow/unfollow operations
│   ├── dbService.js     # [NEW] Database operations wrapper
│   ├── imageService.js  # [NEW] Cloudinary integration
│   └── migrationService.js # [NEW] localStorage → MongoDB migration
├── utils/               # Utility functions
│   ├── fileHelpers.js   # [EXISTING]
│   ├── imageHelpers.js  # [EXISTING] 
│   ├── offlineQueue.js  # [NEW] Queue for offline operations
│   ├── auth.js          # [NEW] JWT validation, token management
│   └── validators.js    # [NEW] Input validation (email, username, passwords)
├── contexts/            # [NEW] React contexts
│   └── AuthContext.jsx  # [NEW] Authentication state management
├── hooks/               # [NEW] Custom React hooks
│   ├── useAuth.js       # [NEW] Authentication hook
│   └── useFollow.js     # [NEW] Follow status hook
├── types/               # Type definitions
│   └── index.js         # [EXISTING - EXPAND]
├── App.jsx              # [EXISTING - UPDATE] Add auth routing
├── main.jsx             # [EXISTING] Entry point
└── index.css            # [EXISTING] Global styles

api/                     # [NEW] Serverless functions (Vercel)
├── auth/                # [NEW] Authentication endpoints
│   ├── signup.js        # POST /api/auth/signup - Email/password registration
│   ├── login.js         # POST /api/auth/login - Email/password login
│   ├── oauth/
│   │   ├── google.js    # GET /api/auth/oauth/google - Initiate Google OAuth
│   │   ├── google-callback.js # GET /api/auth/oauth/google/callback
│   │   ├── github.js    # GET /api/auth/oauth/github - Initiate GitHub OAuth
│   │   └── github-callback.js # GET /api/auth/oauth/github/callback
│   ├── refresh.js       # POST /api/auth/refresh - Refresh JWT token
│   └── logout.js        # POST /api/auth/logout - Invalidate session
├── users/               # [NEW] User profile endpoints
│   ├── [username].js    # GET /api/users/:username - Get user profile
│   ├── me.js            # GET /api/users/me - Get current user
│   ├── update-profile.js # PUT /api/users/me - Update profile
│   ├── upload-avatar.js # POST /api/users/me/avatar - Upload profile picture
│   ├── follow.js        # POST /api/users/:username/follow - Follow user
│   ├── unfollow.js      # DELETE /api/users/:username/follow - Unfollow user
│   ├── followers.js     # GET /api/users/:username/followers - List followers
│   └── following.js     # GET /api/users/:username/following - List following
├── posts/
│   ├── index.js         # GET /api/posts - List posts (UPDATED: feed logic)
│   ├── [id].js          # GET/PUT/DELETE /api/posts/:id (UPDATED: ownership check)
│   └── create.js        # POST /api/posts - Create post (UPDATED: set author)
├── images/
│   ├── upload.js        # POST /api/images/upload (UPDATED: post or profile)
│   └── delete.js        # DELETE /api/images/:publicId
└── migrate.js           # POST /api/migrate (UPDATED: associate with user)

lib/                     # [NEW] Shared backend utilities
├── mongodb.js           # MongoDB connection helper
├── cloudinary.js        # Cloudinary client setup
├── auth.js              # [NEW] JWT generation/validation, password hashing
├── oauth.js             # [NEW] OAuth provider configurations
├── middleware.js        # [NEW] Auth middleware for protected routes
└── errors.js            # Error handling utilities

tests/
├── unit/
│   ├── services/        # Test blogService, authService, followService, etc.
│   ├── utils/           # Test validators, auth helpers, offline queue
│   └── lib/             # Test JWT, OAuth, middleware
├── integration/
│   ├── api/             # Test API endpoints (auth, users, posts, images)
│   ├── auth/            # Test OAuth flows
│   └── migration/       # Test localStorage migration
└── e2e/
    ├── auth.spec.js     # [NEW] Signup, login, OAuth flows
    ├── profile.spec.js  # [NEW] Profile viewing, editing
    ├── follow.spec.js   # [NEW] Follow/unfollow flows
    ├── feed.spec.js     # [NEW] Personalized feed with privacy
    └── posts.spec.js    # End-to-end post creation, editing, deletion (UPDATED)
```

**Structure Decision**: Web application with serverless backend. The existing React frontend (src/) will be enhanced with authentication UI, user profiles, and social features. The `api/` directory contains Vercel serverless functions that handle database, image storage, authentication, and social operations. The `lib/` directory provides shared utilities for backend operations. This structure maintains backward compatibility while adding cloud persistence and social capabilities.

## Complexity Tracking

**N/A** - No constitution violations. The implementation follows best practices:
- Uses existing React structure (no new framework complexity)
- Adds serverless API layer (Vercel's native file-based routing)
- Maintains simplicity with proven technologies (MongoDB, Cloudinary, OAuth 2.0)
- Testing strategy covers all layers (unit, integration, E2E) including auth and social flows
- Security follows industry standards (bcrypt, JWT, OAuth 2.0)

**Note on Expanded Scope**: While the feature has significantly expanded (storage + auth + social), the architectural approach remains simple and standard. Each concern (storage, auth, social) uses well-established patterns without introducing novel complexity.

---

## Phase 0: Research ✅ COMPLETE + UPDATED

**Status**: All research complete, all decisions documented, auth & social research added

**Artifacts Created**:
- ✅ `research.md` - Technology evaluation and decisions (UPDATED with auth/social sections)
  - Database: MongoDB Atlas (512MB free)
  - Image Storage: Cloudinary (25GB free)
  - Offline Strategy: IndexedDB + sync queue
  - Migration Strategy: Client-side with status UI
  - Compression: `browser-image-compression` (existing)
  - **[NEW]** Authentication: JWT + bcrypt, OAuth 2.0 (Google/GitHub)
  - **[NEW]** Session Management: JWT with 7-day expiry, refresh tokens
  - **[NEW]** Social Features: Instant follow model, feed composition algorithm

**Key Decisions**:
1. **MongoDB Atlas** over Supabase/Firebase - Schema flexibility, stable free tier, supports auth & social data
2. **Cloudinary** over ImageKit/Uploadcare - Best docs, generous free tier, handles post + profile images
3. **Client-side migration** - Browser has direct localStorage access
4. **IndexedDB for offline** - Sufficient for use case, no service worker needed initially
5. **[NEW] JWT + bcrypt** - Industry standard, serverless-friendly, no session storage needed
6. **[NEW] OAuth 2.0** - Use passport.js strategies for Google/GitHub, minimal custom code
7. **[NEW] Instant follow** - No approval workflow reduces complexity, privacy via post visibility

---

## Phase 1: Design & Contracts ✅ COMPLETE + UPDATED

**Status**: All design artifacts generated and updated for auth/social features

**Artifacts Created**:
- ✅ `data-model.md` - MongoDB schema, IndexedDB structure, Cloudinary organization (UPDATED)
  - **[UPDATED]** Posts collection: added authorId, visibility field
  - **[NEW]** Users collection: email, password hash, OAuth IDs, profile fields
  - **[NEW]** Follows collection: follower/following relationships
  - **[NEW]** Sessions collection: JWT tokens, expiry
  - Indexes for performance (username, email, authorId, follower queries)
  - Migration format transformation (now includes user association)
  - Storage capacity estimates (updated for users, follows, sessions)
  
- ✅ `contracts/api-posts.yaml` - OpenAPI 3.0 spec for Posts API (UPDATED)
  - **[UPDATED]** All endpoints now require authentication
  - **[UPDATED]** Create/update posts include authorId
  - **[UPDATED]** List posts respects visibility and following
  - Optimistic locking support retained
  
- ✅ `contracts/api-images.yaml` - OpenAPI 3.0 spec for Images API (UPDATED)
  - **[UPDATED]** Upload endpoint handles post images OR profile pictures
  - Direct upload retained
  - Delete operations check ownership
  
- ✅ `contracts/api-auth.yaml` - **[NEW]** OpenAPI 3.0 spec for Authentication API
  - POST /auth/signup - Email/password registration
  - POST /auth/login - Email/password login
  - GET /auth/oauth/google, /auth/oauth/github - Initiate OAuth
  - GET /auth/oauth/*/callback - OAuth callbacks
  - POST /auth/refresh - Refresh JWT
  - POST /auth/logout - Invalidate session
  
- ✅ `contracts/api-users.yaml` - **[NEW]** OpenAPI 3.0 spec for Users API
  - GET /users/:username - Get user profile
  - GET /users/me - Get current user
  - PUT /users/me - Update profile
  - POST /users/me/avatar - Upload profile picture
  - POST /users/:username/follow - Follow user
  - DELETE /users/:username/follow - Unfollow user
  - GET /users/:username/followers - List followers
  - GET /users/:username/following - List following
  
- ✅ `contracts/BlogService.ts` - TypeScript interfaces (UPDATED)
  - **[UPDATED]** BlogService: added auth context to all methods
  - **[NEW]** AuthService: signup, login, OAuth, token management
  - **[NEW]** UserService: profiles, avatars
  - **[NEW]** FollowService: follow/unfollow, followers/following lists
  - MigrationService, OfflineQueueService, CacheService retained
  
- ✅ `quickstart.md` - Setup guide (UPDATED)
  - MongoDB Atlas account creation (retained)
  - Cloudinary account setup (retained)
  - **[NEW]** Google OAuth 2.0 app setup
  - **[NEW]** GitHub OAuth app setup
  - **[NEW]** JWT secret generation
  - Vercel deployment steps (updated with new env vars)
  - Troubleshooting guide (expanded with auth issues)
  
- ✅ Agent context updated (`GEMINI.md`)
  - Added: JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime)
  - **[NEW]** Added: bcrypt, jsonwebtoken, passport (OAuth)

---

## Post-Phase 1 Constitution Check ✅ PASS (with expanded scope considerations)

**Re-evaluation after design completion**:

- ✅ **Simplicity Maintained**: Despite expanded scope, no over-engineering detected
  - Data model uses standard MongoDB patterns for users, posts, follows
  - Authentication uses industry-standard JWT + bcrypt (not reinventing security)
  - OAuth implementation uses established passport.js strategies
  - API follows RESTful conventions consistently
  - Contracts are clear and testable
  
- ✅ **Testing Coverage**: All layers addressable including new auth/social features
  - Unit: Services (auth, user, follow, blog), utilities (JWT, validation), middleware
  - Integration: API endpoints (auth flows, OAuth callbacks, protected routes)
  - E2E: Full user flows (signup → login → profile → follow → post → feed)
  
- ✅ **Observability**: Error handling built-in for auth and social operations
  - Structured error responses for auth failures (invalid credentials, expired tokens)
  - Validation at multiple layers (client, API, database)
  - Clear user feedback requirements for all operations
  
- ✅ **Security**: Industry best practices applied
  - Passwords hashed with bcrypt (cost factor 10)
  - JWT tokens with expiry and refresh mechanism
  - OAuth 2.0 for social login (no password handling for those flows)
  - HTTPS-only (Vercel default)
  - Input validation on all user-provided data
  
- ✅ **No New Complexity Beyond Justified Scope**: Within acceptable bounds
  - Leverages existing React structure
  - Uses Vercel's native serverless (no custom framework)
  - MongoDB, Cloudinary, OAuth providers are industry-standard, well-documented
  - Auth/social features use proven patterns (not novel approaches)

**Conclusion**: Design approved for implementation with expanded scope. Ready for task breakdown.

---

## Phase 2: Task Breakdown (Next Step)

**Command**: `/speckit.tasks`

This command will:
1. Generate `tasks.md` with dependency-ordered implementation tasks
2. Break down work into independently deliverable units covering:
   - Authentication system (email/password + OAuth)
   - User profiles and avatars
   - Social following system
   - Post visibility and privacy
   - Personalized feed composition
   - Database migration (including user association)
   - Original storage features (MongoDB, Cloudinary)
3. Provide acceptance criteria for each task
4. Enable parallel work streams where possible

**Not included in this plan** - Run `/speckit.tasks` separately to generate the task list.

---

## Summary

**Feature**: 006-vercel-db-storage (EXPANDED: Storage + Auth + Social)
**Plan Status**: ✅ **COMPLETE - Ready for Tasking**  
**Branch**: `006-vercel-db-storage`

**Deliverables**:
- [x] Technical context defined (updated with auth/social tech)
- [x] Constitution check passed (initial and post-design, considering expanded scope)
- [x] Research complete (storage + auth + social technology choices justified)
- [x] Data model designed (MongoDB: posts, users, follows, sessions; IndexedDB; Cloudinary)
- [x] API contracts specified (OpenAPI 3.0: posts, images, **auth**, **users**)
- [x] TypeScript contracts defined (service interfaces including **auth** and **social**)
- [x] Quickstart guide written (setup instructions including **OAuth** providers)
- [x] Agent context updated
- [ ] Tasks.md (run `/speckit.tasks` next)

**Next Action**: Run `/speckit.tasks` to generate implementation tasks for the expanded feature scope.
