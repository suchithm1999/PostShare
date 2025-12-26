# Tasks: Vercel Full-Stack Deployment

**Feature**: Deploy PostShare to Vercel  
**Branch**: 009-vercel-deployment  
**Created**: 2025-12-26  
**Status**: Ready for Implementation

---

## Overview

This task list breaks down the Vercel deployment into actionable, executable tasks organized by deployment phases. Each task is designed to be completed independently where possible, with clear dependencies identified.

**Total Estimated Time**: 3-5 hours  
**Difficulty**: Intermediate  
**Parallelization**: Limited (sequential deployment steps)

---

## Implementation Strategy

### MVP Approach
The entire deployment is essentially one "minimum viable product" - a working production deployment. However, we can treat custom domain configuration as optional/Phase 2.

**MVP**: Functional deployment on Vercel-provided URL (Phases 1-3)  
**Enhancement**: Custom domain and optimizations (Phase 4)

### Incremental Delivery
1. ✅ Configuration files → Local validation
2. ✅ External services setup → Connection testing
3. ✅ Initial deployment → Smoke tests
4. ✅ Production validation → Full feature testing
5. ⚡ Optimizations → Performance improvements

---

## Phase 1: Configuration Setup (1-2 hours)

**Goal**: Create all necessary configuration files for Vercel deployment

**Story**: Prepare application for serverless deployment by creating routing, build, and environment configuration

**Independent Test Criteria**:
- [ ] All configuration files validate against their schemas
- [ ] Local build completes successfully with `npm run build`
- [ ] No sensitive credentials in Git history
- [ ] Environment variable template documents all required vars

### Tasks

- [ ] T001 Create `vercel.json` in project root with routing configuration per data-model.md
- [ ] T002 Create `.vercelignore` in project root to exclude unnecessary files from deployment
- [ ] T003 Update `package.json` to add `vercel-build` script using `vite build` command
- [ ] T004 Create `.env.example` in project root documenting all 8 required environment variables
- [ ] T005 Verify `.env` and `.env.local` are in `.gitignore` to prevent credential leaks
- [ ] T006 Run `npm run build` locally to validate build process completes without errors
- [ ] T007 Test built frontend locally with `npx serve dist` to verify static file serving
- [ ] T008 Review `/lib/mongodb.js` to confirm connection pooling singleton pattern is implemented
- [ ] T009 Commit configuration files to Git: `git add vercel.json .vercelignore package.json .env.example`
- [ ] T010 Push configuration to repository: `git commit -m "feat: add Vercel deployment configuration" && git push`

**Validation Checklist**:
- [ ] `vercel.json` has correct routing rules (API routes and SPA fallback)
- [ ] `.vercelignore` excludes `node_modules`, `.env`, `specs/`, docs
- [ ] `package.json` contains `vercel-build` script
- [ ] `.env.example` lists all variables without actual values
- [ ] Build produces `dist/` directory with `index.html`
- [ ] No errors during local build process

---

## Phase 2: External Services Configuration (1 hour)

**Goal**: Set up and configure MongoDB Atlas, verify Cloudinary, prepare OAuth credentials

**Story**: Configure all external services required for production deployment

**Independent Test Criteria**:
- [ ] MongoDB Atlas cluster is accessible with connection string
- [ ] Database user can read/write to database
- [ ] Network access allows connections from any IP (0.0.0.0/0)
- [ ] Cloudinary credentials are valid and accessible
- [ ] Google OAuth credentials exist for production

### Tasks

#### MongoDB Atlas Setup

- [ ] T011 Sign up for MongoDB Atlas account at mongodb.com/cloud/atlas (if not exists)
- [ ] T012 Create new M0 Free tier cluster named "PostShare" in closest region
- [ ] T013 Wait for cluster creation to complete (1-3 minutes)
- [ ] T014 Navigate to Database Access and create database user `postshare-user` with read/write permissions
- [ ] T015 Auto-generate and securely save database user password
- [ ] T016 Navigate to Network Access and add IP address `0.0.0.0/0` (allow from anywhere - required for Vercel)
- [ ] T017 Get connection string from Connect → Drivers → Node.js (format: `mongodb+srv://...`)
- [ ] T018 Replace `<password>` placeholder in connection string with actual password
- [ ] T019 Replace `<dbname>` placeholder with `postshare` (or your database name)
- [ ] T020 Test MongoDB connection locally by temporarily adding connection string to `.env` and starting server

