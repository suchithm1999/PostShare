import { getCollection } from '../../lib/mongodb.js';
import { verifyToken, generateAccessToken } from '../../lib/auth.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return sendError(res, Errors.badRequest('Method not allowed'));
    }

    try {
        const { refreshToken } = req.body;

        // Validate refresh token provided
        if (!refreshToken) {
            return sendError(res, Errors.unauthorized('Refresh token is required', 'MISSING_REFRESH_TOKEN'));
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken);
        } catch (error) {
            return sendError(res, Errors.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN'));
        }

        // Check token type
        if (decoded.type !== 'refresh') {
            return sendError(res, Errors.unauthorized('Invalid token type', 'WRONG_TOKEN_TYPE'));
        }

        // Find user by ID
        const usersCollection = await getCollection('users');
        const user = await usersCollection.findOne({
            _id: new ObjectId(decoded.userId),
            isActive: true,
        });

        if (!user) {
            return sendError(res, Errors.unauthorized('User not found', 'USER_NOT_FOUND'));
        }

        // Generate new access token (keep same refresh token)
        const newAccessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        return sendSuccess(res, {
            accessToken: newAccessToken,
            expiresIn: 1800, // 30 minutes
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        return sendError(res, Errors.internal('Failed to refresh token'));
    }
}
