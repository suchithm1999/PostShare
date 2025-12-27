import { getCollection } from '../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { verifyToken } from '../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/users/me - Get current user's profile
 * PUT /api/users/me - Update current user's profile
 */
export default async function handler(req, res) {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, Errors.unauthorized('Authentication required'));
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return sendError(res, Errors.unauthorized('Invalid or expired token'));
        }

        // Convert string userId to ObjectId
        const userId = new ObjectId(decoded.userId);

        // GET - Retrieve user profile
        if (req.method === 'GET') {
            const usersCollection = await getCollection('users');
            const user = await usersCollection.findOne(
                { _id: userId },
                {
                    projection: {
                        passwordHash: 0 // Exclude password hash
                    }
                }
            );

            if (!user) {
                return sendError(res, Errors.notFound('User not found'));
            }

            // Fetch user's posts
            const postsCollection = await getCollection('posts');
            const posts = await postsCollection
                .find({ authorId: userId })
                .sort({ createdAt: -1 })
                .toArray();

            // Return user profile with posts
            return sendSuccess(res, {
                _id: user._id.toString(),
                email: user.email,
                username: user.username,
                displayName: user.displayName,
                bio: user.bio || null,
                avatarUrl: user.avatarUrl || null,
                followerCount: user.followerCount || 0,
                followingCount: user.followingCount || 0,
                postCount: user.postCount || 0,
                createdAt: user.createdAt.toISOString(),
                // Map posts to match PostCard format
                posts: posts.map(post => ({
                    _id: post._id.toString(),
                    content: post.content,
                    imageUrl: post.imageUrl,
                    visibility: post.visibility,
                    likeCount: post.likeCount || 0,
                    commentCount: post.commentCount || 0,
                    createdAt: post.createdAt.toISOString(),
                    updatedAt: post.updatedAt?.toISOString(),
                    author: {
                        _id: user._id.toString(),
                        username: user.username,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl
                    }
                }))
            });
        }

        // PUT - Update user profile
        if (req.method === 'PUT') {
            const { displayName, bio } = req.body;

            // Validate input
            if (!displayName && bio === undefined) {
                return sendError(res, Errors.validation('At least one field must be provided', {
                    displayName: 'Display name or bio required',
                }));
            }

            const updates = {};

            // Validate and add displayName if provided
            if (displayName !== undefined) {
                if (typeof displayName !== 'string' || displayName.trim().length === 0) {
                    return sendError(res, Errors.validation('Invalid display name', {
                        displayName: 'Display name cannot be empty',
                    }));
                }
                if (displayName.length > 50) {
                    return sendError(res, Errors.validation('Display name too long', {
                        displayName: 'Display name must be 50 characters or less',
                    }));
                }
                updates.displayName = displayName.trim();
            }

            // Validate and add bio if provided
            if (bio !== undefined) {
                if (bio !== null && typeof bio !== 'string') {
                    return sendError(res, Errors.validation('Invalid bio', {
                        bio: 'Bio must be a string or null',
                    }));
                }
                if (bio && bio.length > 160) {
                    return sendError(res, Errors.validation('Bio too long', {
                        bio: 'Bio must be 160 characters or less',
                    }));
                }
                updates.bio = bio ? bio.trim() : null;
            }

            // Update user in database
            const usersCollection = await getCollection('users');
            const result = await usersCollection.updateOne(
                { _id: userId },
                { $set: updates }
            );

            if (result.matchedCount === 0) {
                return sendError(res, Errors.notFound('User not found'));
            }

            // Fetch and return updated user
            const updatedUser = await usersCollection.findOne(
                { _id: userId },
                { projection: { passwordHash: 0 } }
            );

            return sendSuccess(res, {
                _id: updatedUser._id.toString(),
                email: updatedUser.email,
                username: updatedUser.username,
                displayName: updatedUser.displayName,
                bio: updatedUser.bio || null,
                avatarUrl: updatedUser.avatarUrl || null,
                followerCount: updatedUser.followerCount || 0,
                followingCount: updatedUser.followingCount || 0,
                postCount: updatedUser.postCount || 0,
                createdAt: updatedUser.createdAt.toISOString(),
            });
        }

        // Method not allowed
        return sendError(res, Errors.badRequest('Method not allowed'));

    } catch (error) {
        console.error('User profile error:', error);
        return sendError(res, Errors.internal('Failed to process request'));
    }
}