#### Cloudinary Verification

- [ ] T021 Verify existing Cloudinary cloud name, API key, and API secret are accessible
- [ ] T022 Test Cloudinary connection locally by uploading a test image (use existing upload endpoint)

#### Google OAuth Setup

- [ ] T023 Review existing Google OAuth credentials in Google Cloud Console
- [ ] T024 Prepare to add production redirect URIs (will do after Vercel deployment in Phase 3)

**Validation Checklist**:
- [ ] MongoDB connection string format is valid: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
- [ ] Can connect to MongoDB from local environment
- [ ] Network access shows `0.0.0.0/0` in allowed IP list
- [ ] Cloudinary credentials work for image uploads
- [ ] Google OAuth credentials are ready for production configuration

---

## Phase 3: Vercel Deployment (30 minutes)

**Goal**: Deploy application to Vercel and configure production environment

**Story**: Push application to production and configure all environment variables

**Independent Test Criteria**:
- [ ] Application is accessible at Vercel-provided URL
- [ ] All API endpoints return responses (not 404 or 500 errors)
- [ ] Environment variables are correctly configured
- [ ] Build completes without errors
- [ ] Frontend loads and displays correctly

### Tasks

#### Import and Configure Project

- [ ] T025 Go to vercel.com/dashboard and sign in to Vercel account
- [ ] T026 Click "Add New..." → "Project" to import repository
- [ ] T027 Select PostShare Git repository (authorize access if needed)
- [ ] T028 Verify Framework Preset auto-detects as "Vite"
- [ ] T029 Confirm Build Command is `npm run vercel-build` or `npm run build`
- [ ] T030 Confirm Output Directory is `dist`

#### Configure Environment Variables

- [ ] T031 Click "Environment Variables" in project configuration
- [ ] T032 Add `MONGODB_URI` with MongoDB Atlas connection string from T019 (Production environment)
- [ ] T033 Generate JWT secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and add as `JWT_SECRET`
- [ ] T034 Add `CLOUDINARY_CLOUD_NAME` from Cloudinary account settings
- [ ] T035 Add `CLOUDINARY_API_KEY` from Cloudinary account settings
- [ ] T036 Add `CLOUDINARY_API_SECRET` from Cloudinary account settings
- [ ] T037 Add `GOOGLE_CLIENT_ID` from Google Cloud Console OAuth credentials
- [ ] T038 Add `GOOGLE_CLIENT_SECRET` from Google Cloud Console OAuth credentials
- [ ] T039 Add `VITE_API_URL` with empty string value (for same-origin API requests)

#### Deploy

- [ ] T040 Click "Deploy" buttonand wait for build to start
- [ ] T041 Monitor build logs for any errors during npm install and build process
- [ ] T042 Wait for deployment to complete successfully (typically 2-5 minutes)
- [ ] T043 Copy deployed Vercel URL (e.g., `https://postshare-xyz.vercel.app`)

**Validation Checklist**:
- [ ] Build shows "Completed" status
- [ ] Deployment shows "Ready" status
- [ ] All 8 environment variables are configured
- [ ] Vercel URL is accessible and loads frontend

---

## Phase 4: OAuth Configuration & Testing (30 minutes)

**Goal**: Configure OAuth for production and validate all features work

**Story**: Complete OAuth setup and thoroughly test deployed application

**Independent Test Criteria**:
- [ ] Google OAuth sign-in flow completes successfully
- [ ] Users can create accounts and log in
- [ ] All CRUD operations work (create, read, update, delete posts)
- [ ] Image uploads function correctly
- [ ] Follow request system works
- [ ] Sessions persist across browser refreshes

### Tasks

#### Update Google OAuth

- [ ] T044 Navigate to console.cloud.google.com and select OAuth project
- [ ] T045 Go to Credentials → Select OAuth 2.0 Client ID
- [ ] T046 Add to "Authorized redirect URIs": `https://YOUR-VERCEL-URL/api/auth/oauth/google/callback` (replace with actual URL from T043)
- [ ] T047 Add to "Authorized JavaScript origins": `https://YOUR-VERCEL-URL` (replace with actual URL)
- [ ] T048 Click "Save" and wait for changes to propagate (up to 5 minutes)

#### Smoke Testing

