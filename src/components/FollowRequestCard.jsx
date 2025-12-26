import PropTypes from 'prop-types';
import { Check, X, Clock } from 'lucide-react';
import UserAvatar from './UserAvatar';

/**
 * FollowRequestCard Component
 * Displays a follow request with accept/decline actions
 * 
 * @param {Object} props
 * @param {Object} props.request - Follow request object
 * @param {string} props.variant - 'incoming' or 'outgoing'
 * @param {function} props.onAccept - Callback when accept is clicked (incoming only)
 * @param {function} props.onDecline - Callback when decline is clicked (incoming only)
 * @param {function} props.onCancel - Callback when cancel is clicked (outgoing only)
 * @param {boolean} props.loading - Loading state
 */
export default function FollowRequestCard({
    request,
    variant = 'incoming',
    onAccept,
    onDecline,
    onCancel,
    loading = false
}) {
    const user = variant === 'incoming' ? request.requester : request.recipient;
    const timeAgo = getTimeAgo(new Date(request.createdAt));

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
            {/* User Info */}
            <div className="flex items-center gap-3">
                <UserAvatar
                    src={user.avatarUrl}
                    alt={user.displayName}
                    size="md"
                />
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <Clock size={12} className="inline mr-1" />
                        {timeAgo}
                    </p>
                </div>
            </div>

            {/* Actions */}
            {variant === 'incoming' ? (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAccept?.(request._id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Accept follow request"
                    >
                        <Check size={18} />
                        <span>Accept</span>
                    </button>
                    <button
                        onClick={() => onDecline?.(request._id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Decline follow request"
                    >
                        <X size={18} />
                        <span>Decline</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                        Pending
                    </span>
                    <button
                        onClick={() => onCancel?.(request._id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel follow request"
                    >
                        <X size={16} />
                        <span>Cancel</span>
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Get human-readable time ago string
 * @param {Date} date - Date to convert
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
}

FollowRequestCard.propTypes = {
    request: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        requester: PropTypes.shape({
            _id: PropTypes.string,
            username: PropTypes.string,
            displayName: PropTypes.string,
            avatarUrl: PropTypes.string
        }),
        recipient: PropTypes.shape({
            _id: PropTypes.string,
            username: PropTypes.string,
            displayName: PropTypes.string,
            avatarUrl: PropTypes.string
        }),
        createdAt: PropTypes.string.isRequired
    }).isRequired,
    variant: PropTypes.oneOf(['incoming', 'outgoing']),
    onAccept: PropTypes.func,
    onDecline: PropTypes.func,
    onCancel: PropTypes.func,
    loading: PropTypes.bool
};
