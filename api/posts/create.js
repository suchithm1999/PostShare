import { getCollection } from '../../lib/mongodb.js';
import { uploadImage } from '../../lib/cloudinary.js';
import { Errors, sendError, sendSuccess } from '../../lib/errors.js';
import { verifyToken } from '../../lib/auth.js';
import { ObjectId } from 'mongodb';

/**
 * POST /api/posts/create - Create a new post
 */
export default async function handler(req, res) {
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

        const authorId = new ObjectId(decoded.userId);

        // Extract post data
        const { content, image, visibility = 'public' } = req.body;

        // Validate input
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return sendError(res, Errors.validation('Content is required', {
                content: 'Post content cannot be empty',
            }));
        }

        if (content.length > 5000) {
            return sendError(res, Errors.validation('Content too long', {
                content: 'Post content must be 5000 characters or less',
            }));
        }

        if (!['public', 'private'].includes(visibility)) {
            return sendError(res, Errors.validation('Invalid visibility', {
                visibility: 'Visibility must be either "public" or "private"',
            }));
        }

        // Upload image if provided
        let imageUrl = null;
        let imagePublicId = null;

        console.log('Image upload debug:', {
            hasImage: !!image,
            imageType: typeof image,
            imageLength: image ? image.length : 0,
            imagePrefix: image ? image.substring(0, 50) : 'null'
        });

        if (image) {
            try {
                console.log('Attempting Cloudinary upload...');
                const uploadResult = await uploadImage(image, {
                    folder: 'posts',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto:good' },
                    ],
                });
                console.log('Cloudinary upload result:', {
                    success: !!uploadResult,
                    url: uploadResult?.url,
                    publicId: uploadResult?.publicId
                });
                imageUrl = uploadResult.url;
                imagePublicId = uploadResult.publicId;
            } catch (error) {
                console.error('Image upload error:', error);
                return sendError(res, Errors.internal('Failed to upload image'));
            }
        }

        // Create post document
        const post = {
            authorId,
            content: content.trim(),
            imageUrl,
            imagePublicId,
            visibility,
            likes: [],
            likeCount: 0,
            commentCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Insert into database
        const postsCollection = await getCollection('posts');
        const result = await postsCollection.insertOne(post);

        // Update user's post count
        const usersCollection = await getCollection('users');
        await usersCollection.updateOne(
            { _id: authorId },
            { $inc: { postCount: 1 } }
        );

        // Get author information for response
        const author = await usersCollection.findOne(
            { _id: authorId },
            { projection: { username: 1, displayName: 1, avatarUrl: 1 } }
        );

        console.log('Post created successfully:', {
            postId: result.insertedId.toString(),
            hasImage: !!imageUrl,
            imageUrl
        });

        // Return created post with author info
        return sendSuccess(res, {
            _id: result.insertedId.toString(),
            content: post.content,
            imageUrl: post.imageUrl,
            visibility: post.visibility,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            author: author ? {
                _id: author._id.toString(),
                username: author.username,
                displayName: author.displayName,
                avatarUrl: author.avatarUrl,
            } : null,
        }, 201);

    } catch (error) {
        console.error('Create post error:', error);
        return sendError(res, Errors.internal('Failed to create post'));
    }
}
