import { getCollection } from '../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { verifyToken } from '../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/users/[username] - Get user profile and posts
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const username = req.query.username || req.params.username;

        if (!username) {
            return sendError(res, Errors.validation('Username required', {
                username: 'Username parameter is required',
            }));
        }

        // Find user
        const usersCollection = await getCollection('users');
        const user = await usersCollection.findOne(
            { username: username.toLowerCase() },
            { projection: { passwordHash: 0, oauthProviders: 0 } }
        );

        if (!user) {
            return sendError(res, Errors.notFound('User not found'));
        }

        // Determine if requesting user can see private posts
        let canSeePrivate = false;
        let currentUserId = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = verifyToken(token);
                currentUserId = new ObjectId(decoded.userId);

                if (currentUserId.toString() === user._id.toString()) {
                    canSeePrivate = true; // Own profile
                } else {
                    // Check if following
                    const followsCollection = await getCollection('follows');
                    const follow = await followsCollection.findOne({
                        followerId: currentUserId,
                        followingId: user._id
                    });
                    if (follow) canSeePrivate = true;
                }
            } catch (err) {
                // Ignore auth error, treat as public
            }
        }

        // Fetch posts
        const postsCollection = await getCollection('posts');
        const query = { authorId: user._id };
        if (!canSeePrivate) {
            query.visibility = 'public';
        }

        const posts = await postsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .limit(20) // Limit to 20 recent posts for profile page
            .toArray();

        return sendSuccess(res, {
            _id: user._id.toString(),
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

    } catch (error) {
        console.error('Get user profile error:', error);
        return sendError(res, Errors.internal('Failed to retrieve user profile'));
    }
}
