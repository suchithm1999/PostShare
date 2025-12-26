import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import EditPostModal from '../components/EditPostModal';
import ImageModal from '../components/ImageModal';
import Toast from '../components/Toast';
import { BlogService } from '../services/blogService';
import { Loader2 } from 'lucide-react';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [toast, setToast] = useState(null);
    const location = useLocation();

    useEffect(() => {
        loadPosts();
    }, [location]); // Reload when location changes (navigating back to feed)

    const loadPosts = async () => {
        try {
            setError(null); // Clear previous errors
            const data = await BlogService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error(error);
            // Check if it's an authentication error
            if (error.message?.includes('Session expired') || error.message?.includes('log in')) {
                // Let the API client handle the redirect
                return;
            }
            setError('Failed to load posts. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const handleDeletePost = async (id) => {
        try {
            await BlogService.deletePost(id);
            setPosts(posts.filter(post => post._id !== id));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
    };

    const handleUpdatePost = async (id, dto) => {
        try {
            const updatedPost = await BlogService.updatePost(id, dto);
            setPosts(posts.map(p => p._id === id ? updatedPost : p));
        } catch (error) {
            console.error("Failed to update post", error);

            // Check if post was deleted (404 error)
            if (error.message?.includes('not found') || error.status === 404) {
                // Show toast notification
                setToast({
                    message: 'This post is no longer available',
                    type: 'info'
                });

                // Close the edit modal
                setEditingPost(null);

                // Remove post from feed
                setPosts(posts.filter(p => p._id !== id));

                // Auto-refresh feed after brief delay
                setTimeout(() => {
                    loadPosts();
                }, 1500);
            } else {
                // Show error for other failures
                setToast({
                    message: error.message || 'Failed to update post. Please try again.',
                    type: 'error'
                });
            }
        }
    };

    const handleViewImage = (imageUrl) => {
        setViewingImage(imageUrl);
    };

    return (
        <div className="max-w-2xl mx-auto py-4 md:py-8 px-0 md:px-4">
            <div className="flex justify-between items-center mb-8 px-4 md:px-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Latest Posts
                </h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-6">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setLoading(true);
                            loadPosts();
                        }}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!error && posts.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700 animate-fade-in shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">No posts yet, start your journey!</p>
                    <Link to="/create" className="btn btn-primary inline-flex">
                        Create your first post
                    </Link>
                </div>
            ) : !error ? (
                <div className="space-y-2 md:space-y-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handleDeletePost}
                            onEdit={handleEditPost}
                            onViewImage={handleViewImage}
                        />
                    ))}
                </div>
            ) : null}

            <EditPostModal
                post={editingPost}
                isOpen={!!editingPost}
                onClose={() => setEditingPost(null)}
                onUpdate={handleUpdatePost}
            />


            <ImageModal
                imageUrl={viewingImage}
                isOpen={!!viewingImage}
                onClose={() => setViewingImage(null)}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
