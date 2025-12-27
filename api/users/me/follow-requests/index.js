import { getCollection } from '../../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../../lib/errors.js';
import { verifyToken } from '../../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/users/me/follow-requests
 * Get all incoming follow requests for the current user
 * 
 * POST /api/users/me/follow-requests/[id]/accept - handled in [id].js
 * POST /api/users/me/follow-requests/[id]/decline - handled in [id].js
 * 
 * Based on specs/007-follow-requests/contracts/api-follow-requests.yaml
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

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

        const currentUserId = new ObjectId(decoded.userId);

        // Get all incoming requests
        const requestsCollection = await getCollection('follow_requests');
        const requests = await requestsCollection
            .find({ recipientId: currentUserId })
            .sort({ createdAt: -1 })
            .toArray();

        // Fetch requester details for each request
        const usersCollection = await getCollection('users');
        const requesterIds = requests.map(r => r.requesterId);
        const requesters = await usersCollection
            .find({ _id: { $in: requesterIds } })
            .project({ passwordHash: 0 })
            .toArray();

        // Create a map for quick lookup
        const requesterMap = {};
        requesters.forEach(user => {
            requesterMap[user._id.toString()] = user;
        });

        // Format response
        const formattedRequests = requests.map(request => {
            const requester = requesterMap[request.requesterId.toString()];
            return {
                _id: request._id.toString(),
                requester: {
                    _id: requester._id.toString(),
                    username: requester.username,
                    displayName: requester.displayName,
                    avatarUrl: requester.avatarUrl || null
                },
                createdAt: request.createdAt.toISOString()
            };
        });

        return sendSuccess(res, {
            count: formattedRequests.length,
            requests: formattedRequests
        });

    } catch (error) {
        console.error('Get incoming requests error:', error);
        return sendError(res, Errors.internal('Failed to get follow requests'));
    }
}
