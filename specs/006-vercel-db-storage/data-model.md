# Data Model: Persistent Storage Schema (with Authentication & Social Features)

**Feature**: 006-vercel-db-storage  
**Created**: 2025-12-25  
**Updated**: 2025-12-25 (Added authentication and social features)
**Purpose**: Define data structures for MongoDB, Cloudinary, and IndexedDB

---

## Overview

This document defines the data models for:
1. **MongoDB**: Persistent cloud storage for blog posts, **users, follows, and sessions**
2. **IndexedDB**: Client-side cache for offline support
3. **Cloudinary**: Image metadata stored in MongoDB (**now includes profile pictures**)

---

## MongoDB Collections

### Collection: `posts`

Stores all blog post documents.

#### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  title: String,                    // Post title (required, max 200 chars)
  content: String,                  // Post content (required, max 10,000 chars)
  imageUrl: String | null,          // Cloudinary URL (null if no image)
  imagePublicId: String | null,     // Cloudinary public_id for deletion
  imageMetadata: {                  // Image details (null if no image)
    width: Number,                  // Image width in pixels
    height: Number,                 // Image height in pixels
    format: String,                 // Image format (jpeg, png, webp, gif)
    bytes: Number,                  // File size in bytes
    uploadedAt: Date                // Upload timestamp
  } | null,
  authorId: ObjectId,               // User ID (reference to users collection)
  visibility: String,               // 'public' | 'private' (default: 'public')
  createdAt: Date,                  // Post creation timestamp (indexed)
  updatedAt: Date,                  // Last modification timestamp
  syncStatus: String,               // 'synced' | 'pending' | 'error' (for offline sync)
  version: Number                   // Version number (for conflict resolution)
}
```

#### Indexes

```javascript
// Primary queries: Recent posts for feed
db.posts.createIndex({ createdAt: -1 })

// User's own posts (profile page, my posts)
db.posts.createIndex({ authorId: 1, createdAt: -1 })

// Feed query: posts by followed users, filtered by visibility
db.posts.createIndex({ authorId: 1, visibility: 1, createdAt: -1 })

// Cleanup: Find orphaned images
db.posts.createIndex({ imagePublicId: 1 }, { sparse: true })
```

#### Validation Rules

```javascript
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "author", "createdAt", "updatedAt", "version"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
          description: "Post title is required, max 200 characters"
        },
        content: {
          bsonType: "string",
          minLength: 1,
          maxLength: 10000,
          description: "Post content is required, max 10,000 characters"
        },
        imageUrl: {
          bsonType: ["string", "null"],
          pattern: "^https://res\\.cloudinary\\.com/.*",
          description: "Must be a valid Cloudinary URL or null"
        },
        imagePublicId: {
          bsonType: ["string", "null"],
          description: "Cloudinary public_id for image deletion"
        },
        author: {
          bsonType: "string",
          minLength: 1,
          description: "Author identifier (currently 'anonymous', future: userId)"
        },
        syncStatus: {
          enum: ["synced", "pending", "error"],
          description: "Sync status for offline support"
        },
        version: {
          bsonType: "int",
          minimum: 1,
          description: "Version number for optimistic locking"
        }
      }
    }
  }
})
```

#### Example Document

```json
{
  "_id": "676c2f9a8e7b12a3c4d5e6f7",
  "title": "My First Cloud-Stored Post",
  "content": "This post is now stored in MongoDB Atlas instead of localStorage!",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/posts/abc123.jpg",
  "imagePublicId": "posts/abc123",
  "imageMetadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "bytes": 245678,
    "uploadedAt": "2025-12-25T10:30:00.000Z"
  },
  "author": "anonymous",
  "createdAt": "2025-12-25T10:30:00.000Z",
  "updatedAt": "2025-12-25T10:30:00.000Z",
  "syncStatus": "synced",
  "version": 1
}
```

---

### Collection: `users`

Stores user accounts, authentication credentials, and profile information.

#### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated user ID
  email: String,                    // Unique email address (indexed)
  passwordHash: String | null,      // bcrypt hash (null for OAuth-only users)
  username: String,                 // Unique username (indexed, 3-20 chars, alphanumeric_-)
  displayName: String,              // Display name (1-50 chars, any characters)
  avatarUrl: String | null,         // Cloudinary URL for profile picture
  avatarPublicId: String | null,    // Cloudinary public_id for avatar deletion
  bio: String | null,               // User bio (max 500 chars, future enhancement)
  oauthProviders: {                 // OAuth provider IDs
    google: String | null,          // Google user ID
    github: String | null           // GitHub user ID
  },
  followerCount: Number,            // Denormalized count (updated on follow/unfollow)
  followingCount: Number,           // Denormalized count (updated on follow/unfollow)
  postCount: Number,                // Denormalized count (updated on post create/delete)
  createdAt: Date,                  // Account creation timestamp
  lastLoginAt: Date,                // Last login timestamp
  isActive: Boolean,                // Account status (default: true, for soft deletion)
  role: String                      // 'user' | 'admin' (default: 'user')
}
```

