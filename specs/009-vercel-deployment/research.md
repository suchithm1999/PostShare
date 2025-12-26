# Research: Vercel Full-Stack Deployment

**Feature**: Deploy PostShare to Vercel  
**Date**: 2025-12-26  
**Status**: Complete

---

## Overview

This document captures technical research and decisions made for deploying the full-stack PostShare application to Vercel's serverless platform.

---

## 1. MongoDB Connection Pooling in Serverless Functions

### Problem
Vercel serverless functions are stateless and ephemeral. Creating a new MongoDB connection on every function invocation would:
- Exceed MongoDB Atlas connection limits (500 for free tier)
- Cause slow responses due to connection overhead
- Lead to connection exhaustion under load

### Research Findings

**MongoDB Node.js Driver Behavior**:
- Driver maintains internal connection pool
- Supports connection reuse via MongoClient caching
- Recommended pattern: Create client once, reuse across invocations

**Vercel Serverless Execution Model**:
- Function containers may be reused across invocations (warm starts)
- Global variables persist between warm invocations
- No guarantees about container lifecycle

**Industry Best Practices** (from Vercel, MongoDB, Netlify docs):
- Store MongoClient in global variable
- Check if connected before creating new client
- Use connection pooling options in URI
- Implement graceful degradation for connection failures

### Decision

**Implement singleton pattern for MongoDB client**:

```javascript
// lib/mongodb.js
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  const db = client.db();
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
```

**Connection Pool Settings**:
- `maxPoolSize: 10` - Limit connections per function instance
- `minPoolSize: 2` - Keep minimum connections ready
- `serverSelectionTimeoutMS: 5000` - Fail fast if database unreachable

### Alternatives Considered

1. **Create connection per request**: Simple but wasteful, would hit limits
2. **Use connection pooling library (e.g., `connection-pool`)**: Unnecessary complexity
3. **External connection proxy (e.g., MongoDB Realm)**: Additional service dependency

### Rationale

Singleton pattern with global caching:
- ✅ Reuses connections across warm function invocations
- ✅ Minimal code changes (already implemented in lib/mongodb.js)
- ✅ Works with MongoDB Node.js driver's internal pooling
- ✅ Recommended by both Vercel and MongoDB

---

## 2. Environment Variable Management

### Problem
Application requires sensitive credentials (database URI, OAuth secrets, API keys) that must:
- Be available to serverless functions
- NOT be exposed to client-side code
- NOT be committed to version control
- Be easily updatable without redeployment

### Research Findings

**Vercel Environment Variables**:
- Configured in project settings dashboard
- Support multiple environments (Production, Preview, Development)
- Can be imported from `.env` file or entered manually
- Variables prefixed with `VITE_` are exposed to frontend (build-time)

**Vite Environment Variable Handling**:
- Replaces `import.meta.env.VITE_*` at build time
- Server-side env vars remain server-only
- No runtime environment variable exposure to client

**Security Best Practices**:
- Never commit `.env` to Git (add to `.gitignore`)
- Use `.env.example` as template (without values)
- Rotate secrets periodically
- Use separate credentials for production vs development

### Decision

**Hybrid approach**:

1. **Sensitive Backend Vars** (Vercel Dashboard only):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_API_SECRET`
   - `GOOGLE_CLIENT_SECRET`

2. **Frontend-Accessible Vars** (Vercel Dashboard, prefixed with `VITE_`):
   - `VITE_API_URL` (empty for same-origin)
   - `VITE_CLOUDINARY_CLOUD_NAME` (public info)

3. **Documentation** (`.env.example`):
   - List all required variables
   - Provide format examples
   - No actual values

### Alternatives Considered

1. **Commit encrypted `.env` file**: Complex key management
2. **Use secrets management service (AWS Secrets Manager, etc.)**: Overkill for this app
3. **Hardcode development values**: Security risk

### Rationale

Vercel dashboard + `.env.example`:
- ✅ Industry-standard practice
- ✅ Clear separation of sensitive vs public config
- ✅ Easy for team members to set up
- ✅ No additional services or complexity

---

## 3. OAuth Production Configuration

### Problem
Google OAuth requires exact redirect URI matching. Development uses `http://localhost:3000`, production uses `https://your-app.vercel.app`. Mismatched URIs cause authentication failures.

### Research Findings

**OAuth2 Redirect URI Requirements**:
- Must match exactly (protocol, domain, path)
- Can configure multiple redirect URIs for same app
- Separate credentials recommended for dev vs production

**Vercel Deployment URLs**:
- Provides auto-generated URL: `project-name.vercel.app`
- Supports custom domains after DNS configuration
- Preview deployments get unique URLs

**Google Cloud Console Setup**:
- Create OAuth2 credentials in Credentials section
- Add authorized redirect URIs: `https://your-app.vercel.app/api/auth/oauth/google/callback`
- Add authorized JavaScript origins: `https://your-app.vercel.app`

### Decision

**Two-phase OAuth setup**:

**Phase 1 - Initial deployment**:
1. Use Vercel-provided URL (`your-app.vercel.app`)
2. Create production OAuth credentials in Google Console
3. Add redirect URI: `https://your-app.vercel.app/api/auth/oauth/google/callback`
4. Test OAuth flow on deployed app

