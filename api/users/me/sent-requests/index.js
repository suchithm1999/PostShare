import { getCollection } from '../../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../../lib/errors.js';
import { verifyToken } from '../../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/users/me/sent-requests
 * Get all outgoing follow requests sent by the current user
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

        // Get all outgoing requests
        const requestsCollection = await getCollection('follow_requests');
        const requests = await requestsCollection
            .find({ requesterId: currentUserId })
            .sort({ createdAt: -1 })
            .toArray();

        // Fetch recipient details for each request
        const usersCollection = await getCollection('users');
        const recipientIds = requests.map(r => r.recipientId);
        const recipients = await usersCollection
            .find({ _id: { $in: recipientIds } })
            .project({ passwordHash: 0 })
            .toArray();

        // Create a map for quick lookup
        const recipientMap = {};
        recipients.forEach(user => {
            recipientMap[user._id.toString()] = user;
        });

        // Format response
        const formattedRequests = requests.map(request => {
            const recipient = recipientMap[request.recipientId.toString()];
            return {
                _id: request._id.toString(),
                recipient: {
                    _id: recipient._id.toString(),
                    username: recipient.username,
                    displayName: recipient.displayName,
                    avatarUrl: recipient.avatarUrl || null
                },
                createdAt: request.createdAt.toISOString()
            };
        });

        return sendSuccess(res, {
            count: formattedRequests.length,
            requests: formattedRequests
        });

    } catch (error) {
        console.error('Get sent requests error:', error);
        return sendError(res, Errors.internal('Failed to get sent requests'));
    }
}
