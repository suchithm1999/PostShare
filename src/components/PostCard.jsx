import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import { useAuth } from '../hooks/useAuth';

export default function PostCard({ post, onDelete, onEdit, onViewImage }) {
    const { user: currentUser } = useAuth();

    // Check if current user is the author
    const isOwnPost = currentUser && post.author && currentUser._id === post.author._id;

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDelete(post._id);
        }
    };

    return (
        <article className="card mb-6 group transition-all duration-300 hover:shadow-2xl dark:hover:shadow-slate-700/50 relative">
            {/* Author Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author?.username}`}>
                        <UserAvatar
                            src={post.author?.avatarUrl}
                            alt={post.author?.displayName}
                            size="md"
                            className="ring-2 ring-transparent hover:ring-indigo-500 transition-all"
                        />
                    </Link>
                    <div>
                        <Link
                            to={`/profile/${post.author?.username}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            {post.author?.displayName || 'Unknown User'}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>@{post.author?.username || 'unknown'}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            {post.updatedAt && new Date(post.updatedAt) > new Date(post.createdAt) && (
                                <span className="text-xs">(edited)</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Only show for own posts */}
                {isOwnPost && (
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
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Visibility Badge */}
            {post.visibility && (
                <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${post.visibility === 'public'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                        {post.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                        {post.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                </div>
            )}

            {/* Post Content */}
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-base sm:text-lg">
                {post.content}
            </p>

            {/* Post Image */}
            {post.imageUrl && (
                <div
                    className="mt-4 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 cursor-pointer"
                    onClick={() => onViewImage && onViewImage(post.imageUrl)}
                    title="Click to view full size"
                >
                    <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full max-h-[500px] object-cover block transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}
        </article>
    );
}
