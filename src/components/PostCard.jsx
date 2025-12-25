import { formatDistanceToNow } from 'date-fns';
import { Edit2 } from 'lucide-react';

export default function PostCard({ post, onDelete, onEdit, onViewImage }) {
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDelete(post.id);
        }
    };

    return (
        <article className="card mb-6 group transition-all duration-300 hover:shadow-2xl dark:hover:shadow-slate-700/50 hover:scale-[1.01] relative">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    {post.updatedAt && <span className="ml-1 text-xs">(edited)</span>}
                </span>

                <div className="flex gap-1">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(post)}
                            className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit Post"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Post"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-base sm:text-lg">
                {post.content}
            </p>

            {post.image && (
                <div
                    className="mt-4 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 cursor-pointer"
                    onClick={() => onViewImage && onViewImage(post.image)}
                    title="Click to view full size"
                >
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full max-h-[500px] object-cover block transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}
        </article>
    );
}
