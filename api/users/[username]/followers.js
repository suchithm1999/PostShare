import { getCollection } from '../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../lib/errors.js';

/**
 * GET /api/users/[username]/followers - Get list of followers
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const username = req.query.username || req.params.username;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page

        if (!username) {
            return sendError(res, Errors.validation('Username required'));
        }

        // Find target user
        const usersCollection = await getCollection('users');
        const targetUser = await usersCollection.findOne({
            username: username.toLowerCase(),
        });

        if (!targetUser) {
            return sendError(res, Errors.notFound('User not found'));
        }

        // Get followers with pagination
        const followsCollection = await getCollection('follows');
        const skip = (page - 1) * limit;

        const followers = await followsCollection
            .aggregate([
                // Match follows where this user is being followed
                { $match: { followingId: targetUser._id } },
                // Sort by most recent followers first
                { $sort: { createdAt: -1 } },
                // Pagination
                { $skip: skip },
                { $limit: limit },
                // Lookup follower user details
                {
                    $lookup: {
                        from: 'users',
                        localField: 'followerId',
                        foreignField: '_id',
                        as: 'follower',
                    },
                },
                // Unwind the follower array
                { $unwind: '$follower' },
                // Project only needed fields
                {
                    $project: {
                        _id: '$follower._id',
                        username: '$follower.username',
                        displayName: '$follower.displayName',
                        avatarUrl: '$follower.avatarUrl',
                        bio: '$follower.bio',
                        followedAt: '$createdAt',
                    },
                },
            ])
            .toArray();

        // Get total count for pagination
        const totalCount = await followsCollection.countDocuments({
            followingId: targetUser._id,
        });

        return sendSuccess(res, {
            followers: followers.map(f => ({
                ...f,
                _id: f._id.toString(),
                followedAt: f.followedAt.toISOString(),
            })),
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
            },
        });

    } catch (error) {
        console.error('Get followers error:', error);
        return sendError(res, Errors.internal('Failed to fetch followers'));
    }
}
