import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/apiClient';
import followService from '../services/followService';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import EditPostModal from '../components/EditPostModal';
import ImageModal from '../components/ImageModal';
import { BlogService } from '../services/blogService';
import { Edit, Calendar, Users, Send } from 'lucide-react';

/**
 * Profile Page
 * Displays user profile with avatar, bio, and stats
 * Shows "Edit Profile" button for own profile
 */
export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [pendingRequestId, setPendingRequestId] = useState(null);

    // Post actions state
    const [editingPost, setEditingPost] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    // Determine if viewing own profile
    const isOwnProfile = !username || username === currentUser?.username;

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');

            let response;
            if (isOwnProfile) {
                // Fetch own profile
                response = await api.get('/users/me');
            } else {
                // Fetch other user's profile
                response = await api.get(`/users/${username}`);
            }

            setProfile(response);

            // Check if following this user (for non-own profiles)
            if (!isOwnProfile) {
                try {
                    const followStatus = await api.get(`/users/${username}/followers`);
                    // Check if current user is in the followers list
                    const following = followStatus.followers?.some(
                        f => f.username === currentUser?.username
                    ) || false;
                    setIsFollowing(following);

                    // Check for pending follow request
                    if (!following) {
                        const sentRequests = await followService.getSentRequests();
                        const pendingRequest = sentRequests.requests?.find(
                            req => req.recipient.username === username
                        );
                        setPendingRequestId(pendingRequest?._id || null);
                    }
                } catch (err) {
                    // If error, assume not following
                    setIsFollowing(false);
                    setPendingRequestId(null);
                }
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (id) => {
        try {
            await BlogService.deletePost(id);
            // Optimistically update UI
            setProfile(prev => ({
                ...prev,
                posts: prev.posts.filter(post => post._id !== id),
                postCount: prev.postCount - 1
            }));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    const handleUpdatePost = async (id, dto) => {
        try {
            const updatedPost = await BlogService.updatePost(id, dto);
            setProfile(prev => ({
                ...prev,
                posts: prev.posts.map(p => p._id === id ? updatedPost : p)
            }));
        } catch (error) {
            console.error("Failed to update post", error);
            alert(error.message || "Failed to update post. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-slate-900 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-slate-900 py-4 md:py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <UserAvatar
                            src={profile.avatarUrl}
                            alt={profile.displayName}
                            size="xl"
                        />

                        {/* Profile Info */}
                        <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {profile.displayName}
                                </h1>
                                {isOwnProfile ? (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                        <Link
                                            to="/profile/edit"
                                            className="flex w-full sm:w-auto sm:inline-flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Edit size={18} />
                                            Edit Profile
                                        </Link>
                                        <Link
                                            to="/sent-requests"
                                            className="flex w-full sm:w-auto sm:inline-flex justify-center items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Send size={18} />
                                            Sent Requests
                                        </Link>
                                    </div>
                                ) : (
                                    <FollowButton
                                        username={profile.username}
                                        initialFollowing={isFollowing}
                                        pendingRequestId={pendingRequestId}
                                        onFollowChange={(state, requestId) => {
                                            if (state === 'request_sent') {
                                                // Request sent
                                                setPendingRequestId(requestId);
                                            } else if (state === 'request_canceled') {
                                                // Request canceled
                                                setPendingRequestId(null);
                                            } else if (typeof state === 'boolean') {
                                                // Following state changed (unfollow)
                                                setIsFollowing(state);
                                                setPendingRequestId(null);
                                                // Update follower count optimistically
                                                setProfile(prev => ({
                                                    ...prev,
                                                    followerCount: prev.followerCount + (state ? 1 : -1),
                                                }));
                                            }
                                        }}
                                        className="mt-4 sm:mt-0 w-full sm:w-auto justify-center"
                                    />
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                @{profile.username}
                            </p>

                            {/* Bio */}
                            {profile.bio && (
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                        {profile.followerCount}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        followers
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                        {profile.followingCount}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        following
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Joined {joinDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Posts Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 px-2">
                        Posts ({profile.posts?.length || 0})
                    </h2>

                    {!profile.posts || profile.posts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center text-gray-500 dark:text-gray-400">
                            <p>No posts yet.</p>
                        </div>
                    ) : (
                        profile.posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onDelete={isOwnProfile ? handleDeletePost : undefined}
                                onEdit={isOwnProfile ? setEditingPost : undefined}
                                onViewImage={setViewingImage}
                            />
                        ))
                    )}
                </div>

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
        </div>
    );
}
