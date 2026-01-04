import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Users } from 'lucide-react';
import useFollowing from '../hooks/useFollowing';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import UserListItem from './UserListItem';
import ListSearchBar from './ListSearchBar';
import EmptyState from './EmptyState';
import { useAuth } from '../hooks/useAuth';
import FollowButton from './FollowButton';

/**
 * FollowingList modal component
 * Displays a list of users that the specified user is following
 * Includes search, infinite scroll, and empty states
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {string} props.username - Username to fetch following for
 */
export default function FollowingList({ isOpen, onClose, username }) {
    const { user: currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const { following, pagination, loading, loadingMore, error, loadNextPage, refresh } = useFollowing(username);

    // Track follow states for optimistic updates (all users in following list are initially followed)
    const [followStates, setFollowStates] = useState({});

    // Determine if viewing own following
    const isOwnProfile = currentUser?.username === username;

    // Infinite scroll ref
    const loadMoreRef = useInfiniteScroll(loadNextPage, pagination.hasMore, loadingMore);

    // Filter following by search query
    const filteredFollowing = useMemo(() => {
        if (!searchQuery.trim()) return following;

        const query = searchQuery.toLowerCase();
        return following.filter((user) =>
            user.username.toLowerCase().includes(query) ||
            user.displayName.toLowerCase().includes(query)
        );
    }, [following, searchQuery]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Don't render if not open
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="following-modal-title"
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full sm:w-[600px] max-h-[90vh] sm:max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                        <h2 id="following-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                            {isOwnProfile ? 'Your following' : `${username}'s following`}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <ListSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search following..."
                        resultCount={searchQuery ? filteredFollowing.length : undefined}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Initial Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="p-8 text-center">
                                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={refresh}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty State (not following anyone) */}
                        {!loading && !error && following.length === 0 && !searchQuery && (
                            <EmptyState
                                icon={<Users className="w-16 h-16" />}
                                title="Not following anyone"
                                description="Discover users to follow and see their posts in your feed"
                            />
                        )}

                        {/* Empty State (no search results) */}
                        {!loading && !error && searchQuery && filteredFollowing.length === 0 && (
                            <EmptyState
                                title="No users found"
                                description={`No following match "${searchQuery}"`}
                            />
                        )}

                        {/* Following List */}
                        {!loading && !error && filteredFollowing.length > 0 && (
                            <div>
                                {filteredFollowing.map((user) => {
                                    // Check if user has been unfollowed (optimistically removed)
                                    if (followStates[user.username] === false) {
                                        return null; // Don't render unfollowed users
                                    }

                                    return (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            onClick={onClose}
                                            action={
                                                currentUser && currentUser.username !== user.username ? (
                                                    <FollowButton
                                                        username={user.username}
                                                        initialFollowing={followStates[user.username] !== undefined ? followStates[user.username] : true}
                                                        onFollowChange={(newState) => {
                                                            // Update local follow state for optimistic UI
                                                            setFollowStates(prev => ({
                                                                ...prev,
                                                                [user.username]: newState === true
                                                            }));
                                                        }}
                                                        className="text-sm px-3 py-1.5"
                                                    />
                                                ) : null
                                            }
                                        />
                                    );
                                })}

                                {/* Loading More Indicator */}
                                {loadingMore && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                    </div>
                                )}

                                {/* Infinite Scroll Sentinel */}
                                {!searchQuery && pagination.hasMore && !loadingMore && (
                                    <div ref={loadMoreRef} className="h-1" />
                                )}

                                {/* End of List Message */}
                                {!searchQuery && !pagination.hasMore && following.length > 0 && (
                                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                        You've reached the end
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

FollowingList.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
};
