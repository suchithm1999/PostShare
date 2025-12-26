import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Force HTTPS
});

// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  Cloudinary environment variables not configured');
}

/**
 * Upload an image to Cloudinary
 * @param {string} fileBuffer - Base64 string or buffer
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path (e.g., 'postshare/posts')
 * @param {string} options.publicId - Optional custom public ID
 * @param {string} options.resourceType - Resource type (default: 'image')
 * @returns {Promise<Object>} Upload result with URL and public ID
 */
export async function uploadImage(fileBuffer, options = {}) {
    const {
        folder = 'postshare/posts',
        publicId = null,
        resourceType = 'image',
    } = options;

    try {
        const uploadOptions = {
            folder,
            resource_type: resourceType,
            unique_filename: true,
            overwrite: false,
            transformation: [
                { width: 1920, height: 1920, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
            ],
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const result = await cloudinary.uploader.upload(fileBuffer, uploadOptions);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            createdAt: result.created_at,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Image upload failed: ${error.message}`);
    }
}

/**
 * Upload avatar/profile picture to Cloudinary
 * @param {string} fileBuffer - Base64 string or buffer
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} Upload result
 */
export async function uploadAvatar(fileBuffer, userId) {
    try {
        const result = await cloudinary.uploader.upload(fileBuffer, {
            folder: 'postshare/avatars',
            public_id: `user_${userId}`,
            overwrite: true, // Allow avatar updates
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }
            ],
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error(`Avatar upload failed: ${error.message}`);
    }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return { success: true, message: 'Image deleted successfully' };
        } else {
            return { success: false, message: 'Image not found or already deleted' };
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Image deletion failed: ${error.message}`);
    }
}

/**
 * Generate signed upload parameters for direct browser uploads
 * @param {Object} options - Upload options
 * @returns {Object} Signed upload parameters
 */
export function generateSignedUploadParams(options = {}) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const {
        folder = 'postshare/posts',
        transformation = 'w_1920,h_1920,c_limit,q_auto,f_auto',
    } = options;

    const params = {
        timestamp,
        folder,
        transformation,
        upload_preset: 'postshare_uploads', // Must be created in Cloudinary dashboard
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        transformation,
    };
}

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(publicId, options = {}) {
    const {
        width = 1920,
        height = null,
        crop = 'limit',
        quality = 'auto',
        format = 'auto',
    } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
        secure: true,
    });
}

/**
 * Test Cloudinary connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testCloudinaryConnection() {
    try {
        await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful');
        return true;
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
        return false;
    }
}

export default cloudinary;
