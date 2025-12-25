# Feature Specification: Persistent Database and Cloud Image Storage

**Feature Branch**: `006-vercel-db-storage`  
**Created**: 2025-12-25  
**Status**: Updated with authentication and social features  
**Input**: User description: "use mongo db for storage instead of localstorage, use a free image storage space which is free of cost for uploading of images"

## Clarifications

### Session 2025-12-25

User requested extension to add authentication and user-specific posts with social features:

- Q: What authentication method should users use to create accounts and log in? → A: Email/password + Social login (Google, GitHub)
- Q: Should users be able to see other users' posts, or only their own posts? → A: Per-post visibility control (public/private) + Follow system with feed of followed users' posts
- Q: What profile information should users be able to set beyond their email? → A: Username, display name, profile picture (avatar)
- Q: When a user follows someone, does it require approval or is it instant? → A: Instant follow (no approval needed, like Twitter/Instagram)
- Q: What should unauthenticated users (not logged in) see when they visit the app? → A: Login/signup page only (authentication required to access app)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication and Account Creation (Priority: P1)

Users need to create accounts and log in to access the application. The system supports both traditional email/password authentication and social login (Google, GitHub) for user convenience and security.

**Why this priority**: Foundation for all other features. Without authentication, users cannot own their posts, follow others, or have personalized experiences. This is the entry point to the application.

**Independent Test**: Can be fully tested by signing up with email/password, logging out, logging back in, then testing social login (Google/GitHub). Verifies account creation, session management, and multiple auth methods.

**Acceptance Scenarios**:

1. **Given** a new visitor opens the app, **When** they see the login page, **Then** they can choose email/password signup or social login (Google/GitHub)
2. **Given** a user fills out the signup form (email, password, username), **When** they submit, **Then** an account is created and they are logged in automatically
3. **Given** a user clicks "Sign in with Google", **When** they authorize the app, **Then** their account is created/logged in using their Google profile
4. **Given** a user clicks "Sign in with GitHub", **When** they authorize the app, **Then** their account is created/logged in using their GitHub profile
5. **Given** a logged-in user, **When** they navigate away and return, **Then** they remain logged in (session persists)
6. **Given** a user logs out, **When** they try to access the feed, **Then** they are redirected to the login page

---

### User Story 2 - User Profiles and Identity (Priority: P1)

Users need to establish their identity on the platform with a username, display name, and profile picture. This enables recognition, @mentions, and a personalized social experience.

**Why this priority**: Core to social functionality. Users need identifiable profiles to follow each other, be recognized in feeds, and build their presence. Without profiles, the social features lose meaning.

**Independent Test**: Can be fully tested by creating an account, setting up profile (username, display name, avatar), viewing own profile, and verifying profile appears correctly when following/followed by others.

**Acceptance Scenarios**:

1. **Given** a new user completes signup, **When** they are prompted to set up their profile, **Then** they can enter username, display name, and upload a profile picture
2. **Given** a user uploads a profile picture, **When** the image is under 2MB, **Then** it uploads successfully and displays as their avatar
3. **Given** a user sets a username, **When** they submit, **Then** the username is validated for uniqueness and allowed characters (alphanumeric, underscore, hyphen)
4. **Given** a user views their own profile, **When** they click edit, **Then** they can update display name and profile picture (username is locked after creation)
5. **Given** a user's profile is viewed by another user, **When** the profile loads, **Then** it shows username, display name, avatar, follower/following counts, and public posts

---

### User Story 3 - Follow Users and Personalized Feed (Priority: P1)

Users can follow other users to see their public posts in a personalized feed. Following is instant (no approval needed), encouraging network growth and content discovery.

**Why this priority**: Core social functionality. The feed is the primary interface where users consume content. Following enables users to curate their experience and connect with others.

**Independent Test**: Can be fully tested by creating two accounts, having one follow the other, posting a public post, and verifying it appears in the follower's feed. Tests instant follow and feed composition.

**Acceptance Scenarios**:

1. **Given** a user views another user's profile, **When** they click "Follow", **Then** they immediately start following that user (no approval needed)
2. **Given** a user follows another user, **When** the followed user creates a public post, **Then** it appears in the follower's feed
3. **Given** a user unfollows someone, **When** they view their feed, **Then** that user's posts no longer appear
4. **Given** a user views their feed, **When** the feed loads, **Then** it shows their own posts + public posts from users they follow, ordered by creation date (newest first)
5. **Given** a user has no followers, **When** they create a private post, **Then** only they can see it
6. **Given** a user creates a public post, **When** their followers view their feeds, **Then** the post appears for all followers

---

### User Story 4 - Access Posts Across Devices (Priority: P1)

