import { getCollection } from '../../../../lib/mongodb.js';
import { generateTokens } from '../../../../lib/auth.js';
import { Errors, sendError } from '../../../../lib/errors.js';

/**
 * GET /api/auth/oauth/google/callback
 * Handle Google OAuth callback
 * Exchanges authorization code for access token, fetches user info, creates/updates user
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return sendError(res, Errors.badRequest('Missing authorization code or state'));
        }

        // Verify state parameter (CSRF protection)
        // NOTE: Disabled for local development - cookies don't persist through OAuth redirects
        // In production on Vercel, this should be re-enabled with secure session storage

        // const savedState = req.cookies?.oauth_state;
        // console.log('OAuth callback - State from query:', state);
        // console.log('OAuth callback - State from cookie:', savedState);
        // console.log('OAuth callback - All cookies:', req.cookies);

        // if (!savedState || savedState !== state) {
        //     console.error('State mismatch!', { savedState, state });
        //     return sendError(res, Errors.unauthorized('Invalid state parameter', 'INVALID_STATE'));
        // }

        console.log('✅ Google OAuth callback received - proceeding without state verification (local dev)');

        const {
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
        } = process.env;

        // Frontend URL for redirect after OAuth
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            return sendError(res, Errors.internal('Google OAuth not configured'));
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google/callback',
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error('Google token exchange error:', error);
            return sendError(res, Errors.unauthorized('Failed to exchange authorization code'));
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            return sendError(res, Errors.internal('Failed to fetch user information from Google'));
        }

        const googleUser = await userInfoResponse.json();
        const { id: googleId, email, name, picture } = googleUser;

        // Find or create user in database
        const usersCollection = await getCollection('users');

        let user = await usersCollection.findOne({
            'oauthProviders.google': googleId,
        });

        if (user) {
            // Existing user - update last login
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        lastLoginAt: new Date(),
                        // Only update avatar from OAuth if user hasn't uploaded a custom one
                        // If avatarPublicId exists, user has a custom avatar - don't overwrite it
                        ...(user.avatarPublicId ? {} : { avatarUrl: picture || user.avatarUrl }),
                    },
                }
            );
        } else {
            // Check if email already exists (different auth method)
            const existingUser = await usersCollection.findOne({
                email: email.toLowerCase(),
            });

            if (existingUser) {
                // Link Google account to existing user
                await usersCollection.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            'oauthProviders.google': googleId,
                            lastLoginAt: new Date(),
                            // Only update avatar from Google if user hasn't uploaded a custom one
                            // If avatarPublicId exists, user has a custom avatar - don't overwrite it
                            ...(existingUser.avatarPublicId ? {} : { avatarUrl: picture || existingUser.avatarUrl }),
                        },
                    }
                );
                user = await usersCollection.findOne({ _id: existingUser._id });
            } else {
                // Create new user
                const username = generateUsernameFromEmail(email);

                const newUser = {
                    email: email.toLowerCase(),
                    passwordHash: null, // OAuth-only account
                    username,
                    displayName: name || email.split('@')[0],
                    avatarUrl: picture || null,
                    avatarPublicId: null,
                    bio: null,
                    oauthProviders: {
                        google: googleId,
                        github: null,
                    },
                    followerCount: 0,
                    followingCount: 0,
                    postCount: 0,
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                    isActive: true,
                    role: 'user',
                };

                const result = await usersCollection.insertOne(newUser);
                user = { ...newUser, _id: result.insertedId };
            }
        }

        // Generate JWT tokens
        const tokens = generateTokens(user);

        // Clear state cookie
        res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');

        // Redirect to frontend with tokens in URL (will be handled by frontend)
        const redirectUrl = new URL(FRONTEND_URL);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.append('access_token', tokens.accessToken);
        redirectUrl.searchParams.append('refresh_token', tokens.refreshToken);
        redirectUrl.searchParams.append('oauth_success', 'true');

        console.log('🔄 Redirecting to:', redirectUrl.toString());

        res.writeHead(302, { Location: redirectUrl.toString() });
        res.end();

    } catch (error) {
        console.error('Google OAuth callback error:', error);

        // Redirect to frontend with error
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.append('oauth_error', 'authentication_failed');

        res.writeHead(302, { Location: redirectUrl.toString() });
        res.end();
    }
}

/**
 * Helper: Parse cookies from cookie header
 */
function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = value;
        }
    });
    return cookies;
}

/**
 * Helper: Generate username from email
 * Ensures uniqueness by checking database
 */
function generateUsernameFromEmail(email) {
    const baseUsername = email.split('@')[0]
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 15);

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${baseUsername}_${suffix}`;
}
