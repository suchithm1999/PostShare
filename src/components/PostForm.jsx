import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react'; // Added Loader2
import { convertFileToBase64 } from '../utils/fileHelpers';

import { compressImage } from '../utils/imageHelpers'; // Added import

export default function PostForm({ onSubmit, isSubmitting, initialValues = null, onCancel = null }) {
    const [content, setContent] = useState(initialValues?.content || '');
    const [image, setImage] = useState(initialValues?.image || null);
    const [imagePreview, setImagePreview] = useState(initialValues?.image || null);
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
        // If image is original string and unchanged, it's fine. If it's new base64, it's also fine.
        // If cleared, it's null.
        onSubmit({ content, image });
    };

    const isEditing = !!initialValues;

    return (
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
                            className="absolute top-2 right-2 bg-black/60 text-white border-0 rounded-full p-1.5 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
                            title="Remove Image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
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
                        className="btn btn-secondary w-full sm:w-auto"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto flex-1 sm:flex-none"
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {isEditing ? 'Saving...' : 'Posting...'}
                        </>
                    ) : (isEditing ? 'Save Changes' : 'Create Post')}
                </button>
            </div>
        </form>
    );
}
