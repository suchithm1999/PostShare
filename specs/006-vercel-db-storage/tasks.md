# Implementation Tasks: Persistent Storage + Authentication + Social Features

**Feature**: 006-vercel-db-storage  
**Branch**: `006-vercel-db-storage`  
**Created**: 2025-12-25  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Overview

This task list implements a **significantly expanded feature** combining:
1. **Original Scope**: Database migration (localStorage → MongoDB) + Cloud image storage (Cloudinary)
2. **Extended Scope**: User authentication (email/password + OAuth) + Social features (following, feeds, privacy)

**Total User Stories**: 7 (3 P1 auth/social + 4 P1-P3 storage)  
**Estimated Tasks**: ~85 tasks  
**Recommended MVP**: User Stories 1-3 (Auth + Profiles + Following)

---

## Task Summary

| Phase | User Story | Priority | Task Count | Can Parallelize |
|-------|-----------|----------|------------|-----------------|
| Phase 1 | Setup & Environment | - | 8 | Partial (T003-T008) |
| Phase 2 | Foundation (Blocking) | - | 10 | Yes (T010-T019) |
| Phase 3 | US1: Authentication | P1 | 12 | After foundation |
| Phase 4 | US2: User Profiles | P1 | 8 | After US1 |
| Phase 5 | US3: Following & Feed | P1 | 10 | After US2 |
| Phase 6 | US4: Cross-Device Posts | P1 | 7 | After US3 |
| Phase 7 | US5: Cloud Image Storage | P1 | 6 | Parallel with US4 |
| Phase 8 | US6: localStorage Migration | P2 | 6 | After US4, US5 |
| Phase 9 | US7: Storage Quotas | P3 | 4 | After US6 |
| Phase 10 | Polish & Integration | - | 14 | Partial |
| **TOTAL** | | | **~85 tasks** | |

---

## Dependency Graph

```
Setup (Phase 1)
  ↓
Foundation (Phase 2) - Shared infrastructure
  ↓
US1: Authentication (Phase 3) - BLOCKING for all others
  ↓
US2: Profiles (Phase 4) - Needs authentication
  ↓
US3: Following/Feed (Phase 5) - Needs profiles
  ↓
US4: Cross-Device Posts (Phase 6) ←─┐
US5: Image Storage (Phase 7) ←──────┴─ Parallel!
  ↓
US6: Migration (Phase 8) - Needs US4 + US5
  ↓
US7: Quotas (Phase 9) - Polish feature
  ↓
Polish (Phase 10) - Final integration
```

---

## Phase 1: Setup & Environment Configuration

**Goal**: Initialize infrastructure, install dependencies, configure cloud services

### Tasks