#### Indexes

```javascript
// Login queries: Find by email
db.users.createIndex({ email: 1 }, { unique: true })

// Profile queries: Find by username
db.users.createIndex({ username: 1 }, { unique: true })

// OAuth queries: Find by provider ID
db.users.createIndex({ 'oauthProviders.google': 1 }, { sparse: true })
db.users.createIndex({ 'oauthProviders.github': 1 }, { sparse: true })
```

#### Validation Rules

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username", "displayName", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Valid email address required"
        },
        passwordHash: {
          bsonType: ["string", "null"],
          description: "bcrypt hash or null for OAuth-only accounts"
        },
        username: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9_-]{3,20}$",
          description: "Username: 3-20 chars, alphanumeric, underscore, hyphen"
        },
        displayName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50,
          description: "Display name: 1-50 characters"
        },
        role: {
          enum: ["user", "admin"],
          description: "User role"
        }
      }
    }
  }
})
```

#### Example Document

```json
{
  "_id": "676c2f9a8e7b12a3c4d5e6f9",
  "email": "john.doe@example.com",
  "passwordHash": "$2b$10$rXK5...", 
  "username": "johndoe",
  "displayName": "John Doe",
  "avatarUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/postshare/avatars/user123.jpg",
  "avatarPublicId": "postshare/avatars/user123",
  "bio": null,
  "oauthProviders": {
    "google": null,
    "github": null
  },
  "followerCount": 25,
  "followingCount": 42,
  "postCount": 15,
  "createdAt": "2025-12-25T09:00:00.000Z",
  "lastLoginAt": "2025-12-25T18:30:00.000Z",
  "isActive": true,
  "role": "user"
}
```

---

### Collection: `follows`

Stores following relationships between users (instant follow, no approval).

#### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  followerId: ObjectId,             // User who is following (reference to users._id)
  followingId: ObjectId,            // User being followed (reference to users._id)
  createdAt: Date                   // Timestamp when follow occurred
}
```

#### Indexes

```javascript
// Compound unique index: Prevent duplicate follows
db.follows.createIndex({ followerId: 1, followingId: 1 }, { unique: true })

// Query: Get all users that a user is following
db.follows.createIndex({ followerId: 1, createdAt: -1 })

// Query: Get all followers of a user
db.follows.createIndex({ followingId: 1, createdAt: -1 })
```

#### Example Document

```json
{
  "_id": "676c2f9a8e7b12a3c4d5e700",
  "followerId": "676c2f9a8e7b12a3c4d5e6f9",
  "followingId": "676c2f9a8e7b12a3c4d5e701",
  "createdAt": "2025-12-25T10:15:00.000Z"
}
```

**Note**: When a follow relationship is created or deleted, update the denormalized counts (`followerCount`, `followingCount`) on both user documents.

---

### Collection: `sessions` (Optional - JWT Alternative)

Stores active sessions for token invalidation (optional, only if not using pure stateless JWT).

**Note**: This collection is OPTIONAL. If using pure JWT (recommended for serverless), sessions are managed client-side. This collection would only be used for:
- Tracking active devices/sessions
- Allowing user to revoke specific sessions
- Admin monitoring of active users

#### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  userId: ObjectId,                 // User ID (reference to users._id)
  token: String,                    // JWT token (hashed for security)
  refreshToken: String,             // Refresh token (hashed)
  deviceInfo: String,               // User agent or device description
  ipAddress: String,                // IP address where session initiated
  createdAt: Date,                  // Session start time
  expiresAt: Date,                  // Session expiration (indexed for cleanup)
  isActive: Boolean                 // Session status (false = revoked)
}
```

#### Indexes

```javascript
// Find sessions by user
db.sessions.createIndex({ userId: 1, createdAt: -1 })

// Cleanup expired sessions
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Validate token
db.sessions.createIndex({ token: 1 })
```

#### Example Document

```json
{
  "_id": "676c2f9a8e7b12a3c4d5e702",
  "userId": "676c2f9a8e7b12a3c4d5e6f9",
  "token": "hash_of_jwt_token",
  "refreshToken": "hash_of_refresh_token",
  "deviceInfo": "Mozilla/5.0... Chrome/120.0",
  "ipAddress": "203.0.113.42",
  "createdAt": "2025-12-25T10:00:00.000Z",
  "expiresAt": "2026-01-01T10:00:00.000Z",
  "isActive": true
}
```

---

### Collection: `migrations` (Optional)

Tracks migration status per user (future enhancement for multi-user support).

#### Schema

```javascript
{
  _id: ObjectId,
  userId: String,                   // User identifier (currently 'anonymous')
  migratedPostsCount: Number,       // Number of posts migrated from localStorage
  migratedImagesCount: Number,      // Number of images uploaded during migration
  startedAt: Date,                  // Migration start time
  completedAt: Date | null,         // Migration completion time (null if failed)
  status: String,                   // 'in_progress' | 'completed' | 'failed'
  errors: Array<String>             // Error messages if any
}
```

#### Example Document

```json
{
  "_id": "676c2f9a8e7b12a3c4d5e6f8",
  "userId": "anonymous",
  "migratedPostsCount": 5,
  "migratedImagesCount": 3,
  "startedAt": "2025-12-25T09:00:00.000Z",
  "completedAt": "2025-12-25T09:02:15.000Z",
  "status": "completed",
  "errors": []
}
```

---

## IndexedDB Stores (Client-Side Cache)

### Database: `postshare_db`

Version: 1

### Object Store: `posts`

Mirrors MongoDB `posts` collection for offline access.

#### Schema

```javascript
{
  id: String,                       // MongoDB _id as string
  title: String,
  content: String,
  imageUrl: String | null,
  imagePublicId: String | null,
  imageMetadata: Object | null,
  author: String,
  createdAt: String,                // ISO 8601 date string
  updatedAt: String,
  syncStatus: String,
  version: Number,
  _localOnly: Boolean               // true if created offline, not yet synced
}
```

#### Indexes

```javascript
// Query by creation date (for feed ordering)
postsStore.createIndex('createdAt', 'createdAt')

// Find unsynced posts
postsStore.createIndex('syncStatus', 'syncStatus')

// Find local-only posts
postsStore.createIndex('_localOnly', '_localOnly')
```

### Object Store: `syncQueue`

Stores pending operations to sync when online.

#### Schema

```javascript
{
  id: String,                       // UUID for queue item
  operation: String,                // 'create' | 'update' | 'delete'
  collection: String,               // 'posts'
  data: Object,                     // The post data to sync
  createdAt: String,                // Queue timestamp (ISO 8601)
  retries: Number,                  // Retry count
  lastError: String | null          // Last error message
}
```

#### Example Queue Item

```json
{
  "id": "uuid-1234-5678",
  "operation": "create",
  "collection": "posts",
  "data": {
    "title": "Offline Post",
    "content": "Created while offline",
    "imageUrl": null,
    "author": "anonymous",
    "createdAt": "2025-12-25T11:00:00.000Z",
    "version": 1
  },
  "createdAt": "2025-12-25T11:00:00.000Z",
  "retries": 0,
  "lastError": null
}
```

---

## Cloudinary Asset Structure

### Upload Folder Structure

```
postshare/
├── posts/
│   ├── {post_id}_{timestamp}.jpg       # Original images
│   └── {post_id}_{timestamp}_thumb.jpg # Thumbnails (auto-generated)
└── temp/
    └── {upload_id}.jpg                 # Temporary uploads (cleaned after 1 hour)
