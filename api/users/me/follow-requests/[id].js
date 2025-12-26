import { getCollection } from '../../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../../lib/errors.js';
import { verifyToken } from '../../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/users/me/follow-requests/[id]/accept - Accept a follow request
 * POST /api/users/me/follow-requests/[id]/decline - Decline a follow request
 * 
 * Based on specs/007-follow-requests/contracts/api-follow-requests.yaml
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
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

        // For Express routing: /api/users/me/follow-requests/:id/accept or :id/decline
        // Extract ID from params and action from URL path
        const requestId = req.params.id;
        const urlPath = req.url;
        const action = urlPath.includes('/accept') ? 'accept' : urlPath.includes('/decline') ? 'decline' : null;

        if (!['accept', 'decline'].includes(action)) {
            return sendError(res, Errors.badRequest('Invalid action. Must be accept or decline'));
        }

        // Validate request ID
        let requestObjectId;
        try {
            requestObjectId = new ObjectId(requestId);
        } catch (error) {
            return sendError(res, Errors.validation('Invalid request ID', {
                id: 'Request ID must be a valid ObjectId'
            }));
        }

        // Find the request
        const requestsCollection = await getCollection('follow_requests');
        const request = await requestsCollection.findOne({ _id: requestObjectId });

        if (!request) {
            return sendError(res, Errors.notFound('Follow request not found'));
        }

        // Verify the current user is the recipient
        if (request.recipientId.toString() !== currentUserId.toString()) {
            return sendError(res, Errors.forbidden('You can only respond to your own follow requests'));
        }

        if (action === 'accept') {
            // Create follow relationship
            const followsCollection = await getCollection('follows');
            const newFollow = {
                followerId: request.requesterId,
                followingId: request.recipientId,
                createdAt: new Date()
            };

            const followResult = await followsCollection.insertOne(newFollow);

            // Update follower/following counts
            const usersCollection = await getCollection('users');
            await usersCollection.updateOne(
                { _id: request.requesterId },
                { $inc: { followingCount: 1 } }
            );
            await usersCollection.updateOne(
                { _id: request.recipientId },
                { $inc: { followerCount: 1 } }
            );

            // Delete the request
            await requestsCollection.deleteOne({ _id: requestObjectId });

            return sendSuccess(res, {
                followId: followResult.insertedId.toString(),
                message: 'Follow request accepted'
            });
        } else {
            // Decline - just delete the request (silent)
            await requestsCollection.deleteOne({ _id: requestObjectId });

            return sendSuccess(res, {
                message: 'Follow request declined'
            });
        }

    } catch (error) {
        console.error('Follow request action error:', error);
        return sendError(res, Errors.internal('Failed to process follow request'));
    }
}
