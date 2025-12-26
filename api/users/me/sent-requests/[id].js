import { getCollection } from '../../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../../lib/errors.js';
import { verifyToken } from '../../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * DELETE /api/users/me/sent-requests/[id]
 * Cancel a sent follow request
 * Based on specs/007-follow-requests/contracts/api-follow-requests.yaml
 */
export default async function handler(req, res) {
    // Only allow DELETE requests
    if (req.method !== 'DELETE') {
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
        const { id } = req.params; // Changed from req.query to req.params for Express

        // Validate request ID
        let requestId;
        try {
            requestId = new ObjectId(id);
        } catch (error) {
            return sendError(res, Errors.validation('Invalid request ID', {
                id: 'Request ID must be a valid ObjectId'
            }));
        }

        // Find the request
        const requestsCollection = await getCollection('follow_requests');
        const request = await requestsCollection.findOne({ _id: requestId });

        if (!request) {
            return sendError(res, Errors.notFound('Follow request not found'));
        }

        // Verify the current user is the requester
        if (request.requesterId.toString() !== currentUserId.toString()) {
            return sendError(res, Errors.forbidden('You can only cancel your own follow requests'));
        }

        // Delete the request
        await requestsCollection.deleteOne({ _id: requestId });

        return sendSuccess(res, {
            message: 'Follow request canceled successfully'
        });

    } catch (error) {
        console.error('Cancel follow request error:', error);
        return sendError(res, Errors.internal('Failed to cancel follow request'));
    }
}
