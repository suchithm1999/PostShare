/**
 * Consolidated Users API Handler
 * Combines user profile and follow endpoints into one serverless function
 */

import userByUsernameHandler from './users/[username].js';
import followRequestHandler from './users/[username]/follow-request.js';
import followHandler from './users/[username]/follow.js';
import followersHandler from './users/[username]/followers.js';
import followingHandler from './users/[username]/following.js';

export default async function handler(req, res) {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Extract username and sub-route
    const parts = pathname.replace('/api/users/', '').split('/').filter(Boolean);

    if (parts.length === 0) {
        return res.status(404).json({ error: 'Username required' });
    }

    const username = parts[0];
    const subRoute = parts[1] || '';

    // Set username in query for handlers
    req.query = { ...req.query, username };

    // Route based on sub-path
    switch (subRoute) {
        case '':
            return userByUsernameHandler(req, res);
        case 'follow-request':
            return followRequestHandler(req, res);
        case 'follow':
            return followHandler(req, res);
        case 'followers':
            return followersHandler(req, res);
        case 'following':
            return followingHandler(req, res);
        default:
            return res.status(404).json({ error: 'User endpoint not found' });
    }
}
