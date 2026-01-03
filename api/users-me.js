/**
 * Consolidated Users/Me API Handler  
 * Combines current user endpoints into one serverless function
 */

import meHandler from './users/me.js';
import avatarHandler from './users/me/avatar.js';
import followRequestsHandler from './users/me/follow-requests/index.js';
import followRequestByIdHandler from './users/me/follow-requests/[id].js';
import sentRequestsHandler from './users/me/sent-requests/index.js';
import sentRequestByIdHandler from './users/me/sent-requests/[id].js';

export default async function handler(req, res) {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Extract route after /api/users/me
    const route = pathname.replace('/api/users/me', '');

    // Route to appropriate handler
    if (route === '' || route === '/') {
        return meHandler(req, res);
    } else if (route === '/avatar') {
        return avatarHandler(req, res);
    } else if (route === '/follow-requests' || route === '/follow-requests/') {
        return followRequestsHandler(req, res);
    } else if (route.startsWith('/follow-requests/')) {
        const id = route.replace('/follow-requests/', '');
        req.query = { ...req.query, id };
        return followRequestByIdHandler(req, res);
    } else if (route === '/sent-requests' || route === '/sent-requests/') {
        return sentRequestsHandler(req, res);
    } else if (route.startsWith('/sent-requests/')) {
        const id = route.replace('/sent-requests/', '');
        req.query = { ...req.query, id };
        return sentRequestByIdHandler(req, res);
    }

    return res.status(404).json({ error: 'User endpoint not found' });
}