Users currently lose their blog posts when clearing browser data or switching devices because posts are stored only in browser localStorage. This feature enables users to access their posts from any device by storing data in a persistent cloud database.

**Why this priority**: This is the core value proposition - enabling data persistence and multi-device access. Without this, users can't reliably use the application across devices or protect their content.

**Independent Test**: Can be fully tested by creating a post on one browser/device, then logging in from a different browser/device and verifying the post appears. Delivers immediate value by enabling cross-device access.

**Acceptance Scenarios**:

1. **Given** a user has created posts on Device A, **When** they access the application from Device B, **Then** all their previously created posts are visible
2. **Given** a user clears their browser cache, **When** they reload the application, **Then** all their posts remain accessible
3. **Given** posts exist in the database, **When** the application loads, **Then** posts appear within 3 seconds

---

### User Story 5 - Upload and Store Images Reliably (Priority: P1)

Users currently store images as base64 data URLs in localStorage, which is limited in size (~5-10MB total) and can cause performance issues. This feature enables users to upload images to cloud storage, allowing for larger files and better performance.

**Why this priority**: Essential for core functionality. Image uploads are a primary feature of the blog, and localStorage limitations severely restrict usability. This enables reliable image handling at scale.

**Independent Test**: Can be fully tested by uploading images of various sizes (up to 5MB), creating posts with those images, and verifying images load correctly. Delivers value by removing storage constraints.

**Acceptance Scenarios**:

1. **Given** a user selects an image to upload, **When** the image is under 5MB, **Then** the image uploads successfully and appears in the post
2. **Given** an image has been uploaded, **When** the post is saved, **Then** the image URL is stored with the post and remains accessible
3. **Given** a user uploads an image over 5MB, **When** the upload is attempted, **Then** the system provides a clear error message about file size limits
4. **Given** images are stored in cloud storage, **When** a post is loaded, **Then** images display correctly without base64 encoding

---

### User Story 6 - Seamless Migration from localStorage (Priority: P2)

Existing users have posts stored in localStorage that need to be preserved when the new storage system is implemented. This feature automatically migrates existing localStorage data to the persistent database without data loss.

**Why this priority**: Important for user retention and trust. Protects existing user data and ensures a smooth transition. Not P1 because it's a one-time migration concern, not core ongoing functionality.

**Independent Test**: Can be fully tested by pre-populating localStorage with sample posts, then loading the updated application and verifying all posts are migrated to the database. Delivers value by preserving user work.

**Acceptance Scenarios**:

1. **Given** a user has existing posts in localStorage, **When** they first load the updated application, **Then** all posts are automatically migrated to the database
2. **Given** posts have been migrated, **When** the migration is complete, **Then** localStorage is cleared to prevent duplication
3. **Given** migration is in progress, **When** the user navigates the application, **Then** they see a migration status indicator
4. **Given** migration fails, **When** an error occurs, **Then** localStorage data is preserved and user is notified

---

### User Story 7 - Manage Storage Costs and Limits (Priority: P3)

Since the application uses free-tier cloud services, there are storage limits and quotas that need to be managed. This feature provides visibility into storage usage and enforces limits to stay within free tier constraints.

**Why this priority**: Important for sustainability but not blocking core functionality. Can be added after basic persistence works. Users can still create posts without detailed quota management.

**Independent Test**: Can be tested by checking storage metrics, attempting to exceed quotas, and verifying appropriate error handling. Delivers value by ensuring long-term viability.

**Acceptance Scenarios**:

1. **Given** a user approaches storage limits, **When** they attempt to upload new content, **Then** they receive a warning about approaching quota limits
2. **Given** storage quota is exceeded, **When** a new post or image is attempted, **Then** the system provides a clear error message and suggests actions
3. **Given** an administrator views the system, **When** they check usage metrics, **Then** current storage usage and limits are displayed

---

### Edge Cases

#### Authentication & User Management
- What happens when a user tries to sign up with an already-registered email? (Clear error: "Email already in use", suggest login or password reset)
- What happens when OAuth provider (Google/GitHub) is temporarily down? (Show error message, offer email/password alternative)
- What happens when a user's JWT token expires mid-session? (Gracefully refresh token or prompt re-login with saved state)
- What happens when a user tries to set a username that's already taken? (Real-time validation shows "Username unavailable", suggest alternatives)
- What happens if a user clicks "Forgot Password"? (Not in scope for this feature - add to future roadmap)

