import { Errors, sendError } from '../../../lib/errors.js';

/**
 * GET /api/auth/oauth/google
 * Initiate Google OAuth flow
 * Redirects user to Google's OAuth consent screen
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const {
            GOOGLE_CLIENT_ID,
            VITE_APP_URL = 'http://localhost:3000',
        } = process.env;

        if (!GOOGLE_CLIENT_ID) {
            return sendError(res, Errors.internal('Google OAuth not configured'));
        }

        // Generate state parameter for CSRF protection
        const state = Buffer.from(JSON.stringify({
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(7),
        })).toString('base64');

        // Set state in cookie for verification in callback
        // Note: Secure flag removed for local development (HTTP)
        res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);

        // Build Google OAuth URL
        // Use environment variable for redirect URI (production or localhost)
        const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google/callback';

        const scope = 'openid email profile';

        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
        googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.append('response_type', 'code');
        googleAuthUrl.searchParams.append('scope', scope);
        googleAuthUrl.searchParams.append('state', state);
        googleAuthUrl.searchParams.append('access_type', 'offline');
        googleAuthUrl.searchParams.append('prompt', 'consent');

        // Redirect to Google OAuth
        res.writeHead(302, { Location: googleAuthUrl.toString() });
        res.end();

    } catch (error) {
        console.error('Google OAuth initiation error:', error);
        return sendError(res, Errors.internal('Failed to initiate Google OAuth'));
    }
}
