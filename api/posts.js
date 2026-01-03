/**
 * Consolidated Posts API Handler
 * Combines all post endpoints into one serverless function
 */

import postsIndexHandler from './posts/index.js';
import postsCreateHandler from './posts/create.js';
import postsByIdHandler from './posts/[id].js';

export default async function handler(req, res) {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Extract route parts
    const parts = pathname.replace('/api/posts', '').split('/').filter(Boolean);

    // Route based on path structure
    if (parts.length === 0) {
        // /api/posts or /api/posts/
        if (req.method === 'POST') {
            return postsCreateHandler(req, res);
        }
        return postsIndexHandler(req, res);
    } else if (parts.length === 1) {
        // /api/posts/[id]
        const postId = parts[0];
        if (postId === 'create') {
            return postsCreateHandler(req, res);
        }
        // Set the ID in query for the handler
        req.query = { ...req.query, id: postId };
        return postsByIdHandler(req, res);
    }

    return res.status(404).json({ error: 'Post endpoint not found' });
}