**Phase 2 - Custom domain (optional)**:
1. Configure custom domain in Vercel
2. Add new redirect URI with custom domain
3. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if using separate credentials
4. Remove old redirect URI after testing

### Alternatives Considered

1. **Use same OAuth credentials for dev and production**: Confusing, mixes environments
2. **Wildcard redirect URIs**: Not supported by OAuth2 spec
3. **Dynamic redirect URI construction**: Still needs to be whitelisted

### Rationale

Separate credentials per environment:
- ✅ Clear separation of dev vs production
- ✅ Can revoke production credentials without affecting dev
- ✅ Follows OAuth2 security best practices
- ✅ Multiple redirect URIs supported (can add custom domain later)

---

## 4. Vercel Serverless Function Optimization

### Problem
Cold starts (first function invocation after period of inactivity) can cause 2-3 second delays. Want to minimize impact on user experience.

### Research Findings

**Cold Start Causes**:
- Function container initialization
- Node.js runtime startup
- Module loading and dependency parsing
- Database connection establishment

**Vercel Optimization Techniques**:
- Keep function bundles small (<50MB)
- Use dynamic imports for rarely-used dependencies
- Leverage connection caching (already doing via MongoDB singleton)
- Consider upgrading to Pro tier for always-warm functions (optional)

**Acceptable Cold Start Targets**:
- Hobby tier: 2-3 seconds acceptable for low-traffic apps
- Pro tier: Can maintain warm instances, <500ms
- Enterprise: Guaranteed warm instances

### Decision

**Accept cold starts as trade-off for free/Hobby tier**:

Mitigation strategies:
1. Monitor cold start frequency via Vercel logs
2. Optimize bundle size by removing unused dependencies
3. Use connection caching (already implemented)
4. Set user expectations (loading states in UI)
5. Consider Pro tier if cold starts become problematic

**No immediate action required** - focus on correct functionality first, optimize later if needed.

### Alternatives Considered

1. **Keep-alive ping service**: Wasteful, defeats serverless cost benefits
2. **Pre-warm functions**: Not supported on Hobby tier
3. **Switch to always-on server**: Defeats purpose of serverless deployment

### Rationale

Accept cold starts initially:
- ✅ Free/low-cost deployment
- ✅ Auto-scaling for traffic spikes
- ✅ Can upgrade to Pro tier later if needed
- ✅ Most requests after first one are fast (warm starts)
- ✅ Loading states provide good UX during cold starts

---

## 5. File Upload Strategy

### Problem
Vercel serverless functions have read-only filesystem (except `/tmp`). Cannot store uploaded images on server.

### Research Findings

**Vercel Filesystem Constraints**:
- Functions can write to `/tmp` directory
- `/tmp` is ephemeral - cleared between cold starts
- Limited to 512MB in `/tmp`
- Not suitable for permanent storage

**Cloud Storage Options**:
1. **Cloudinary**: Already integrated, supports direct uploads, transformations, CDN
2. **AWS S3**: Requires additional SDK, more configuration
3. **Vercel Blob**: New service, simpler but limited features

### Decision

**Continue using Cloudinary** (already implemented):
- Images uploaded directly to Cloudinary via API
- Cloudinary URL stored in MongoDB
- Public ID used for deletion/management
- No changes needed for Vercel deployment

### Implementation Notes
Current implementation already follows best practices:
- Uses Cloudinary SDK in backend API
- Uploads via secure signed requests
- Returns optimized CDN URLs
- Handles image transformations (resize, quality)

No changes required for this deployment.

---

## 6. Build Process Configuration

### Problem
Vercel needs to know how to build the frontend and where to find API routes.

### Research Findings

**Vercel Build System**:
- Automatically detects framework (Vite, Next.js, etc.)
- Runs `npm run build` or `vercel-build` script
- Expects frontend output in `dist` or `.next` directory
- API routes in `/api` directory are detected automatically

**Vite Build Output**:
- Default output: `dist/` directory
- Contains static HTML, CSS, JS, and assets
- Optimized and minified for production
- Requires routing configuration for SPA mode

### Decision

**Standard Vite build with Vercel routing config**:

1. Add build script in `package.json`:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "vercel-build": "vite build"
     }
   }
   ```

2. Configure routing in `vercel.json`:
   ```json
   {
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/$1" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

This ensures:
- API routes are proxied correctly
- Frontend routes use client-side routing (SPA)
- Static assets are served efficiently

---

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **Database Connections** | Singleton pattern with global caching | Reuses connections, minimizes overhead, prevents limit exhaustion |
| **Environment Variables** | Vercel dashboard + `.env.example` | Secure, standard practice, easy to manage |
| **OAuth Setup** | Separate production credentials | Clear environment separation, follows best practices |
| **Cold Starts** | Accept initially, monitor and optimize if needed | Free tier trade-off, can upgrade later |
| **File Storage** | Continue using Cloudinary | Already integrated, no changes needed |
| **Build Process** | Standard Vite build + routing config | Simple, leverages Vercel auto-detection |

---

## References

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions)
- [MongoDB Atlas Serverless Best Practices](https://www.mongodb.com/docs/atlas/best-practices-connection-pooling/)
- [Vite Build Configuration](https://vitejs.dev/guide/build.html)
- [Google OAuth2 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)

---

**Research Status**: Complete  
**Ready for Implementation**: Yes
