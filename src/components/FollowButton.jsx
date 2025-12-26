import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UserPlus, UserMinus, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/apiClient';

/**
 * FollowButton Component
 * Displays a follow/unfollow button for a user
 * 
 * @param {Object} props
 * @param {string} props.username - Username to follow/unfollow
 * @param {boolean} props.initialFollowing - Initial following state
 * @param {function} props.onFollowChange - Callback when follow state changes
 * @param {string} props.className - Additional CSS classes
 */
export default function FollowButton({
    username,
    initialFollowing = false,
    onFollowChange,
    className = ''
}) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update if initial state changes
    useEffect(() => {
        setIsFollowing(initialFollowing);
    }, [initialFollowing]);

    const handleFollowToggle = async () => {
        if (!user) {
            setError('Please log in to follow users');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isFollowing) {
                // Unfollow
                await api.delete(`/users/${username}/follow`);
                setIsFollowing(false);
                onFollowChange?.(false);
            } else {
                // Follow
                await api.post(`/users/${username}/follow`);
                setIsFollowing(true);
                onFollowChange?.(true);
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
            setError(err.message || 'Failed to update follow status');
            // Revert state on error
            setIsFollowing(!isFollowing);
        } finally {
            setLoading(false);
        }
    };

    // Don't show follow button for own profile
    if (user && user.username === username) {
        return null;
    }

    return (
        <div>
            <button
                onClick={handleFollowToggle}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } ${className}`}
            >
                {loading ? (
                    <>
                        <Loader size={18} className="animate-spin" />
                        <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                    </>
                ) : (
                    <>
                        {isFollowing ? (
                            <>
                                <UserMinus size={18} />
                                <span>Unfollow</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                <span>Follow</span>
                            </>
                        )}
                    </>
                )}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}

FollowButton.propTypes = {
    username: PropTypes.string.isRequired,
    initialFollowing: PropTypes.bool,
    onFollowChange: PropTypes.func,
    className: PropTypes.string,
};
