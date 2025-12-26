import PropTypes from 'prop-types';
import { Heart } from 'lucide-react';

/**
 * NotificationBadge Component
 * Displays a notification bell icon with an optional badge count
 * 
 * @param {Object} props
 * @param {number} props.count - Number of unread notifications
 * @param {function} props.onClick - Callback when badge is clicked
 * @param {string} props.className - Additional CSS classes
 */
export default function NotificationBadge({ count = 0, onClick, className = '' }) {
    const hasNotifications = count > 0;

    return (
        <button
            onClick={onClick}
            className={`relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${className}`}
            title={hasNotifications ? `${count} new follow request${count > 1 ? 's' : ''}` : 'Follow requests'}
            aria-label={hasNotifications ? `${count} new notifications` : 'Notifications'}
        >
            <Heart
                size={24}
                className={`transition-colors ${hasNotifications
                    ? 'text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}
            />

            {hasNotifications && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-slate-800 animate-pulse">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}

NotificationBadge.propTypes = {
    count: PropTypes.number,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};
