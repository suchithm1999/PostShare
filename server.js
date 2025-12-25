import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5174', // Vite dev server
    credentials: true, // Allow cookies
}));
app.use(cookieParser()); // Parse cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import API routes
import signup from './api/auth/signup.js';
import login from './api/auth/login.js';
import refresh from './api/auth/refresh.js';
import logout from './api/auth/logout.js';
import googleOAuth from './api/auth/oauth/google.js';
import googleCallback from './api/auth/oauth/google/callback.js';
import githubOAuth from './api/auth/oauth/github.js';
import githubCallback from './api/auth/oauth/github/callback.js';

// Wrapper to convert Vercel serverless functions to Express handlers
const wrapHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Auth routes
app.post('/api/auth/signup', wrapHandler(signup));
app.post('/api/auth/login', wrapHandler(login));
app.post('/api/auth/refresh', wrapHandler(refresh));
app.post('/api/auth/logout', wrapHandler(logout));
app.get('/api/auth/oauth/google', wrapHandler(googleOAuth));
app.get('/api/auth/oauth/google/callback', wrapHandler(googleCallback));
app.get('/api/auth/oauth/github', wrapHandler(githubOAuth));
app.get('/api/auth/oauth/github/callback', wrapHandler(githubCallback));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📝 Auth endpoints available at http://localhost:${PORT}/api/auth/*`);
});