```

### Upload Preset Configuration

**Preset Name**: `postshare_uploads`

**Settings**:
- **Folder**: `postshare/posts/`
- **Unsigned**: ❌ (use signed uploads for security)
- **Unique Filename**: ✅ (prevent collisions)
- **Overwrite**: ❌
- **Resource Type**: `image`
- **Allowed Formats**: `jpg,png,webp,gif`
- **Max File Size**: 5MB
- **Transformations**:
  - Eager transformation: `w_1920,h_1920,c_limit,q_auto,f_auto`
  - Strip metadata (EXIF)
  - Auto format (WebP for supported browsers)
  - Auto quality (optimize compression)

### Image URLs

**Original**:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/postshare/posts/{public_id}.{format}
```

**Optimized (served to users)**:
```
https://res.cloudinary.com/{cloud_name}/image/upload/w_1920,c_limit,q_auto,f_auto/v{version}/postshare/posts/{public_id}
```

**Thumbnail (for feed)**:
```
https://res.cloudinary.com/{cloud_name}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/v{version}/postshare/posts/{public_id}
```

---

## Data Model Relationships

```
┌─────────────────────────────────────────────────┐
│           Browser (Client)                       │
│  ┌─────────────────────────────────────────┐   │
│  │  IndexedDB (postshare_db)               │   │
│  │  ┌──────────┐  ┌──────────────┐         │   │
│  │  │  posts   │  │  syncQueue   │         │   │
│  │  │ (cache)  │  │ (offline ops)│         │   │
│  │  └──────────┘  └──────────────┘         │   │
│  └─────────────────────────────────────────┘   │
│           │  ▲                    │             │
│           │  │ sync               │ upload      │
│           ▼  │                    ▼             │
└───────────────────────────────────────────────┘
            │  │                    │
            │  │                    │
            ▼  │                    ▼
┌───────────────────────┐   ┌──────────────────┐
│   Vercel API Routes   │   │   Cloudinary     │
│  /api/posts/*         │   │  /api/images/*   │
└───────────────────────┘   └──────────────────┘
            │                        │
            │                        │
            ▼                        ▼
┌───────────────────────┐   ┌──────────────────┐
│   MongoDB Atlas       │   │  Cloudinary CDN  │
│   Collection: posts   │   │  Folder: posts/  │
│   Collection: migrations│  │                 │
└───────────────────────┘   └──────────────────┘
```

---

## Data Flow Examples

### Create Post with Image (Online)

1. **User uploads image** → Frontend compresses via `browser-image-compression`
2. **Upload to Cloudinary** → `POST /api/images/upload` → Returns `{ url, publicId }`
3. **Create post** → `POST /api/posts/create` with `{ title, content, imageUrl, imagePublicId }`
4. **MongoDB insert** → Returns new post document with `_id`
5. **Cache in IndexedDB** → Store post locally for offline access
6. **Update UI** → Show new post in feed

### Create Post (Offline)

1. **No image upload** (requires connection) → User can add image later
2. **Create post locally** → Add to IndexedDB with `_localOnly: true`, `syncStatus: 'pending'`
3. **Add to syncQueue** → Queue `create` operation
4. **Update UI** → Show post with "Syncing..." indicator
5. **On reconnect** → Process syncQueue → `POST /api/posts/create` → Update IndexedDB with server `_id`

### Delete Post with Image

1. **User deletes post** → Confirm dialog
2. **Delete from MongoDB** → `DELETE /api/posts/:id`
3. **Delete from Cloudinary** → `DELETE /api/images/:publicId` (if imagePublicId exists)
4. **Remove from IndexedDB** → Clear local cache
5. **Update UI** → Remove from feed

### Migration from localStorage

1. **Read localStorage** → `static_blog_posts` array
2. **For each post with base64 image**:
   - Convert base64 → Blob → File
   - Upload to Cloudinary → Get `url` and `publicId`
   - Replace `image` field with `imageUrl` and `imagePublicId`
