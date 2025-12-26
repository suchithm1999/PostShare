# Data Model: Vercel Deployment Configuration

**Feature**: Vercel Full-Stack Deployment  
**Date**: 2025-12-26

---

## Overview

This document defines the configuration data structures and schemas needed for deploying PostShare to Vercel. The application's database schema (Users, Posts, Follows) is already defined and requires no changes.

---

## Configuration Entities

### 1. Vercel Configuration (vercel.json)

**Purpose**: Defines deployment settings, routing rules, and build configuration for Vercel platform.

**Schema**:
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

**Field Definitions**:
- `version`: Vercel configuration format version (always 2)
- `builds[]`: Array of build configurations
  - `src`: Source file/directory to build
  - `use`: Vercel builder to use
  - `config.distDir`: Output directory for static files
- `routes[]`: Request routing rules (processed in order)
  - `src`: RegEx pattern to match request path
  - `dest`: Destination path/file to serve

**Validation Rules**:
- `version` must be 2
- At least one build configuration required
- Routes are evaluated in array order
- Catch-all route (`/(.*)`) must be last

---

### 2. Environment Variables

**Purpose**: Securely store sensitive credentials and configuration values required for production deployment.

**Schema**:

| Variable Name | Type | Required | Exposed to Client | Description |
|--------------|------|----------|-------------------|-------------|
| `MONGODB_URI` | string | Yes | No | MongoDB Atlas connection string |
| `JWT_SECRET` | string | Yes | No | Secret key for JWT token signing/verification |
| `CLOUDINARY_CLOUD_NAME` | string | Yes | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | string | Yes | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | string | Yes | No | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | string | Yes | No | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | string | Yes | No | Google OAuth2 client secret |
| `VITE_API_URL` | string | No | Yes | Backend API URL for frontend (empty for same-origin) |

**Validation Rules**:
- All required variables must be set before deployment
- Variables without `VITE_` prefix are server-only
- No sensitive values should be committed to version control
- MongoDB URI must be in valid connection string format
- JWT secret should be at least 32 characters
- Cloudinary credentials must match account
- Google OAuth credentials must match Google Cloud Console project

**Example Values** (for `.env.example` only):
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
VITE_API_URL=
```

---

### 3. Package.json Build Scripts

**Purpose**: Define build commands for

 Vercel deployment process.

**Schema**:
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

**Field Definitions**:
- `build`: Standard build command (used by Vercel auto-detection)
- `vercel-build`: Explicit Vercel build command (takes precedence over `build`)

**Validation Rules**:
- At least one of `build` or `vercel-build` must be defined
- Build command must output to `dist/` directory (or specify `distDir` in vercel.json)
- Build must complete within Vercel's time limits (10 minutes for Hobby tier)

---

### 4. Ignore Files (.vercelignore)

**Purpose**: Exclude files and directories from deployment bundle to reduce size and improve build speed.

**Schema**:
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
```

**Validation Rules**:
- Must exclude `node_modules` (dependencies installed by Vercel)
- Must exclude `.env` files (use environment variables instead)
- Should exclude development-only files (specs, docs, IDE config)
- Should not exclude necessary runtime files

---

## Integration Schemas

### MongoDB Atlas Network Access

**Purpose**: Configure MongoDB Atlas to accept connections from Vercel's serverless functions.

**Configuration**:
```json
{
  "accessList": [
    {
      "ipAddress": "0.0.0.0/0",
      "comment": "Allow from anywhere (required for serverless)"
    }
  ]
}
```

**Validation Rules**:
- `0.0.0.0/0` is required for Vercel serverless (IP addresses are dynamic)
- More restrictive rules possible with dedicated IPs (Pro/Enterprise tier)

---

### Google OAuth Redirect URIs

**Purpose**: Configure allowed redirect URIs for Google OAuth authentication.

**Configuration**:
```json
{
  "web": {
    "redirect_uris": [
      "https://your-app.vercel.app/api/auth/oauth/google/callback",
      "https://custom-domain.com/api/auth/oauth/google/callback"
    ],
    "javascript_origins": [
      "https://your-app.vercel.app",
      "https://custom-domain.com"
    ]
  }
}
```

**Validation Rules**:
- Must use HTTPS in production
- Path must match backend OAuth callback route
- Can include multiple URIs for different domains
- Origins must not include path or trailing slash

---

## State Transitions

### Deployment Workflow States

```
[Local Development]
       ↓
[Configuration Files Created]
       ↓
[Git Commit & Push]
       ↓
[Vercel Build Triggered]
       ↓
[Build Success] ←→ [Build Failure]
       ↓                    ↓
[Deployment]          [Review Logs]
       ↓                    ↓
[Health Checks]       [Fix & Retry]
       ↓
[Production] ←→ [Rollback if Issues]
```

**State Validations**:
- Cannot proceed to build without configuration files
- Build failure must be resolved before deployment
- Health checks must pass before marking deployment as successful
- Rollback available for any deployed version

---

## Existing Database Schema (No Changes Required)

The application's MongoDB schema is already defined and production-ready:

### Users Collection
- Primary key: `_id` (ObjectId)
- Unique indexes: `username`, `email`
- Relations: One-to-many with Posts, Follows

### Posts Collection
- Primary key: `_id` (ObjectId)
- Foreign key: `authorId` → Users._id
- Indexes: `authorId`, `createdAt`

### Follows Collection
- Primary key: `_id` (ObjectId)
- Foreign keys: `followerId` → Users._id, `followingId` → Users._id
- Compound unique index: `[followerId, followingId]`

**No schema changes** needed for Vercel deployment.

---

## Summary

**New Entities**:
1. `vercel.json` - Deployment configuration
2. `.vercelignore` - Build exclusions
3. `.env.example` - Environment variable template
4. Updated `package.json` scripts

**External Configurations**:
1. MongoDB Atlas network access rules
2. Google OAuth redirect URIs
3. Vercel environment variables (dashboard)

**No Database Changes**: Existing schema is deployment-ready

---

**Status**: Configuration schema complete  
**Ready for**: Implementation and testing
