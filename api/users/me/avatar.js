import { getCollection } from '../../../lib/mongodb.js';
import { uploadAvatar, deleteImage } from '../../../lib/cloudinary.js';
import { Errors, sendError, sendSuccess } from '../../../lib/errors.js';
import { verifyToken } from '../../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/users/me/avatar - Upload user profile picture
 * DELETE /api/users/me/avatar - Delete user profile picture
 */
export default async function handler(req, res) {
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

        // Convert string userId to ObjectId
        const userId = new ObjectId(decoded.userId);

        // POST - Upload avatar
        if (req.method === 'POST') {
            const { imageData } = req.body;

            // Validate input
            if (!imageData) {
                return sendError(res, Errors.validation('Image data required', {
                    imageData: 'Image data is required',
                }));
            }

            // Validate base64 format
            if (!imageData.startsWith('data:image/')) {
                return sendError(res, Errors.validation('Invalid image format', {
                    imageData: 'Image must be in base64 format',
                }));
            }

            // Check image size (max 2MB for avatars)
            const base64Data = imageData.split(',')[1];
            const sizeInBytes = (base64Data.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);

            if (sizeInMB > 2) {
                return sendError(res, Errors.validation('Image too large', {
                    imageData: 'Avatar must be less than 2MB',
                }));
            }

            // Get current user to check for existing avatar
            const usersCollection = await getCollection('users');
            const user = await usersCollection.findOne({ _id: userId });

            if (!user) {
                return sendError(res, Errors.notFound('User not found'));
            }

            // Delete old avatar if exists
            if (user.avatarPublicId) {
                try {
                    await deleteImage(user.avatarPublicId);
                } catch (error) {
                    console.error('Failed to delete old avatar:', error);
                    // Continue anyway - old image will be orphaned but not block upload
                }
            }

            // Upload new avatar to Cloudinary
            try {
                const uploadResult = await uploadAvatar(imageData, userId.toString());

                // Update user with new avatar
                const updateResult = await usersCollection.updateOne(
                    { _id: userId },
                    {
                        $set: {
                            avatarUrl: uploadResult.url,
                            avatarPublicId: uploadResult.publicId,
                        },
                    }
                );

                console.log(`Debug: User ${userId} avatar updated. URL: ${uploadResult.url}, ModifiedCount: ${updateResult.modifiedCount}`);

                return sendSuccess(res, {
                    avatarUrl: uploadResult.url,
                    message: 'Avatar uploaded successfully',
                });

            } catch (error) {
                console.error('Cloudinary upload error:', error);
                return sendError(res, Errors.internal('Failed to upload avatar'));
            }
        }

        // DELETE - Remove avatar
        if (req.method === 'DELETE') {
            const usersCollection = await getCollection('users');
            const user = await usersCollection.findOne({ _id: userId });

            if (!user) {
                return sendError(res, Errors.notFound('User not found'));
            }

            if (!user.avatarPublicId) {
                return sendError(res, Errors.notFound('No avatar to delete'));
            }

            // Delete from Cloudinary
            try {
                await deleteImage(user.avatarPublicId);
            } catch (error) {
                console.error('Failed to delete avatar from Cloudinary:', error);
                // Continue to update DB even if Cloudinary delete fails
            }

            // Update user to remove avatar
            await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        avatarUrl: null,
                        avatarPublicId: null,
                    },
                }
            );

            return sendSuccess(res, {
                message: 'Avatar deleted successfully',
            });
        }

        // Method not allowed
        return sendError(res, Errors.badRequest('Method not allowed'));

    } catch (error) {
        console.error('Avatar upload error:', error);
        return sendError(res, Errors.internal('Failed to process avatar request'));
    }
}