- [ ] T049 Visit deployed Vercel URL in browser
- [ ] T050 Test signup flow: Create new test account with email/password
- [ ] T051 Verify account creation succeeds and user is logged in
- [ ] T052 Test login flow: Log out and log back in with test credentials
- [ ] T053 Test Google OAuth: Click "Sign in with Google" and complete flow
- [ ] T054 Verify OAuth authentication succeeds and user profile is created

#### Feature Testing

- [ ] T055 Create a text-only post and verify it appears in feed
- [ ] T056 Create a post with image upload and verify image displays correctly
- [ ] T057 Edit an existing post and verify changes persist
- [ ] T058 Delete a post and verify it's removed from feed
- [ ] T059 Navigate to another user's profile and send follow request
- [ ] T060 Accept/decline follow requests and verify status updates
- [ ] T061 Test private vs public post visibility settings
- [ ] T062 Log out and log back in to verify session persistence

#### Performance & Error Testing

- [ ] T063 Open browser DevTools → Network tab and measure API response times
- [ ] T064 Verify most API requests complete in under 2 seconds (excluding cold starts)
- [ ] T065 Navigate to Vercel Dashboard → Deployments → Functions tab to review logs
- [ ] T066 Check for any 500 errors or exceptions in function logs
- [ ] T067 Refresh page multiple times to observe cold start behavior (first request slower, subsequent faster)
- [ ] T068 Test concurrent usage: Open app in multiple browser tabs and perform actions

#### Security Verification

- [ ] T069 Open browser DevTools → Network tab → check request headers
- [ ] T070 Verify no sensitive environment variables are exposed in client-side code
- [ ] T071 Verify API requests use HTTPS (not HTTP)
- [ ] T072 Check that JWT tokens are properly validated (try accessing API with invalid token)
- [ ] T073 Verify OAuth redirects use HTTPS protocol

**Validation Checklist**:
- [ ] Google OAuth completes full authentication flow
- [ ] Can create account, log in, and maintain session
- [ ] All post CRUD operations work correctly
- [ ] Image uploads persist to Cloudinary
- [ ] Follow requests can be sent, accepted, declined
- [ ] No 500 errors in production logs
- [ ] API response times are acceptable (< 2s for95% of requests)
- [ ] No credentials exposed in browser

---

## Phase 5: Custom Domain & Optimization (Optional, 1 hour)

**Goal**: Configure custom domain and optimize deployment

**Story**: Add professional domain and improve performance (optional enhancement)

**Independent Test Criteria**:
- [ ] Custom domain resolves to Vercel deployment
- [ ] SSL certificate is active on custom domain
- [ ] OAuth works with custom domain
- [ ] Performance metrics are monitored

### Tasks

#### Custom Domain Setup (Optional)

- [ ] T074 Purchase or identify existing custom domain (e.g., `postshare.com`)
- [ ] T075 Go to Vercel Dashboard → Project Settings → Domains
- [ ] T076 Add custom domain and follow DNS configuration instructions
- [ ] T077 Update DNS records at domain registrar (A record or CNAME as instructed)
- [ ] T078 Wait for DNS propagation (5 minutes to 24 hours)
- [ ] T079 Verify SSL certificate auto-issues when DNS is configured
- [ ] T080 Update Google OAuth redirect URIs with custom domain
- [ ] T081 Test OAuth flow with custom domain to verify it works

#### Performance Optimization (Optional)

- [ ] T082 Review Vercel Analytics (if available) for usage patterns
- [ ] T083 Check MongoDB Atlas metrics → Connections to verify connection pooling is working
- [ ] T084 Review Function execution times and identify slow endpoints
- [ ] T085 Run `scripts/setup-indexes.js` to create database indexes for better query performance
- [ ] T086 Consider removing unused npm dependencies to reduce bundle size
- [ ] T087 Test cold start frequency and decide if Pro tier upgrade is needed

#### Documentation

- [ ] T088 Document deployed URL in project README.md
- [ ] T089 Create deployment troubleshooting guide based on any issues encountered
- [ ] T090 Document environment variable setup process for team members
- [ ] T091 Add monitoring/logging strategy to project documentation

**Validation Checklist**:
- [ ] Custom domain loads application correctly (if configured)
- [ ] SSL shows as secure in browser
- [ ] OAuth works with both Vercel URL and custom domain
- [ ] Performance metrics are tracked
- [ ] Documentation is updated

---

## Dependencies & Execution Order

