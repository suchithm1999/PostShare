import { useState } from 'react';
import { Camera, X, Loader2, Globe, Lock } from 'lucide-react';
import { convertFileToBase64 } from '../utils/fileHelpers';

import { compressImage } from '../utils/imageHelpers';

export default function PostForm({ onSubmit, isSubmitting, initialValues = null, onCancel = null }) {
    const [content, setContent] = useState(initialValues?.content || '');
    // When editing, initialValues has imageUrl (the Cloudinary URL), not base64 image data
    // For new posts, there's no image initially
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialValues?.imageUrl || null);
    const [visibility, setVisibility] = useState(initialValues?.visibility || 'public');
    const [error, setError] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsCompressing(true);
        setError('');

        try {
            const compressedFile = await compressImage(file);
            const base64 = await convertFileToBase64(compressedFile);
            setImage(base64);
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to process image');
            setImage(null);
            setImagePreview(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        // Build the submission payload
        const payload = { content, visibility };

        // Only include image if it was changed (new upload via file input)
        // If editing and user didn't touch the image, don't send it (keeps existing)
        if (image !== null) {
            payload.image = image;
        }

        onSubmit(payload);
    };

    const isEditing = !!initialValues;
    const hasImageToUpload = image !== null; // User selected a new image

    return (
        <div className="relative">
            {/* Loading Overlay - Shows when submitting with an image */}
            {isSubmitting && hasImageToUpload && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-violet-600" size={48} />
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">Uploading Image...</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This may take a few moments</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left w-full">
                <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="5"
                        placeholder="What's on your mind?"
                        disabled={isSubmitting}
                        className="input resize-none"
                        autoFocus={!isEditing}
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Image (Optional)</label>

                    {!imagePreview ? (
                        <label className={`btn btn-secondary inline-flex items-center gap-2 cursor-pointer ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isCompressing ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                            <span>{isCompressing ? 'Compressing...' : 'Upload Image'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={isSubmitting || isCompressing}
                            />
                        </label>
                    ) : (
                        <div className="relative inline-block group">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full max-h-[300px] rounded-xl border border-gray-200 dark:border-slate-700 shadow-md"
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                disabled={isSubmitting}
                                className="absolute top-2 right-2 bg-black/60 text-white border-0 rounded-full p-1.5 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 disabled:cursor-not-allowed"
                                title="Remove Image"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Visibility Toggle */}
                <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Visibility</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setVisibility('public')}
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${visibility === 'public'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Globe size={20} />
                            <span className="font-medium">Public</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisibility('private')}
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${visibility === 'private'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Lock size={20} />
                            <span className="font-medium">Private</span>
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {visibility === 'public'
                            ? 'Anyone can see this post'
                            : 'Only you and your followers can see this'}
                    </p>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
                        disabled={isSubmitting || !content.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                {hasImageToUpload
                                    ? (isEditing ? 'Uploading...' : 'Uploading...')
                                    : (isEditing ? 'Saving...' : 'Posting...')}
                            </>
                        ) : (isEditing ? 'Save Changes' : 'Create Post')}
                    </button>
                </div>
            </form>
        </div>
    );
}