3. **Bulk create** → `POST /api/migrate` with transformed posts array
4. **MongoDB bulk insert** → Returns inserted IDs
5. **Cache in IndexedDB** → Store all posts locally
6. **Mark completed** → Set `migration_completed: true` in localStorage
7. **Clear old data** → Remove `static_blog_posts` from localStorage

---

## Storage Capacity Estimates

### MongoDB Atlas (Free Tier: 512MB)

| Data Type | Avg Size | Quantity | Total |
|-----------|----------|----------|-------|
| Post (no image) | 1 KB | 1000 | 1 MB |
| Post (with image metadata) | 1.5 KB | 1000 | 1.5 MB |
| Indexes | - | - | ~10 MB |
| **Total Estimate** | | **2000 posts** | **12.5 MB** |

**Conclusion**: 512MB is more than sufficient for 2000+ posts with room to grow.

### Cloudinary (Free Tier: 25GB storage, 25GB bandwidth/month)

| Data Type | Avg Size | Quantity | Total |
|-----------|----------|----------|-------|
| Compressed image | 500 KB | 500 | 250 MB |
| Original backup | 2 MB | 500 | 1 GB |
| **Total Storage** | | **500 images** | **1.25 GB** |

**Bandwidth** (assuming each image viewed 10 times):
- 500 images × 500 KB × 10 views = **2.5 GB/month**

**Conclusion**: 25GB storage and bandwidth easily supports 500+ images with plenty of headroom.

### IndexedDB (Browser-dependent, typically 50MB-100MB)

| Data Type | Avg Size | Quantity | Total |
|-----------|----------|----------|-------|
| Cached posts | 1.5 KB | 100 | 150 KB |
| Sync queue items | 2 KB | 10 | 20 KB |
| **Total Estimate** | | | **170 KB** |

**Conclusion**: Well within typical IndexedDB limits, even caching 1000 posts would only use ~1.5MB.

---

## Data Validation

### Frontend Validation (Before API Call)

```javascript
const validatePost = (post) => {
  const errors = []
  
  if (!post.title || post.title.trim().length === 0) {
    errors.push('Title is required')
  }
  if (post.title && post.title.length > 200) {
    errors.push('Title must be 200 characters or less')
  }
  
  if (!post.content || post.content.trim().length === 0) {
    errors.push('Content is required')
  }
  if (post.content && post.content.length > 10000) {
    errors.push('Content must be 10,000 characters or less')
  }
  
  if (post.imageUrl && !post.imageUrl.startsWith('https://res.cloudinary.com/')) {
    errors.push('Invalid image URL')
  }
  
  return errors
}
```

### Backend Validation (API Layer)

```javascript
const validateImageUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size: 5MB')
  }
}
```

---

## Migration Compatibility

### localStorage Format (Current)

```javascript
{
  id: "uuid-v4",
  title: "Post Title",
  content: "Post content",
  date: "2025-12-25T10:30:00.000Z",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // or null
}
```

### Transformation to MongoDB Format

```javascript
const transformLocalStoragePost = async (oldPost) => {
  let imageUrl = null
  let imagePublicId = null
  let imageMetadata = null
  
  // If base64 image exists, upload to Cloudinary
  if (oldPost.image && oldPost.image.startsWith('data:image')) {
    const uploadResult = await uploadBase64ToCloudinary(oldPost.image)
    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
    imageMetadata = {
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      uploadedAt: new Date(uploadResult.created_at)
    }
  }
  
  return {
    // _id will be auto-generated by MongoDB
    title: oldPost.title,
    content: oldPost.content,
    imageUrl,
    imagePublicId,
    imageMetadata,
    author: 'anonymous',
    createdAt: new Date(oldPost.date),
    updatedAt: new Date(oldPost.date),
    syncStatus: 'synced',
    version: 1
  }
}
```

---

## Next Steps

With data model defined, proceed to:
1. **API Contracts** (`contracts/` directory): Define OpenAPI specs for all endpoints
2. **Quickstart Guide** (`quickstart.md`): Setup instructions for MongoDB and Cloudinary
