import { getCollection } from '../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../lib/errors.js';
import { verifyToken } from '../../../lib/auth.js';
import { followRateLimit } from '../../../lib/rateLimit.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/users/[username]/follow - Follow a user
 * DELETE /api/users/[username]/follow - Unfollow a user
 * Rate limited to 50 actions per hour per user
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

        // Apply rate limiting (50 follow/unfollow actions per hour)
        const rateLimitResult = followRateLimit(req, decoded);

        if (!rateLimitResult.allowed) {
            res.setHeader('Retry-After', rateLimitResult.retryAfter);
            return sendError(res, Errors.rateLimit(
                'Too many follow/unfollow requests. Please try again later.',
                rateLimitResult.retryAfter
            ));
        }

        // Add rate limit headers to inform client of their status
        res.setHeader('X-RateLimit-Limit', '50');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());

        const currentUserId = new ObjectId(decoded.userId);

        // Get target username from URL
        const targetUsername = req.query.username || req.params.username;

        if (!targetUsername) {
            return sendError(res, Errors.validation('Username required'));
        }

        // Find target user
        const usersCollection = await getCollection('users');
        const targetUser = await usersCollection.findOne({
            username: targetUsername.toLowerCase(),
        });

        if (!targetUser) {
            return sendError(res, Errors.notFound('User not found'));
        }

        const targetUserId = targetUser._id;

        // Can't follow yourself
        if (currentUserId.equals(targetUserId)) {
            return sendError(res, Errors.validation('Cannot follow yourself'));
        }

        const followsCollection = await getCollection('follows');

        // POST - Follow user
        if (req.method === 'POST') {
            // Check if already following
            const existingFollow = await followsCollection.findOne({
                followerId: currentUserId,
                followingId: targetUserId,
            });

            if (existingFollow) {
                return sendError(res, Errors.validation('Already following this user'));
            }

            // Create follow relationship
            await followsCollection.insertOne({
                followerId: currentUserId,
                followingId: targetUserId,
                createdAt: new Date(),
            });

            // Update follower counts
            await usersCollection.updateOne(
                { _id: currentUserId },
                { $inc: { followingCount: 1 } }
            );
            await usersCollection.updateOne(
                { _id: targetUserId },
                { $inc: { followerCount: 1 } }
            );

            return sendSuccess(res, {
                message: `Now following ${targetUser.displayName}`,
                following: true,
            });
        }

        // DELETE - Unfollow user
        if (req.method === 'DELETE') {
            // Check if following
            const existingFollow = await followsCollection.findOne({
                followerId: currentUserId,
                followingId: targetUserId,
            });

            if (!existingFollow) {
                return sendError(res, Errors.validation('Not following this user'));
            }

            // Remove follow relationship
            await followsCollection.deleteOne({
                followerId: currentUserId,
                followingId: targetUserId,
            });

            // Update follower counts
            await usersCollection.updateOne(
                { _id: currentUserId },
                { $inc: { followingCount: -1 } }
            );
            await usersCollection.updateOne(
                { _id: targetUserId },
                { $inc: { followerCount: -1 } }
            );

            return sendSuccess(res, {
                message: `Unfollowed ${targetUser.displayName}`,
                following: false,
            });
        }

        // Method not allowed
        return sendError(res, Errors.badRequest('Method not allowed'));

    } catch (error) {
        console.error('Follow/unfollow error:', error);
        return sendError(res, Errors.internal('Failed to process request'));
    }
}
