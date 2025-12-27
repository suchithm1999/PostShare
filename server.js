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
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import API routes
import signup from './api/auth/signup.js';
import login from './api/auth/login.js';
import refresh from './api/auth/refresh.js';
import logout from './api/auth/logout.js';
import googleOAuth from './api/auth/oauth/google.js';
import googleCallback from './api/auth/oauth/google/callback.js';
import githubOAuth from './api/auth/oauth/github.js';
import githubCallback from './api/auth/oauth/github/callback.js';

// User profile routes
import userMe from './api/users/me.js';
import userAvatar from './api/users/me/avatar.js';
import userByUsername from './api/users/[username].js';
import userFollow from './api/users/[username]/follow.js';
import userFollowers from './api/users/[username]/followers.js';
import userFollowing from './api/users/[username]/following.js';
import followRequest from './api/users/[username]/follow-request.js';

// Follow requests routes
import getFollowRequests from './api/users/me/follow-requests/index.js';
import handleFollowRequest from './api/users/me/follow-requests/[id].js';
import getSentRequests from './api/users/me/sent-requests/index.js';
import cancelSentRequest from './api/users/me/sent-requests/[id].js';

// Posts routes
import getPosts from './api/posts/index.js';
import createPost from './api/posts/create.js';
import postById from './api/posts/[id].js';

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

// User profile routes
app.get('/api/users/me', wrapHandler(userMe));
app.put('/api/users/me', wrapHandler(userMe));
app.post('/api/users/me/avatar', wrapHandler(userAvatar));
app.delete('/api/users/me/avatar', wrapHandler(userAvatar));

// Follow request routes (user's own requests)
app.get('/api/users/me/follow-requests', wrapHandler(getFollowRequests));
app.post('/api/users/me/follow-requests/:id/accept', wrapHandler(handleFollowRequest));
app.post('/api/users/me/follow-requests/:id/decline', wrapHandler(handleFollowRequest));
app.get('/api/users/me/sent-requests', wrapHandler(getSentRequests));
app.delete('/api/users/me/sent-requests/:id', wrapHandler(cancelSentRequest));

// Follow routes (must be before :username route to avoid conflicts)
app.post('/api/users/:username/follow-request', wrapHandler(followRequest));
app.post('/api/users/:username/follow', wrapHandler(userFollow));
app.delete('/api/users/:username/follow', wrapHandler(userFollow));
app.get('/api/users/:username/followers', wrapHandler(userFollowers));
app.get('/api/users/:username/following', wrapHandler(userFollowing));

// Username route (must be last among user routes)
app.get('/api/users/:username', wrapHandler(userByUsername));

// Posts routes
app.get('/api/posts', wrapHandler(getPosts));
app.post('/api/posts/create', wrapHandler(createPost));
app.get('/api/posts/:id', wrapHandler(postById));
app.put('/api/posts/:id', wrapHandler(postById));
app.delete('/api/posts/:id', wrapHandler(postById));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📝 Auth endpoints available at http://localhost:${PORT}/api/auth/*`);
    console.log(`👤 User endpoints available at http://localhost:${PORT}/api/users/*`);
    console.log(`📮 Posts endpoints available at http://localhost:${PORT}/api/posts/*`);
});
