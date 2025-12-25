import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to ensure it is below 300KB.
 * @param {File} imageFile - The image file to compress
 * @returns {Promise<File>} - The compressed image file
 */
export async function compressImage(imageFile) {
    const options = {
        maxSizeMB: 0.28, // Target slightly below 300KB (0.3MB) to be safe
        maxWidthOrHeight: 1024, // Reasonable dimension for web display
        useWebWorker: true,
        initialQuality: 0.8, // Start with good quality
    };

    try {
        console.log(`Original size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);

        // If already smaller than target, just return original
        if (imageFile.size / 1024 / 1024 < options.maxSizeMB) {
            console.log('Image is already small enough, skipping compression.');
            return imageFile;
        }

        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        // Safety check: if somehow still too big (rare with aggressive lib), throw or return error
        if (compressedFile.size > 300 * 1024) {
            throw new Error('Image could not be compressed below 300KB limit.');
        }

        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        throw error;
    }
}
