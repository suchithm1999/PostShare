import PropTypes from 'prop-types';

/**
 * EmptyState component for displaying empty state messages
 * Used across lists when there's no data to display
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element to display
 * @param {string} props.title - Main heading text
 * @param {string} props.description - Supporting description text
 * @param {React.ReactNode} props.action - Optional action button/link
 */
export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && (
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}

EmptyState.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
};

EmptyState.defaultProps = {
    icon: null,
    description: null,
    action: null,
};
