import { getCollection } from '../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../lib/errors.js';

/**
 * GET /api/users/[username]/following - Get list of users this user is following
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

        // Get following with pagination
        const followsCollection = await getCollection('follows');
        const skip = (page - 1) * limit;

        const following = await followsCollection
            .aggregate([
                // Match follows where this user is the follower
                { $match: { followerId: targetUser._id } },
                // Sort by most recent follows first
                { $sort: { createdAt: -1 } },
                // Pagination
                { $skip: skip },
                { $limit: limit },
                // Lookup following user details
                {
                    $lookup: {
                        from: 'users',
                        localField: 'followingId',
                        foreignField: '_id',
                        as: 'following',
                    },
                },
                // Unwind the following array
                { $unwind: '$following' },
                // Project only needed fields
                {
                    $project: {
                        _id: '$following._id',
                        username: '$following.username',
                        displayName: '$following.displayName',
                        avatarUrl: '$following.avatarUrl',
                        bio: '$following.bio',
                        followedAt: '$createdAt',
                    },
                },
            ])
            .toArray();

        // Get total count for pagination
        const totalCount = await followsCollection.countDocuments({
            followerId: targetUser._id,
        });

        return sendSuccess(res, {
            following: following.map(f => ({
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
        console.error('Get following error:', error);
        return sendError(res, Errors.internal('Failed to fetch following list'));
    }
}
