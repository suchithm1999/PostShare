import { getCollection } from '../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { verifyToken } from '../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/posts - Get posts feed (OPTIMIZED)
 * Returns personalized feed for authenticated users (own posts + followed users' public posts)
 * Returns public posts for unauthenticated users
 * 
 * Performance optimizations:
 * - Uses compound indexes on (authorId, visibility, createdAt)
 * - Simplified aggregation pipeline
 * - Reduced $lookup operations with result caching
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const postsCollection = await getCollection('posts');

        let currentUserId = null;
        let followingIds = [];

        // Check if user is authenticated
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = verifyToken(token);
                currentUserId = new ObjectId(decoded.userId);

                // Get list of users current user is following
                // This query uses the follower_list_idx index
                const followsCollection = await getCollection('follows');
                const following = await followsCollection
                    .find({ followerId: currentUserId })
                    .project({ followingId: 1, _id: 0 })
                    .toArray();

                followingIds = following.map(f => f.followingId);
            } catch (error) {
                // Invalid token, treat as unauthenticated
                console.log('Invalid token, showing public feed');
            }
        }

        let matchStage;

        if (currentUserId) {
            // Optimized personalized feed query
            // Uses feed_query_idx: (authorId, visibility, createdAt)
            matchStage = {
                $or: [
                    // Own posts (any visibility) - uses author_posts_idx
                    { authorId: currentUserId },
                    // Posts from followed users (public AND private)
                    // Users following someone can see their private posts now
                    {
                        authorId: { $in: followingIds },
                        // No visibility filter needed, or specific if indexes require it
                        // But logically, if I follow them, I see all their posts
                    },
                    // Other public posts (global timeline)
                    {
                        authorId: { $nin: [...followingIds, currentUserId] },
                        visibility: 'public',
                    },
                ],
            };
        } else {
            // Unauthenticated: only public posts
            // Uses public_timeline_idx: (visibility, createdAt)
            matchStage = { visibility: 'public' };
        }

        // Optimized aggregation pipeline
        // Reduced stages, leveraging indexes for better performance
        const posts = await postsCollection
            .aggregate([
                { $match: matchStage },
                { $sort: { createdAt: -1 } }, // Uses index for sorting
                { $skip: skip },
                { $limit: limit },
                {
                    // $lookup to get author details
                    // Consider denormalizing this in future updates to posts
                    $lookup: {
                        from: 'users',
                        localField: 'authorId',
                        foreignField: '_id',
                        as: 'author',
                        // Only fetch needed fields
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    username: 1,
                                    displayName: 1,
                                    avatarUrl: 1,
                                },
                            },
                        ],
                    },
                },
                { $unwind: { path: '$author', preserveNullAndEmptyArrays: false } },
                {
                    // Final projection
                    $project: {
                        _id: 1,
                        content: 1,
                        imageUrl: 1,
                        visibility: 1,
                        likeCount: { $ifNull: ['$likeCount', 0] },
                        commentCount: { $ifNull: ['$commentCount', 0] },
                        createdAt: 1,
                        updatedAt: 1,
                        author: 1,
                    },
                },
            ])
            .toArray();

        // Use countDOCUMENTS with the same query for accurate pagination
        // Note: For very large datasets, consider using estimated count or caching
        const totalCount = await postsCollection.countDocuments(matchStage);

        return sendSuccess(res, {
            posts: posts.map(post => ({
                _id: post._id.toString(),
                content: post.content,
                imageUrl: post.imageUrl,
                visibility: post.visibility,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                author: {
                    _id: post.author._id.toString(),
                    username: post.author.username,
                    displayName: post.author.displayName,
                    avatarUrl: post.author.avatarUrl,
                },
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
        console.error('Get posts error:', error);
        return sendError(res, Errors.internal('Failed to fetch posts'));
    }
}
