import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UserPlus, UserMinus, Clock, X, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/apiClient';
import followService from '../services/followService';

/**
 * FollowButton Component
 * Displays a follow/unfollow button with follow request support
 * 
 * States:
 * - Not following, no request: "Follow" button
 * - Request sent (pending): "Request Sent" button (disabled)
 * - Following: "Following" button
 * 
 * @param {Object} props
 * @param {string} props.username - Username to follow/unfollow
 * @param {boolean} props.initialFollowing - Initial following state
 * @param {string|null} props.pendingRequestId - ID of pending outgoing request (if exists)
 * @param {function} props.onFollowChange - Callback when follow state changes
 * @param {string} props.className - Additional CSS classes
 */
export default function FollowButton({
    username,
    initialFollowing = false,
    pendingRequestId = null,
    onFollowChange,
    className = ''
}) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [requestId, setRequestId] = useState(pendingRequestId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update if initial state changes
    useEffect(() => {
        setIsFollowing(initialFollowing);
        setRequestId(pendingRequestId);
    }, [initialFollowing, pendingRequestId]);

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
            } else if (requestId) {
                // Cancel pending request
                await followService.cancelSentRequest(requestId);
                setRequestId(null);
                onFollowChange?.('request_canceled');
            } else {
                // Send follow request (optimistic update)
                setRequestId('pending'); // Temporary value

                try {
                    const response = await followService.sendFollowRequest(username);
                    setRequestId(response.requestId);
                    onFollowChange?.('request_sent', response.requestId);
                } catch (err) {
                    // Rollback on error
                    setRequestId(null);
                    throw err;
                }
            }
        } catch (err) {
            console.error('Follow action error:', err);
            setError(err.message || 'Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Don't show follow button for own profile
    if (user && user.username === username) {
        return null;
    }

    // Determine button state
    const isPendingRequest = !!requestId;
    const buttonDisabled = loading; // Only disable during loading, allow clicking to cancel request

    return (
        <div>
            <button
                onClick={handleFollowToggle}
                disabled={buttonDisabled}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                    : isPendingRequest
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 cursor-pointer'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } ${className}`}
            >
                {loading ? (
                    <>
                        <Loader size={18} className="animate-spin" />
                        <span>{isFollowing ? 'Unfollowing...' : isPendingRequest ? 'Canceling...' : 'Sending...'}</span>
                    </>
                ) : (
                    <>
                        {isFollowing ? (
                            <>
                                <UserMinus size={18} />
                                <span>Following</span>
                            </>
                        ) : isPendingRequest ? (
                            <>
                                <Clock size={18} />
                                <span>Request Sent</span>
                                <X size={16} className="ml-1 opacity-70 hover:opacity-100" />
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
    pendingRequestId: PropTypes.string,
    onFollowChange: PropTypes.func,
    className: PropTypes.string,
};
