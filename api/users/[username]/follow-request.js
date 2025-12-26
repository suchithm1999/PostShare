import { getCollection } from '../../../lib/mongodb.js';
import { Errors, sendError, sendSuccess } from '../../../lib/errors.js';
import { verifyToken } from '../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/users/[username]/follow-request
 * Send a follow request to a user
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
        const { username } = req.params; // Changed from req.query to req.params for Express

        // Find target user
        const usersCollection = await getCollection('users');
        const targetUser = await usersCollection.findOne({ username });

        if (!targetUser) {
            return sendError(res, Errors.notFound('User not found'));
        }

        const targetUserId = targetUser._id;

        // Validate: cannot request to follow yourself
        if (currentUserId.toString() === targetUserId.toString()) {
            return sendError(res, Errors.validation('Cannot send follow request to yourself', {
                username: 'You cannot follow yourself'
            }));
        }

        // Check if already following
        const followsCollection = await getCollection('follows');
        const existingFollow = await followsCollection.findOne({
            followerId: currentUserId,
            followingId: targetUserId
        });

        if (existingFollow) {
            return sendError(res, Errors.validation('Already following this user', {
                username: 'You are already following this user'
            }));
        }

        // Check for duplicate request
        const requestsCollection = await getCollection('follow_requests');
        const existingRequest = await requestsCollection.findOne({
            requesterId: currentUserId,
            recipientId: targetUserId
        });

        if (existingRequest) {
            // Treat as idempotent - return success with existing request ID
            return sendSuccess(res, {
                requestId: existingRequest._id.toString(),
                message: 'Follow request already sent'
            }, 200);
        }

        // Create new follow request
        const newRequest = {
            requesterId: currentUserId,
            recipientId: targetUserId,
            status: 'pending',
            createdAt: new Date()
        };

        const result = await requestsCollection.insertOne(newRequest);

        return sendSuccess(res, {
            requestId: result.insertedId.toString(),
            message: 'Follow request sent successfully'
        }, 201);

    } catch (error) {
        console.error('Send follow request error:', error);
        return sendError(res, Errors.internal('Failed to send follow request'));
    }
}
