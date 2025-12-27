import PropTypes from 'prop-types';
import { User } from 'lucide-react';

/**
 * UserAvatar Component
 * Displays user avatar or fallback icon
 * 
 * @param {Object} props
 * @param {string} props.src - Avatar image URL
 * @param {string} props.alt - Alt text for image
 * @param {string} props.size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.className - Additional CSS classes
 */
export default function UserAvatar({ src, alt = 'User avatar', size = 'md', className = '' }) {
    // Size mappings
    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    const iconSizes = {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 48,
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const iconSize = iconSizes[size] || iconSizes.md;

    return (
        <div
            className={`${sizeClass} rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div
                className="w-full h-full items-center justify-center text-white"
                style={{ display: src ? 'none' : 'flex' }}
            >
                <User size={iconSize} />
            </div>
        </div>
    );
}

UserAvatar.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};
