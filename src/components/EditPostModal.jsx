import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import PostForm from './PostForm';
import { createPortal } from 'react-dom';

export default function EditPostModal({ post, isOpen, onClose, onUpdate }) {
    const dialogRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Close on click outside
    const handleBackdropClick = (e) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    const handleSubmit = async (dto) => {
        setIsSubmitting(true);
        try {
            await onUpdate(post._id, dto);
            onClose();
        } catch (error) {
            console.error('Failed to update post:', error);
            // Re-throw so parent can handle with toast
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !post) return null;

    // Use portal to render outside the DOM hierarchy of parent to avoid z-index issues
    return createPortal(
        <div
            ref={dialogRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Post</h3>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <PostForm
                        initialValues={post}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