- [x] T001 Install authentication dependencies: `bcrypt`, `jsonwebtoken`, `passport`, `passport-google-oauth20`, `passport-github2`
- [x] T002 Install database and storage dependencies: `mongodb`, `cloudinary`, `idb` (IndexedDB wrapper)
- [x] T003 [P] Create MongoDB Atlas account and M0 cluster following quickstart.md instructions
- [x] T004 [P] Create Cloudinary account and configure upload preset following quickstart.md instructions
- [x] T005 [P] Create Google OAuth 2.0 app in Google Cloud Console (client ID + secret)
- [x] T006 [P] Create GitHub OAuth app in GitHub Developer Settings (client ID + secret)
- [x] T007 [P] Generate JWT secret using `openssl rand -base64 32`
- [x] T008 [P] Configure environment variables in `.env.local` and Vercel: `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

**Acceptance**: All dependencies installed, cloud accounts created, environment configured for local development

**Status**: ✅ **COMPLETE** - Dependencies installed, `.env.example` template created, comprehensive setup guide created in `SETUP.md`

---

## Phase 2: Foundation (Blocking Prerequisites)

**Goal**: Build shared infrastructure needed by ALL user stories

### Backend Foundation

- [x] T010 [P] Create MongoDB connection utility in `lib/mongodb.js` with connection pooling for serverless
- [x] T011 [P] Create Cloudinary client setup in `lib/cloudinary.js` with signed upload configuration
- [x] T012 [P] Create JWT utility functions in `lib/auth.js`: `generateAccessToken`, `generateRefreshToken`, `verifyToken`
- [x] T013 [P] Create password hashing utilities in `lib/auth.js`: `hashPassword` (bcrypt), `comparePassword`
- [x] T014 [P] Create authentication middleware in `lib/middleware.js`: `requireAuth` (JWT verification)
- [x] T015 [P] Create error handling utilities in `lib/errors.js`: structured error responses, consistent HTTP codes

### Frontend Foundation

- [x] T016 [P] Create AuthContext in `src/contexts/AuthContext.jsx` for global auth state management
- [x] T017 [P] Create useAuth hook in `src/hooks/useAuth.js` for convenient auth access
- [x] T018 [P] Create ProtectedRoute component in `src/components/ProtectedRoute.jsx` for route guards
- [x] T019 [P] Create API client utility in `src/services/apiClient.js` with JWT token injection

**Acceptance**: All shared utilities functional, authentication foundation ready, API client configured

**Status**: ✅ **COMPLETE** - All backend utilities (MongoDB, Cloudinary, JWT, auth middleware, errors) and frontend utilities (AuthContext, useAuth, ProtectedRoute, API client) created

---

## Phase 3: User Story 1 - Authentication (P1)

**Story Goal**: Users can create accounts and log in via email/password or Google/GitHub OAuth

**Independent Test**: Sign up → log out → log in → OAuth login → session persists

### Backend API

- [x] T020 [US1] Create users collection in MongoDB with indexes (email, username, OAuth IDs) per data-model.md
- [x] T021 [US1] Implement POST `/api/auth/signup` in `api/auth/signup.js` (email/password registration)
- [x] T022 [US1] Implement POST `/api/auth/login` in `api/auth/login.js` (email/password login with rate limiting)
- [x] T023 [US1] Implement GET `/api/auth/oauth/google` in `api/auth/oauth/google.js` (initiate Google OAuth flow)
- [x] T024 [US1] Implement GET `/api/auth/oauth/google/callback.js` (handle Google OAuth callback, create/update user)
- [x] T025 [US1] Implement GET `/api/auth/oauth/github` in `api/auth/oauth/github.js` (initiate GitHub OAuth flow)
- [x] T026 [US1] Implement GET `/api/auth/oauth/github/callback.js` (handle GitHub OAuth callback, create/update user)
- [x] T027 [US1] Implement POST `/api/auth/refresh` in `api/auth/refresh.js` (refresh access token)
- [x] T028 [US1] Implement POST `/api/auth/logout` in `api/auth/logout.js` (invalidate session if using sessions collection)

### Frontend UI

- [x] T029 [US1] Create Login page in `src/pages/Login.jsx` with email/password form and OAuth buttons
- [x] T030 [US1] Create Signup page in `src/pages/Signup.jsx` with registration form
- [x] T031 [US1] Update App.jsx routing to show Login for unauthenticated users, redirect authenticated to Feed

**Acceptance**: Users can sign up, log in (email or OAuth), sessions persist, logout works, rate limiting enforced

**Status**: ✅ **COMPLETE** - Full authentication system implemented with email/password + Google/GitHub OAuth, protected routes, login/logout functionality, and rate limiting

---

## Phase 4: User Story 2 - User Profiles (P1)

**Story Goal**: Users can create and edit profiles with username, display name, and profile picture

**Independent Test**: Create profile → upload avatar → edit display name → view profile → verify public visibility

### Backend API

- [ ] T032 [US2] Implement GET `/api/users/me` in `api/users/me.js` (get current user profile)
- [ ] T033 [US2] Implement PUT `/api/users/me` in `api/users/me.js` (update display name, bio)
- [ ] T034 [US2] Implement POST `/api/users/me/avatar` in `api/users/me/avatar.js` (upload profile picture to Cloudinary, max 2MB)
- [ ] T035 [US2] Implement GET `/api/users/[username].js` (get any user's profile by username)

### Frontend UI

- [ ] T036 [US2] Create Profile page in `src/pages/Profile.jsx` showing user info, follower/following counts, posts
- [ ] T037 [US2] Create EditProfile page in `src/pages/EditProfile.jsx` with form for display name, bio, avatar upload
- [ ] T038 [US2] Create UserAvatar component in `src/components/UserAvatar.jsx` for consistent avatar display
- [ ] T039 [US2] Update Navbar in `src/components/Navbar.jsx` to show user avatar and dropdown menu (profile, logout)

**Acceptance**: Users can set profile info during signup, view own/others' profiles, upload avatars, edit display name

---

## Phase 5: User Story 3 - Following & Personalized Feed (P1)

**Story Goal**: Users can follow others and see personalized feeds with own posts + followed users' public posts

**Independent Test**: Follow user → see their public posts in feed → unfollow → posts disappear → create private post → verify not in follower's feed

### Backend API

- [ ] T040 [US3] Create follows collection in MongoDB with compound index (followerId, followingId) per data-model.md
- [ ] T041 [US3] Implement POST `/api/users/[username]/follow` in `api/users/[username]/follow.js` (follow user, update counts)
- [ ] T042 [US3] Implement DELETE `/api/users/[username]/follow` in `api/users/[username]/follow.js` (unfollow user, update counts)
- [ ] T043 [US3] Implement GET `/api/users/[username]/followers` in `api/users/[username]/followers.js` (list followers with pagination)
- [ ] T044 [US3] Implement GET `/api/users/[username]/following` in `api/users/[username]/following.js` (list following with pagination)
- [ ] T045 [US3] Update GET `/api/posts` in `api/posts/index.js` to implement feed query (own posts + followed users' public posts) per research.md

### Frontend UI

- [ ] T046 [US3] Create FollowButton component in `src/components/FollowButton.jsx` with follow/unfollow toggle
- [ ] T047 [US3] Update Profile page to show Follow button for other users, display followers/following lists
- [ ] T048 [US3] Update Feed page in `src/pages/Feed.jsx` to show personalized feed (not all posts)
- [ ] T049 [US3] Add visibility toggle to PostForm component (public/private selector)

**Acceptance**: Users can follow/unfollow, feed shows correct posts respecting privacy, follower counts update

---

## Phase 6: User Story 4 - Access Posts Across Devices (P1)

**Story Goal**: Users can access their posts from any device via cloud database (MongoDB)

**Independent Test**: Create post on Device A → log in on Device B → verify post appears

### Backend API

- [ ] T050 [US4] Update posts collection schema in MongoDB to add `authorId` and `visibility` fields per data-model.md
- [ ] T051 [US4] Create indexes on posts: `{ authorId: 1, createdAt: -1 }`, `{ authorId: 1, visibility: 1, createdAt: -1 }`
- [ ] T052 [US4] Update POST `/api/posts/create` in `api/posts/create.js` to set authorId from JWT token
- [ ] T053 [US4] Update PUT `/api/posts/[id]` in `api/posts/[id].js` to enforce ownership (only author can edit)
- [ ] T054 [US4] Update DELETE `/api/posts/[id]` in `api/posts/[id].js` to enforce ownership (only author can delete)
- [ ] T055 [US4] Update GET `/api/posts/[id]` in `api/posts/[id].js` to enforce privacy (only author sees private posts)

### Frontend Services

- [ ] T056 [US4] Update `src/services/blogService.js` to use API endpoints instead of localStorage, include JWT tokens

**Acceptance**: Posts persist in MongoDB, cross-device access works, ownership enforced, privacy respected

---

## Phase 7: User Story 5 - Cloud Image Storage (P1)

**Story Goal**: Users can upload images to Cloudinary (up to 5MB post images, 2MB avatars)

**Independent Test**: Upload image with post → verify loads from Cloudinary → delete post → verify image deleted

### Backend API

- [ ] T057 [US5] Implement POST `/api/images/upload` in `api/images/upload.js` (upload to Cloudinary with compression)
- [ ] T058 [US5] Implement GET `/api/images/signed-params` in `api/images/signed-params.js` (generate signed upload URL for direct browser upload)
- [ ] T059 [US5] Implement DELETE `/api/images/[publicId]` in `api/images/delete.js` (delete from Cloudinary)
- [ ] T060 [US5] Update DELETE `/api/posts/[id]` to delete associated image when post is deleted

### Frontend Services

- [ ] T061 [US5] Create `src/services/imageService.js` with `uploadImage`, `deleteImage`, `compressImage` functions
- [ ] T062 [US5] Update PostForm component to use imageService for uploads, show progress indicator

**Acceptance**: Images upload to Cloudinary, post images display correctly, orphaned images cleaned up

---

## Phase 8: User Story 6 - localStorage Migration (P2)

**Story Goal**: Automatically migrate existing localStorage posts to MongoDB without data loss

**Independent Test**: Pre-populate localStorage with posts → load app → verify all posts migrated → localStorage cleared

### Backend API

- [ ] T063 [US6] Implement POST `/api/migrate` in `api/migrate.js` (bulk create posts from migration, upload base64 images)

### Frontend Migration

- [ ] T064 [US6] Create `src/services/migrationService.js` with localStorage read, transform, and upload logic
- [ ] T065 [US6] Update App.jsx to check for localStorage posts on mount, trigger migration
- [ ] T066 [US6] Create MigrationStatus component in `src/components/MigrationStatus.jsx` showing progress
- [ ] T067 [US6] Implement migration UI: show status, handle errors, clear localStorage on success
- [ ] T068 [US6] Add migration completed flag to prevent re-migration

**Acceptance**: All localStorage posts migrated, images uploaded to Cloudinary, localStorage cleared, 100% data preservation

---

## Phase 9: User Story 7 - Storage Quotas (P3)

**Story Goal**: Monitor storage usage, warn users approaching limits, stay within free tiers

**Independent Test**: Check quota display, attempt to exceed limits, verify warnings

### Backend Monitoring

- [ ] T069 [US7] Create quota calculation utilities in `lib/quotas.js` (count storage usage)
- [ ] T070 [US7] Add quota checks to POST `/api/posts/create` and POST `/api/images/upload` (warn at 80%, block at 100%)

### Frontend UI

- [ ] T071 [US7] Create QuotaDisplay component in `src/components/QuotaDisplay.jsx` showing storage usage
- [ ] T072 [US7] Add quota warnings to upload flows when approaching limits

**Acceptance**: Storage usage tracked, warnings shown at 80%, uploads blocked at 100%, users can delete old content

---

## Phase 10: Polish & Cross-Cutting Concerns

**Goal**: E2E testing, offline support, error handling, performance optimization

### Offline Support

- [ ] T073 Create IndexedDB setup in `src/utils/indexedDB.js` per data-model.md (posts cache, syncQueue)
- [ ] T074 Create offline queue service in `src/services/offlineQueue.js` (queue creates/updates/deletes when offline)
- [ ] T075 Implement online/offline detection in App.jsx, process queue on reconnect
- [ ] T076 Add offline indicators to UI (show "Syncing..." for pending operations)

### Error Handling & Validation

- [ ] T077 Create input validation utilities in `src/utils/validators.js` (email, username, password strength)
- [ ] T078 Add comprehensive error handling to all API routes (consistent error responses)
- [ ] T079 Add user-friendly error messages to all forms (show validation errors inline)
- [ ] T080 Implement rate limiting for follow operations (max 50/hour) in `/api/users/*/follow`

### Testing & Quality

- [ ] T081 Create E2E test for full auth flow: signup → login → OAuth → logout (Playwright)
- [ ] T082 Create E2E test for social flow: follow → post → feed → unfollow (Playwright)
- [ ] T083 Create E2E test for privacy: private post not visible to non-followers (Playwright)
- [ ] T084 Create E2E test for migration: localStorage → MongoDB with images (Playwright)

### Performance & Security

- [ ] T085 Optimize feed query with indexes, denormalize author info in posts for fast rendering
- [ ] T086 Implement JWT token refresh on expiry (auto-refresh before expiry)

**Acceptance**: App works offline, errors handled gracefully, all E2E tests pass, performance targets met

---

## Implementation Strategy

### MVP Scope (Recommended First Release)

**Include**: User Stories 1, 2, 3 (Auth + Profiles + Following)  
**Exclude**: US4-7 (can use mock in-memory storage temporarily)  
**Rationale**: Validates core social features before adding storage complexity

### Recommended Execution Order

1. **Week 1**: Phase 1 (Setup) + Phase 2 (Foundation) + Phase 3 (US1 - Auth)
2. **Week 2**: Phase 4 (US2 - Profiles) + Phase 5 (US3 - Following)
3. **Week 3**: Phase 6 (US4 - Posts) + Phase 7 (US5 - Images) - Parallel teams!
4. **Week 4**: Phase 8 (US6 - Migration) + Phase 9 (US7 - Quotas) + Phase 10 (Polish)

### Parallel Execution Opportunities

**After Foundation (T010-T019)**, these can run in parallel:
- **Team A**: US1 (Auth backend) + US1 (Auth frontend)
- **Team B**: US2 (Profiles backend) + US2 (Profiles frontend) - Starts after US1 backend done

**After US3**:
- **Team A**: US4 (Posts persistence)
- **Team B**: US5 (Image storage) - Completely independent!

**Setup Tasks (T003-T008)**: All parallelizable (different cloud accounts)

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 7 user stories have acceptance criteria met
- [ ] All privacy layers enforced (query, API, frontend)
- [ ] All E2E tests pass (auth, social, privacy, migration)
- [ ] Free tier limits not exceeded (MongoDB 512MB, Cloudinary 25GB)
- [ ] Performance targets met (<3s load, <10s upload, <2s follow)
- [ ] Security: passwords hashed (bcrypt), tokens httpOnly, rate limiting active
- [ ] Offline mode works (IndexedDB cache, sync queue)
- [ ] Migration tested with real localStorage data (100% preservation)

---

## Notes

- **[P] marker**: Task can be parallelized (different files, no blocking dependencies)
- **[US#]:** Task belongs to specific User Story (enables independent testing)
- **Task IDs**: Sequential (T001-T086) for execution order, but many can run in parallel
- **Dependencies**: Most user stories are sequential (US1 → US2 → US3 → US4/US5 → US6 → US7)
- **Total Estimated Time**: 3-4 weeks with 2-3 developers (or 6-8 weeks solo)

**This is a LARGE feature** - consider splitting into:
- **Feature 006**: Auth + Profiles + Following (US1-3)
- **Feature 007**: Storage + Images + Migration (US4-7)

For incremental delivery and reduced risk.
