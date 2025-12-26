import { getCollection } from '../../../../lib/mongodb.js';
import { generateTokens } from '../../../../lib/auth.js';
import { Errors, sendError } from '../../../../lib/errors.js';

/**
 * GET /api/auth/oauth/github/callback
 * Handle GitHub OAuth callback
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
        // NOTE: Disabled for local development
        // const savedState = req.cookies?.oauth_state;
        // if (!savedState || savedState !== state) {
        //     return sendError(res, Errors.unauthorized('Invalid state parameter', 'INVALID_STATE'));
        // }
        console.log('✅ GitHub OAuth callback received - proceeding (local dev)');

        const {
            GITHUB_CLIENT_ID,
            GITHUB_CLIENT_SECRET,
        } = process.env;

        const FRONTEND_URL = 'http://localhost:5174';

        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            return sendError(res, Errors.internal('GitHub OAuth not configured'));
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: 'http://localhost:3000/api/auth/oauth/github/callback',
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error('GitHub token exchange error:', error);
            return sendError(res, Errors.unauthorized('Failed to exchange authorization code'));
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        if (!access_token) {
            return sendError(res, Errors.unauthorized('No access token received from GitHub'));
        }

        // Fetch user info from GitHub
        const userInfoResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'User-Agent': 'PostShare-App',
            },
        });

        if (!userInfoResponse.ok) {
            return sendError(res, Errors.internal('Failed to fetch user information from GitHub'));
        }

        const githubUser = await userInfoResponse.json();
        const { id: githubId, login, name, avatar_url } = githubUser;

        // Fetch user's primary email (GitHub API requires separate request)
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'User-Agent': 'PostShare-App',
            },
        });

        let email;
        if (emailsResponse.ok) {
            const emails = await emailsResponse.json();
            const primaryEmail = emails.find(e => e.primary && e.verified);
            email = primaryEmail?.email || emails[0]?.email;
        }

        if (!email) {
            return sendError(res, Errors.badRequest('No verified email found in GitHub account'));
        }

        // Find or create user in database
        const usersCollection = await getCollection('users');

        let user = await usersCollection.findOne({
            'oauthProviders.github': String(githubId),
        });

        if (user) {
            // Existing user - update last login
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        lastLoginAt: new Date(),
                        // Only update avatar from GitHub if user hasn't uploaded a custom one
                        ...(user.avatarPublicId ? {} : { avatarUrl: avatar_url || user.avatarUrl }),
                    },
                }
            );
        } else {
            // Check if email already exists (different auth method)
            const existingUser = await usersCollection.findOne({
                email: email.toLowerCase(),
            });

            if (existingUser) {
                // Link GitHub account to existing user
                await usersCollection.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            'oauthProviders.github': String(githubId),
                            lastLoginAt: new Date(),
                            // Only update avatar from GitHub if user hasn't uploaded a custom one
                            ...(existingUser.avatarPublicId ? {} : { avatarUrl: avatar_url || existingUser.avatarUrl }),
                        },
                    }
                );
                user = await usersCollection.findOne({ _id: existingUser._id });
            } else {
                // Create new user
                const username = sanitizeUsername(login);

                const newUser = {
                    email: email.toLowerCase(),
                    passwordHash: null, // OAuth-only account
                    username,
                    displayName: name || login,
                    avatarUrl: avatar_url || null,
                    avatarPublicId: null,
                    bio: null,
                    oauthProviders: {
                        google: null,
                        github: String(githubId),
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

        res.writeHead(302, { Location: redirectUrl.toString() });
        res.end();

    } catch (error) {
        console.error('GitHub OAuth callback error:', error);

        // Redirect to frontend with error
        const redirectUrl = new URL(process.env.VITE_APP_URL || 'http://localhost:5174');
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
 * Helper: Sanitize GitHub username for our username format
 */
function sanitizeUsername(githubLogin) {
    let username = githubLogin.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 15);

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${username}_${suffix}`;
}
