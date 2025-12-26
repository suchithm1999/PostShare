/**
 * Consolidated Auth API Handler
 * Combines all auth endpoints into one serverless function
 */

import loginHandler from './auth/login.js';
import signupHandler from './auth/signup.js';
import logoutHandler from './auth/logout.js';
import refreshHandler from './auth/refresh.js';

export default async function handler(req, res) {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Remove /api/auth prefix to get route
    const route = pathname.replace('/api/auth', '');

    // Route to appropriate handler
    switch (route) {
        case '/login':
            return loginHandler(req, res);
        case '/signup':
            return signupHandler(req, res);
        case '/logout':
            return logoutHandler(req, res);
        case '/refresh':
            return refreshHandler(req, res);
        default:
            return res.status(404).json({ error: 'Auth endpoint not found' });
    }
}
