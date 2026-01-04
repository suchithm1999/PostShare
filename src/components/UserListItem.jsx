import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { memo } from 'react';
import UserAvatar from './UserAvatar';

/**
 * UserListItem component for displaying individual user in followers/following lists
 * Shows avatar, username, display name, and bio
 * 
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {string} props.user._id - User ID
 * @param {string} props.user.username - Username
 * @param {string} props.user.displayName - Display name
 * @param {string} props.user.avatarUrl - Avatar URL (optional)
 * @param {string} props.user.bio - User bio (optional)
 * @param {React.ReactNode} props.action - Optional action button (e.g., FollowButton)
 * @param {Function} props.onClick - Optional callback when user is clicked (e.g., to close parent modal)
 */
function UserListItem({ user, action, onClick }) {
    return (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            {/* User Avatar and Info (clickable link to profile) */}
            <Link
                to={`/profile/${user.username}`}
                onClick={onClick}
                className="flex items-center gap-3 flex-1 min-w-0"
            >
                <UserAvatar
                    src={user.avatarUrl}
                    alt={user.displayName}
                    size="md"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.displayName}
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            @{user.username}
                        </span>
                    </div>
                    {user.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {user.bio}
                        </p>
                    )}
                </div>
            </Link>

            {/* Action Button (e.g., Follow/Unfollow) */}
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}

UserListItem.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        avatarUrl: PropTypes.string,
        bio: PropTypes.string,
    }).isRequired,
    action: PropTypes.node,
    onClick: PropTypes.func,
};

UserListItem.defaultProps = {
    action: null,
    onClick: null,
};

// Export memoized version for performance
export default memo(UserListItem);
