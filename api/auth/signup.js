import { getCollection } from '../../lib/mongodb.js';
import { hashPassword } from '../../lib/auth.js';
import { generateTokens } from '../../lib/auth.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const { email, password, username, displayName } = req.body;

        // Validate required fields
        if (!email || !password || !username || !displayName) {
            return sendError(res, Errors.validation('All fields are required', {
                email: !email ? 'Email is required' : undefined,
                password: !password ? 'Password is required' : undefined,
                username: !username ? 'Username is required' : undefined,
                displayName: !displayName ? 'Display name is required' : undefined,
            }));
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return sendError(res, Errors.validation('Invalid email format', {
                email: 'Please provide a valid email address',
            }));
        }

        // Validate username format (3-20 chars, alphanumeric, underscore, hyphen)
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return sendError(res, Errors.validation('Invalid username format', {
                username: 'Username must be 3-20 characters, alphanumeric, underscore, or hyphen only',
            }));
        }

        // Validate password strength
        if (password.length < 8) {
            return sendError(res, Errors.validation('Password too weak', {
                password: 'Password must be at least 8 characters long',
            }));
        }

        // Validate display name length
        if (displayName.length < 1 || displayName.length > 50) {
            return sendError(res, Errors.validation('Invalid display name', {
                displayName: 'Display name must be 1-50 characters',
            }));
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user document
        const newUser = {
            email: email.toLowerCase(),
            passwordHash,
            username,
            displayName,
            avatarUrl: null,
            avatarPublicId: null,
            bio: null,
            oauthProviders: {
                google: null,
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

        // Check if user already exists (from OAuth or previous signup)
        const usersCollection = await getCollection('users');
        const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

        let user;

        if (existingUser) {
            // Email already exists
            if (existingUser.passwordHash) {
                // User already has a password (normal signup) - this is a duplicate
                return sendError(res, Errors.conflict(
                    'Email already in use',
                    'DUPLICATE_EMAIL'
                ));
            } else {
                // User exists from OAuth but has no password - link the password
                console.log('Linking password to existing OAuth user:', existingUser.email);

                await usersCollection.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            passwordHash,
                            username: username, // Update username to chosen one
                            displayName: displayName, // Update display name
                            lastLoginAt: new Date(),
                        },
                    }
                );

                user = await usersCollection.findOne({ _id: existingUser._id });
            }
        } else {
            // Check if username is taken
            const usernameExists = await usersCollection.findOne({ username });
            if (usernameExists) {
                return sendError(res, Errors.conflict(
                    'Username already in use',
                    'DUPLICATE_USERNAME'
                ));
            }

            // Create new user
            const newUser = {
                email: email.toLowerCase(),
                passwordHash,
                username,
                displayName,
                avatarUrl: null,
                avatarPublicId: null,
                bio: null,
                oauthProviders: {
                    google: null,
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

        return sendSuccess(res, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: userResponse,
        }, 201);

    } catch (error) {
        console.error('Signup error:', error);
        return sendError(res, Errors.internal('Failed to create account'));
    }
}
