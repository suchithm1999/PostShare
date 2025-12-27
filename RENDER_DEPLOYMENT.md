# Deploy PostShare to Render - Complete Guide

**Platform**: Render.com  
**App Type**: Full-Stack MERN (MongoDB, Express, React, Node.js)  
**Cost**: Free tier available  
**Time**: 30-45 minutes

---

## Why Render?

✅ **No function limits** - Your 22 API routes work as-is!  
✅ **Real Node.js server** - Not serverless, traditional backend  
✅ **Free tier** - Free web services with limitations (spins down after 15 min inactivity)  
✅ **Auto-deploy** - Deploys automatically from GitHub  
✅ **Built-in SSL** - HTTPS enabled automatically  
✅ **Easy setup** - Simpler than Vercel for full-stack apps

---

## Prerequisites

- [ ] GitHub account with PostShare repository
- [ ] MongoDB Atlas account (free tier)
- [ ] Cloudinary account
- [ ] Google OAuth credentials
- [ ] 30 minutes of time

---

## Part 1: Prepare Your Code (5 minutes)

### Step 1: Create Render Configuration Files

Create a `render.yaml` in your project root:

```yaml
services:
  # Backend API Service
  - type: web
    name: postshare-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: node start-server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
    healthCheckPath: /api/health

  # Frontend Static Site
  - type: web
    name: postshare-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://postshare-api.onrender.com/api
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Step 2: Add Health Check Endpoint

Create `api/health.js`:

```javascript
/**
 * Health check endpoint for Render
 */
export default async function handler(req, res) {
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}
```

### Step 3: Update CORS Configuration

Update `start-server.js` to allow your Render frontend:

Find the CORS configuration and update it:

```javascript
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://postshare-frontend.onrender.com', // Add your Render frontend URL
        process.env.FRONTEND_URL // Add this for flexibility
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200,
};
```

### Step 4: Commit Changes

```bash
git add render.yaml api/health.js start-server.js
git commit -m "feat: add Render deployment configuration"
git push origin 008-mobile-ux-polish
```

---

## Part 2: Set Up MongoDB Atlas (If Not Done)

If you haven't set up MongoDB Atlas yet:

1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Create database user with password
4. **Network Access** → Allow access from `0.0.0.0/0` (required for Render)
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/postshare`

---

## Part 3: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your **PostShare** repository
3. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `postshare-api` |
   | **Region** | Closest to you (e.g., Oregon) |
   | **Branch** | `008-mobile-ux-polish` |
   | **Root Directory** | Leave blank |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node start-server.js` |
   | **Instance Type** | `Free` |

4. Click **"Advanced"** to add environment variables

### Step 3: Add Environment Variables

Add each variable (click "Add Environment Variable"):

| Key | Value | Secret? |
|-----|-------|---------|
| `NODE_ENV` | `production` | No |
| `PORT` | `3000` | No |
| `MONGODB_URI` | Your MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Yes |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | No |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | Yes |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | Yes |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Yes |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Yes |

5. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- Render will build and deploy your backend (~3-5 minutes)
- You'll get a URL like: `https://postshare-api.onrender.com`
- **Save this URL!** You'll need it for the frontend

### Step 5: Test Backend

Visit: `https://postshare-api.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-27T...",
  "uptime": 123.45
}
```

---

## Part 4: Deploy Frontend to Render (10 minutes)

### Step 1: Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect your **PostShare** repository (same repo!)
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `postshare-frontend` |
   | **Branch** | `008-mobile-ux-polish` |
   | **Build Command** | `npm run build` |
   | **Publish Directory** | `dist` |

4. Add environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://postshare-api.onrender.com/api` |

   (Use the backend URL from Step 3)

5. Click **"Create Static Site"**

### Step 2: Wait for Deployment

- Render builds your Vite app (~2-3 minutes)
- You'll get a URL like: `https://postshare-frontend.onrender.com`

---

## Part 5: Update OAuth Configuration (5 minutes)

### Google OAuth

1. Go to https://console.cloud.google.com
2. Select your OAuth project
3. **Credentials** → Your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   ```
   https://postshare-api.onrender.com/api/auth/oauth/google/callback
   ```