### Critical Path (Must be Sequential)

```
Phase 1 (Config Files)
    ↓
Phase 2 (External Services)
    ↓
Phase 3 (Vercel Deployment)
    ↓
Phase 4 (OAuth & Testing)
    ↓
Phase 5 (Optional Enhancements)
```

### Within-Phase Parallelization

**Phase 1**: Tasks T001-T005 can be done in parallel (different files), then T006-T010 sequential

**Phase 2**: 
- MongoDB setup (T011-T020): Sequential
- Cloudinary verification (T021-T022): Can run parallel to MongoDB
- OAuth prep (T023-T024): Can run parallel to MongoDB

**Phase 3**: Mostly sequential (Vercel deployment wizard is step-by-step)

**Phase 4**: 
- OAuth setup (T044-T048): Sequential
- Testing tasks can be grouped:
  - Smoke tests (T049-T054): Sequential
  - Feature tests (T055-T062): Can test different features in parallel
  - Performance tests (T063-T068): Sequential
  - Security tests (T069-T073): Can run parallel to performance tests

**Phase 5**: All tasks are optional and can be prioritized independently

---

## Task Summary

| Phase | Tasks | Estimated Time | Parallelizable |
|-------|-------|----------------|----------------|
| **Phase 1**: Configuration Setup | T001-T010 (10 tasks) | 1-2 hours | Limited (5 parallel) |
| **Phase 2**: External Services | T011-T024 (14 tasks) | 1 hour | Moderate (3 groups) |
| **Phase 3**: Vercel Deployment | T025-T043 (19 tasks) | 30 minutes | No (wizard flow) |
| **Phase 4**: OAuth & Testing | T044-T073 (30 tasks) | 30 minutes | High (testing groups) |
| **Phase 5**: Optional Enhancements | T074-T091 (18 tasks) | 1 hour | High (independent) |
| **Total** | **91 tasks** | **3-5 hours** | **Moderate overall** |

---

## Rollback Strategy

If deployment fails at any phase:

**Phase 1 Issues**:
- Review configuration file syntax
- Validate against schemas in data-model.md
- Test build locally before proceeding

**Phase 2 Issues**:
- Verify MongoDB Atlas cluster status
- Check network access rules
- Test connection strings locally first

**Phase 3 Issues**:
- Review Vercel build logs for specific errors
- Verify all environment variables are set correctly
- Can rollback to previous Vercel deployment via dashboard

**Phase 4 Issues**:
- Double-check OAuth redirect URIs match exactly
- Clear browser cache/cookies
- Review function logs for API errors

**Phase 5 Issues**:
- DNS issues are usually propagation delays (wait longer)
- Can remove custom domain and revert to Vercel URL

---

## Success Criteria Validation

After completing all critical phases (1-4), validate against spec.md success criteria:

- [ ] **Functionality**: All application features work in production identically to local development
- [ ] **Accessibility**: Application is accessible at Vercel-provided domain
- [ ] **Performance**: 95% of API requests complete within 2 seconds (excluding cold starts)
- [ ] **Uptime**: Monitor for 99% uptime over first week (Vercel provides uptime dashboard)
- [ ] **Authentication**: Users can sign up, log in with email/Google, and maintain sessions
- [ ] **Data Persistence**: User posts, profiles, and follows persist correctly in MongoDB Atlas
- [ ] **Error Rate**: Less than 2% of requests result in 5xx server errors (check function logs)
- [ ] **Security**: No sensitive credentials exposed in client-side code or network requests

---

## Next Steps After Completion

1. **Monitoring**: Set up regular checks of Vercel function logs
2. **Performance**: Monitor MongoDB Atlas connection metrics
3. **User Feedback**: Gather feedback from initial users
4. **Optimization**: Address any performance bottlenecks discovered
5. **Documentation**: Keep deployment docs updated with lessons learned

---

## Notes

- **No Code Changes Required**: Deployment uses existing application code as-is
- **Configuration Only**: All tasks involve configuration, setup, and validation
- **Reversible**: Can rollback deployments via Vercel dashboard
- **Incremental**: Each phase provides validation points to catch issues early
- **Cost**: Free with all service free tiers (MongoDB M0, Vercel Hobby, Cloudinary free)

---

**Ready to Execute**: Yes  
**Complexity**: Intermediate  
**Risk Level**: Low (reversible, well-documented)
