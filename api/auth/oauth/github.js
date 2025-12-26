import { Errors, sendError } from '../../../lib/errors.js';

/**
 * GET /api/auth/oauth/github
 * Initiate GitHub OAuth flow
 * Redirects user to GitHub's OAuth authorization screen
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const {
            GITHUB_CLIENT_ID,
            VITE_APP_URL = 'http://localhost:3000',
        } = process.env;

        if (!GITHUB_CLIENT_ID) {
            return sendError(res, Errors.internal('GitHub OAuth not configured'));
        }

        // Generate state parameter for CSRF protection
        const state = Buffer.from(JSON.stringify({
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(7),
        })).toString('base64');

        // Set state in cookie for verification in callback
        // Note: Secure flag removed for local development (HTTP)
        res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);

        // Build GitHub OAuth URL
        // Use localhost:3000 for API server
        const redirectUri = 'http://localhost:3000/api/auth/oauth/github/callback';
        const scope = 'read:user user:email';

        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
        githubAuthUrl.searchParams.append('redirect_uri', redirectUri);
        githubAuthUrl.searchParams.append('scope', scope);
        githubAuthUrl.searchParams.append('state', state);

        // Redirect to GitHub OAuth
        res.writeHead(302, { Location: githubAuthUrl.toString() });
        res.end();

    } catch (error) {
        console.error('GitHub OAuth initiation error:', error);
        return sendError(res, Errors.internal('Failed to initiate GitHub OAuth'));
    }
}
