# Running PostShare Locally with OAuth

## Option 1: Simple Testing (Email/Password Only)

Just run:
```bash
npm run dev
```

Then test email/password authentication at http://localhost:5173/

**Note**: OAuth (Google/GitHub) won't work because API routes need a backend server.

---

## Option 2: Full Local Development (OAuth Included)

### Step 1: Start the API Server
```bash
node server.js
```

This starts the backend API on http://localhost:3000

### Step 2: In a NEW terminal, start Vite
```bash
npm run dev
```

This starts the frontend on http://localhost:5173

### Step 3: Initialize Database (First Time Only)
```bash
node lib/initDb.js
```

---

## Testing

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:3000/api/auth/*

### Test Features:
1. **Signup**: http://localhost:5173/signup
2. **Login**: http://localhost:5173/login  
3. **Google OAuth**: Click "Google" button on login page
4. **GitHub OAuth**: Click "GitHub" button on login page

---

## Important Notes

1. **Two Terminals Needed**: Run `node server.js` in one, `npm run dev` in another
2. **Database Required**: Make sure MongoDB Atlas is configured in `.env.local`
3. **OAuth Configured**: Ensure Google & GitHub OAuth apps are set up in SETUP.md

---

## Production Deployment

Deploy to Vercel (API routes work automatically):
```bash
vercel login
vercel
```

OAuth will work perfectly on Vercel!
