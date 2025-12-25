import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import EditPostModal from '../components/EditPostModal';
import ImageModal from '../components/ImageModal';
import { BlogService } from '../services/blogService';
import { Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await BlogService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error(error);
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

    const handleClearFeed = async () => {
        if (window.confirm('Are you sure you want to delete all posts? This cannot be undone.')) {
            try {
                await BlogService.clearAllPosts();
                setPosts([]);
            } catch (error) {
                console.error("Failed to clear feed", error);
                alert("Failed to clear feed. Please try again.");
            }
        }
    };

    const handleDeletePost = async (id) => {
        try {
            await BlogService.deletePost(id);
            setPosts(posts.filter(post => post.id !== id));
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
            setPosts(posts.map(p => p.id === id ? updatedPost : p));
        } catch (error) {
            console.error("Failed to update post", error);
            alert(error.message || "Failed to update post. Please try again.");
        }
    };

    const handleViewImage = (imageUrl) => {
        setViewingImage(imageUrl);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Latest Posts
                </h1>
                {posts.length > 0 && (
                    <button
                        onClick={handleClearFeed}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} />
                        Clear Feed
                    </button>
                )}
            </div>

            {posts.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700 animate-fade-in shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">No posts yet, start your journey!</p>
                    <Link to="/create" className="btn btn-primary inline-flex">
                        Create your first post
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={handleDeletePost}
                            onEdit={handleEditPost}
                            onViewImage={handleViewImage}
                        />
                    ))}
                </div>
            )}

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
        </div>
    );
}