5. Add **Authorized JavaScript origins**:
   ```
   https://postshare-frontend.onrender.com
   https://postshare-api.onrender.com
   ```

6. Click **"Save"**

---

## Part 6: Update Backend CORS (Important!)

Your backend needs to allow requests from the frontend domain:

1. Go to Render Dashboard → **postshare-api** service
2. **Environment** tab
3. Add new variable:

   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://postshare-frontend.onrender.com` |

4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## Part 7: Test Your Deployed App (5 minutes)

Visit your frontend: `https://postshare-frontend.onrender.com`

### Test Checklist

- [ ] Homepage loads
- [ ] Sign up with email/password works
- [ ] Login works
- [ ] Google OAuth login works
- [ ] Create a text post
- [ ] Upload image with post
- [ ] Edit post
- [ ] Delete post
- [ ] Send follow request
- [ ] Accept/decline follow request
- [ ] View user profiles
- [ ] Session persists after refresh

---

## Important Notes

### Free Tier Limitations

⚠️ **Backend spins down after 15 minutes of inactivity**
- First request after inactivity takes ~30-60 seconds (cold start)
- Subsequent requests are fast (<100ms)
- Consider upgrading to paid tier ($7/month) for always-on

✅ **No function limits!**
- All 22 API routes work perfectly
- Traditional Node.js server, not serverless

### Performance Tips

1. **Database Connection Pooling**: Already implemented in `lib/mongodb.js` ✅
2. **Keep-Alive Pings**: Optional - ping your backend every 14 minutes to keep it warm
3. **Caching**: Render includes CDN caching for static assets automatically

---

## Troubleshooting

### Backend won't start

**Check logs**: Render Dashboard → postshare-api → Logs

Common issues:
- Missing environment variables
- MongoDB connection string incorrect
- Port binding issue (Render sets PORT automatically)

### Frontend can't reach backend

1. Check `VITE_API_URL` is set correctly
2. Check CORS configuration in `start-server.js`
3. Verify backend is running (visit health check endpoint)

### OAuth doesn't work

1. Verify redirect URIs match exactly (including `/callback` path)
2. Check authorized origins include both frontend and backend domains
3. Clear browser cookies and try again

### Images won't upload

1. Verify Cloudinary credentials in backend environment
2. Check Cloudinary account is active
3. Review backend logs for specific error

---

## Deployment Updates

When you push code changes:

1. **Backend**: Commits to `008-mobile-ux-polish` trigger auto-deploy
2. **Frontend**: Same - auto-deploys on push
3. **Rollback**: Render keeps deployment history, can rollback via dashboard

---

## Cost Comparison

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 750 hours/month, spins down after 15min |
| **Starter** | $7/month | Always-on, 512MB RAM, better performance |
| **Standard** | $25/month | 2GB RAM, autoscaling |

**Recommendation**: Start with free tier, upgrade backend to Starter ($7/month) if you need always-on.

---

## Custom Domain (Optional)

1. Buy domain (e.g., Namecheap, Google Domains)
2. Render Dashboard → Your Service → Settings → Custom Domain
3. Add domain and configure DNS records as instructed
4. SSL certificate auto-issues
5. Update OAuth redirect URIs with new domain

---

## Monitoring & Logs

**View Logs**:
- Render Dashboard → Service → Logs tab
- Real-time logs stream
- Can filter by severity

**Metrics** (Paid tiers):
- CPU usage
- Memory usage
- Request count
- Response times

---

## Success! 🎉

Your app is now live on Render!

**Frontend**: `https://postshare-frontend.onrender.com`  
**Backend**: `https://postshare-api.onrender.com`

### Next Steps

1. Share your app with friends/testers
2. Monitor logs for any issues
3. Consider upgrading backend to Starter tier for better UX
4. Add custom domain for professional URL
5. Set up monitoring/analytics

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **PostShare Issues**: File on your GitHub repo

---

**Estimated Total Time**: 30-45 minutes  
**Difficulty**: Easy  
**Cost**: Free (with limitations)
