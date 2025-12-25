import { requireAuth } from '../../lib/middleware.js';
import { sendSuccess } from '../../lib/errors.js';

/**
 * POST /api/auth/logout
 * Logout user (invalidate session if using sessions collection)
 * 
 * Note: Since we're using stateless JWT, logout is primarily handled client-side
 * by clearing tokens from localStorage. This endpoint is here for:
 * 1. Future session tracking (if sessions collection is implemented)
 * 2. Logging logout events
 * 3. Consistency with authentication flow
 */
async function logoutHandler(req, res) {
    try {
        // User info is available from requireAuth middleware
        const { userId, username } = req.user;

        // Log the logout event
        console.log(`User logged out: ${username} (${userId})`);

        // TODO: If using sessions collection in the future, invalidate the session here
        // const sessionsCollection = await getCollection('sessions');
        // await sessionsCollection.updateMany(
        //   { userId: new ObjectId(userId), isActive: true },
        //   { $set: { isActive: false } }
        // );

        return sendSuccess(res, {
            message: 'Logged out successfully',
        });

    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, we can still return success
        // since client-side token clearing is what matters
        return sendSuccess(res, {
            message: 'Logged out successfully',
        });
    }
}

// Wrap handler with authentication middleware
export default requireAuth(logoutHandler);
