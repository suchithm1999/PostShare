import { getCollection } from '../../lib/mongodb.js';
import { comparePassword, generateTokens } from '../../lib/auth.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';

// Simple in-memory rate limiting (for production, use Redis or Vercel KV)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return sendError(res, Errors.validation('Email and password are required', {
                email: !email ? 'Email is required' : undefined,
                password: !password ? 'Password is required' : undefined,
            }));
        }

        // Check rate limiting
        const clientId = email.toLowerCase();
        const attempts = loginAttempts.get(clientId) || { count: 0, lockedUntil: null };

        // Check if account is locked
        if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
            const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60);
            return sendError(res, Errors.rateLimit(
                `Too many login attempts. Please try again in ${remainingTime} minutes.`,
                remainingTime * 60
            ));
        }

        // Reset lock if expired
        if (attempts.lockedUntil && attempts.lockedUntil <= Date.now()) {
            attempts.count = 0;
            attempts.lockedUntil = null;
        }

        // Find user by email
        const usersCollection = await getCollection('users');
        const user = await usersCollection.findOne({
            email: email.toLowerCase(),
            isActive: true,
        });

        if (!user) {
            // Increment failed attempts
            attempts.count += 1;
            if (attempts.count >= MAX_ATTEMPTS) {
                attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
            }
            loginAttempts.set(clientId, attempts);

            return sendError(res, Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS'));
        }

        // Check if user has a password (not OAuth-only account)
        if (!user.passwordHash) {
            return sendError(res, Errors.unauthorized(
                'This account was created with social login. Please use Google or GitHub to sign in.',
                'OAUTH_ONLY_ACCOUNT'
            ));
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            // Increment failed attempts
            attempts.count += 1;
            if (attempts.count >= MAX_ATTEMPTS) {
                attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
            }
            loginAttempts.set(clientId, attempts);

            return sendError(res, Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS'));
        }

        // Successful login - reset attempts
        loginAttempts.delete(clientId);

        // Update last login timestamp
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { lastLoginAt: new Date() } }
        );

        // Generate JWT tokens
        const tokens = generateTokens(user);

        // Return user data (without password hash)
        const userResponse = {
            _id: user._id.toString(),
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            postCount: user.postCount,
            createdAt: user.createdAt.toISOString(),
        };

        console.log(`Debug: User ${user.email} login. AvatarURL: ${user.avatarUrl}`);

        return sendSuccess(res, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: userResponse,
        });

    } catch (error) {
        console.error('Login error:', error);
        return sendError(res, Errors.internal('Failed to authenticate'));
    }
}
