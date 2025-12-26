import { getCollection } from '../../lib/mongodb.js';
import { deleteImage, uploadImage } from '../../lib/cloudinary.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { verifyToken } from '../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * GET /api/posts/[id] - Get a single post
 * PUT /api/posts/[id] - Update a post
 * DELETE /api/posts/[id] - Delete a post
 */
export default async function handler(req, res) {
    try {
        const postId = req.query.id || req.params.id;

        if (!postId || !ObjectId.isValid(postId)) {
            return sendError(res, Errors.validation('Invalid post ID'));
        }

        const postsCollection = await getCollection('posts');
        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return sendError(res, Errors.notFound('Post not found'));
        }

        // GET - Retrieve post
        if (req.method === 'GET') {
            // Check privacy
            if (post.visibility === 'private') {
                // Verify authentication for private posts
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return sendError(res, Errors.unauthorized('Authentication required for private posts'));
                }

                const token = authHeader.split(' ')[1];
                let decoded;
                try {
                    decoded = verifyToken(token);
                } catch (error) {
                    return sendError(res, Errors.unauthorized('Invalid or expired token'));
                }

                const currentUserId = new ObjectId(decoded.userId);

                // Only author can see private posts
                if (!currentUserId.equals(post.authorId)) {
                    return sendError(res, Errors.forbidden('You do not have permission to view this post'));
                }
            }

            // Get author information
            const usersCollection = await getCollection('users');
            const author = await usersCollection.findOne(
                { _id: post.authorId },
                { projection: { username: 1, displayName: 1, avatarUrl: 1 } }
            );

            return sendSuccess(res, {
                _id: post._id.toString(),
                content: post.content,
                imageUrl: post.imageUrl,
                visibility: post.visibility,
                likeCount: post.likeCount || 0,
                commentCount: post.commentCount || 0,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                author: author ? {
                    _id: author._id.toString(),
                    username: author.username,
                    displayName: author.displayName,
                    avatarUrl: author.avatarUrl,
                } : null,
            });
        }

        // PUT - Update post
        if (req.method === 'PUT') {
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

            // Check ownership
            if (!currentUserId.equals(post.authorId)) {
                return sendError(res, Errors.forbidden('You can only edit your own posts'));
            }

            const { content, image, visibility } = req.body;
            const updates = { updatedAt: new Date() };

            // Validate and update content
            if (content !== undefined) {
                if (typeof content !== 'string' || content.trim().length === 0) {
                    return sendError(res, Errors.validation('Content cannot be empty'));
                }
                if (content.length > 5000) {
                    return sendError(res, Errors.validation('Content too long'));
                }
                updates.content = content.trim();
            }

            // Update visibility
            if (visibility !== undefined) {
                if (!['public', 'private'].includes(visibility)) {
                    return sendError(res, Errors.validation('Invalid visibility'));
                }
                updates.visibility = visibility;
            }

            // Handle image update
            if (image !== undefined) {
                if (image === null) {
                    // Remove existing image
                    if (post.imagePublicId) {
                        try {
                            await deleteImage(post.imagePublicId);
                        } catch (error) {
                            console.error('Failed to delete image:', error);
                        }
                    }
                    updates.imageUrl = null;
                    updates.imagePublicId = null;
                } else {
                    // Upload new image
                    try {
                        // Delete old image if exists
                        if (post.imagePublicId) {
                            await deleteImage(post.imagePublicId);
                        }

                        const uploadResult = await uploadImage(image, {
                            folder: 'posts',
                            transformation: [
                                { width: 1200, height: 1200, crop: 'limit' },
                                { quality: 'auto:good' },
                            ],
                        });
                        updates.imageUrl = uploadResult.url;
                        updates.imagePublicId = uploadResult.publicId;
                    } catch (error) {
                        console.error('Image upload error:', error);
                        return sendError(res, Errors.internal('Failed to upload image'));
                    }
                }
            }

            // Update post
            await postsCollection.updateOne(
                { _id: new ObjectId(postId) },
                { $set: updates }
            );

            const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

            // Get author information
            const usersCollection = await getCollection('users');
            const author = await usersCollection.findOne(
                { _id: updatedPost.authorId },
                { projection: { username: 1, displayName: 1, avatarUrl: 1 } }
            );

            return sendSuccess(res, {
                _id: updatedPost._id.toString(),
                content: updatedPost.content,
                imageUrl: updatedPost.imageUrl,
                visibility: updatedPost.visibility,
                likeCount: updatedPost.likeCount || 0,
                commentCount: updatedPost.commentCount || 0,
                createdAt: updatedPost.createdAt.toISOString(),
                updatedAt: updatedPost.updatedAt.toISOString(),
                author: author ? {
                    _id: author._id.toString(),
                    username: author.username,
                    displayName: author.displayName,
                    avatarUrl: author.avatarUrl,
                } : null,
            });
        }

        // DELETE - Delete post
        if (req.method === 'DELETE') {
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

            // Check ownership
            if (!currentUserId.equals(post.authorId)) {
                return sendError(res, Errors.forbidden('You can only delete your own posts'));
            }

            // Delete image from Cloudinary if exists
            if (post.imagePublicId) {
                try {
                    await deleteImage(post.imagePublicId);
                } catch (error) {
                    console.error('Failed to delete image:', error);
                    // Continue with post deletion even if image deletion fails
                }
            }

            // Delete post
            await postsCollection.deleteOne({ _id: new ObjectId(postId) });

            // Update user's post count
            const usersCollection = await getCollection('users');
            await usersCollection.updateOne(
                { _id: currentUserId },
                { $inc: { postCount: -1 } }
            );

            return sendSuccess(res, {
                message: 'Post deleted successfully',
            });
        }

        // Method not allowed
        return sendError(res, Errors.badRequest('Method not allowed'));

    } catch (error) {
        console.error('Post operation error:', error);
        return sendError(res, Errors.internal('Failed to process request'));
    }
}
