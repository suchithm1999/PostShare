import PropTypes from 'prop-types';
import '../styles/ErrorMessage.css';

/**
 * ErrorMessage Component
 * Displays validation or error messages in a consistent, user-friendly format
 */
function ErrorMessage({ message, className = '' }) {
    if (!message) return null;

    return (
        <div className={`error-message ${className}`} role="alert">
            <svg
                className="error-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M8 5V9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
            <span className="error-text">{message}</span>
        </div>
    );
}

ErrorMessage.propTypes = {
    message: PropTypes.string,
    className: PropTypes.string,
};

export default ErrorMessage;