#### Social Features & Privacy
- What happens when User A unfollows User B while viewing User B's posts? (Posts remain visible until User A refreshes their feed)
- What happens when a user changes a post from public to private? (Post immediately disappears from followers' feeds)
- What happens when User A follows User B who has no public posts? (Follow succeeds, but no posts appear in feed until User B posts publicly)
- What happens when a user tries to follow themselves? (Prevent with validation: "You cannot follow yourself")
- What happens when a user tries to follow the same person twice? (Idempotent operation - no error, just remains followed)

#### Data Persistence & Storage (Original Edge Cases)
- What happens when the database connection is lost during post creation? (System should queue the action and retry, or save locally as draft)
- How does the system handle image upload failures? (Retry mechanism with user notification, fallback to draft mode)
- What happens if a user has duplicate data in both localStorage and database? (Database takes precedence, localStorage is cleared after migration)
- How does the system handle concurrent edits from multiple devices? (Last-write-wins with timestamp, or conflict detection)
- What happens when image storage quota is exceeded? (Clear error message, prevent new uploads, allow deleting old images to free space)
- How does the system handle slow network connections during image uploads? (Progress indicator, upload timeout with retry option)
- What happens to orphaned images (uploaded but not attached to any post/profile)? (Cleanup process to remove unused images after grace period)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & User Management

- **FR-001**: System MUST support user signup with email and password
- **FR-002**: System MUST hash passwords using bcrypt or equivalent before storing
- **FR-003**: System MUST support social login via Google OAuth 2.0
- **FR-004**: System MUST support social login via GitHub OAuth
- **FR-005**: System MUST generate and manage JWT tokens for authenticated sessions
- **FR-006**: System MUST validate JWT tokens on all protected API endpoints
- **FR-007**: System MUST redirect unauthenticated users to the login page when they attempt to access the application
- **FR-008**: System MUST allow users to log out and invalidate their session
- **FR-009**: System MUST require unique email addresses (no duplicate accounts)
- **FR-010**: System MUST require unique usernames (case-insensitive validation)

#### User Profiles

- **FR-011**: System MUST allow users to set a username during account creation (alphanumeric, underscore, hyphen only, 3-20 characters)
- **FR-012**: System MUST allow users to set a display name (any characters, 1-50 characters)
- **FR-013**: System MUST allow users to upload a profile picture (max 2MB, JPEG/PNG/WebP/GIF only)
- **FR-014**: System MUST store profile pictures in cloud storage (same service as post images)
- **FR-015**: System MUST display user profiles showing username, display name, avatar, follower count, following count, and public posts
- **FR-016**: System MUST allow users to edit their display name and profile picture (username locked after creation)

#### Social Features - Following

- **FR-017**: System MUST allow users to follow other users instantly (no approval required)
- **FR-018**: System MUST allow users to unfollow users they are currently following
- **FR-019**: System MUST display follower count and following count on user profiles
- **FR-020**: System MUST display lists of followers and users being followed on profiles

#### Post Visibility & Privacy

- **FR-021**: System MUST allow users to mark each post as public or private when creating/editing
- **FR-022**: System MUST show private posts only to the post author
- **FR-023**: System MUST show public posts to the author and their followers in their feeds
- **FR-024**: System MUST NOT show any posts to unauthenticated users

#### Feed Composition

- **FR-025**: System MUST compose user feed from: (1) all posts by the user, (2) public posts by users they follow
- **FR-026**: System MUST order feed posts by creation date (newest first)
- **FR-027**: System MUST support pagination for feed (load more posts)
- **FR-028**: System MUST update feed in real-time when user creates a new post

#### Data Persistence & Storage (Original Requirements)

- **FR-029**: System MUST persist blog posts to a cloud database that survives browser cache clearing and device changes
- **FR-030**: System MUST store uploaded images in a cloud storage service separate from the database
- **FR-031**: System MUST support image uploads up to 5MB in size (post images) and 2MB (profile pictures)
- **FR-032**: System MUST automatically migrate existing localStorage posts to the database on first application load after deployment
- **FR-033**: System MUST preserve all existing post data during migration, including title, content, images, timestamps, and any metadata
- **FR-034**: System MUST provide user feedback during image upload operations (progress, success, failure)
- **FR-035**: System MUST generate and store unique, persistent URLs for uploaded images
- **FR-036**: System MUST handle database connection failures gracefully without data loss
- **FR-037**: System MUST validate image file types (JPEG, PNG, GIF, WebP only)
- **FR-038**: System MUST compress images before upload to optimize storage usage
- **FR-039**: System MUST stay within free-tier limits of chosen cloud services (estimated: 10GB storage, 5000 monthly requests)
- **FR-040**: System MUST work when deployed to Vercel without additional configuration beyond environment variables
- **FR-041**: System MUST sync post data between database and UI within 3 seconds of any change
- **FR-042**: System MUST handle concurrent access from multiple devices by the same user
- **FR-043**: System MUST clean up orphaned images (uploaded but not associated with any post/profile) after 7 days
- **FR-044**: System MUST maintain existing application functionality (create, edit, delete, view posts) with new storage backend
- **FR-045**: System MUST provide clear error messages when storage operations fail
- **FR-046**: System MUST support offline mode by caching posts locally and syncing when connection is restored

### Key Entities

- **User**: Represents a registered user account with authentication credentials (email, hashed password), OAuth provider information (Google/GitHub ID), profile details (username, display name, profile picture URL), social connections (followers, following lists), account metadata (creation date, last login), and storage quota usage
- **BlogPost**: Represents a user-created blog entry with title, content, visibility setting (public/private), creation/modification timestamps, author reference (User ID), and references to associated images (post image URLs)
- **Follow**: Represents a following relationship between two users, with follower ID, following ID (user being followed), and timestamp of when the follow action occurred
- **ImageAsset**: Represents an uploaded image with unique identifier, storage URL (Cloudinary), upload timestamp, file size, dimensions, image type (post_image or profile_picture), and association to parent entity (post ID or user ID)
- **Session**: Represents an active user session with JWT token, user reference, creation time, expiration time, and device/browser information for security
- **MigrationRecord**: Tracks migration status of localStorage data, including user ID (for newly authenticated users), migration timestamp, number of posts migrated, and any errors encountered

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Authentication & Social Features

- **SC-001**: Users can create an account and log in within 30 seconds (90% success rate)
- **SC-002**: Email/password signup completes within 5 seconds (P95)
- **SC-003**: Social login (Google/GitHub) completes within 10 seconds including OAuth redirect (P95)
- **SC-004**: User sessions remain valid for 7 days without requiring re-login
- **SC-005**: 95% of authentication attempts succeed on first try (valid credentials)
- **SC-006**: Password security: All passwords hashed with bcrypt (cost factor ≥10)
- **SC-007**: Profile setup (username, display name, avatar) completes within 15 seconds (P95)
- **SC-008**: Profile picture uploads (under 2MB) complete within 8 seconds (P95)
- **SC-009**: Following a user takes less than 2 seconds to complete and update UI
- **SC-010**: User feed loads within 3 seconds showing correct posts (own + followed users' public posts)
- **SC-011**: Feed correctly excludes private posts from other users (100% privacy enforcement)
- **SC-012**: Unauthenticated users are immediately redirected to login page (100% of attempts)

#### Data Persistence & Storage

- **SC-013**: Users can access their posts from any device after creating them on a different device (100% success rate)
- **SC-014**: Application loads existing posts within 3 seconds on average network conditions
- **SC-015**: Image uploads complete within 10 seconds for files up to 5MB on average network conditions
- **SC-016**: Zero data loss during migration from localStorage to database (100% of existing posts preserved)
- **SC-017**: Application remains functional when deployed to Vercel with 100% feature parity
- **SC-018**: Storage costs remain at $0/month by staying within free-tier limits for at least 100 users
- **SC-019**: 95% of storage operations (create, read, update, delete) complete successfully without errors
- **SC-020**: Users receive clear feedback within 2 seconds for all storage operations (upload, save, delete)
- **SC-021**: Application handles network failures gracefully with 0% data loss through draft/queue mechanisms
- **SC-022**: 90% of users successfully complete the migration process without manual intervention

### Assumptions

- Users will have internet connectivity to access cloud storage (offline support is degraded functionality with eventual sync)
- Free-tier limits for database and image storage will be sufficient for initial user base (~100 users, ~1000 posts, ~500 images)
- Vercel deployment environment supports server-side operations needed for database and storage access
- Image compression before upload can reduce file sizes by ~50% on average
- MongoDB Atlas free tier (suggested implementation) provides sufficient resources: 512MB storage, shared infrastructure
- Cloudinary free tier (suggested implementation) provides sufficient resources: 25GB storage, 25GB monthly bandwidth

### Dependencies

- Reliable cloud database service with free tier (e.g., MongoDB Atlas, Supabase, Firebase)
- Cloud image storage service with free tier (e.g., Cloudinary, Uploadcare, ImageKit)
- Vercel deployment platform compatibility with chosen services
- Environment variable management for API keys and connection strings
- OAuth 2.0 providers (Google, GitHub) for social login integration
- JWT library for token generation and validation

### Out of Scope

- Real-time collaboration features (multiple users editing same post simultaneously)
- Advanced image editing capabilities (filters, cropping beyond basic resize)
- Post versioning/revision history
- Full-text search functionality across posts
- Automated content moderation or filtering
- Custom domains or white-labeling
- Analytics or usage tracking
