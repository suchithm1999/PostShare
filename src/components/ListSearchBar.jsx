import { useState, useEffect, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * ListSearchBar component with debounced search input
 * Used for filtering followers/following lists by username or displayName
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when search value changes (debounced)
 * @param {string} props.placeholder - Input placeholder text
 * @param {number} props.resultCount - Number of results (optional, shows count when searching)
 */
export default function ListSearchBar({ value, onChange, placeholder = 'Search users...', resultCount }) {
    const [inputValue, setInputValue] = useState(value);

    // Create debounced onChange function (300ms delay)
    const debouncedOnChange = useMemo(
        () => debounce(onChange, 300),
        [onChange]
    );

    // Update parent component with debounced value
    useEffect(() => {
        if (inputValue !== value) {
            debouncedOnChange(inputValue);
        }
    }, [inputValue, debouncedOnChange, value]);

    // Sync input value if parent changes it externally
    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleClear = () => {
        setInputValue('');
        onChange(''); // Clear immediately, no debounce
    };

    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
            <div className="relative">
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>

                {/* Search Input */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    aria-label="Search users"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                {/* Clear Button (shown when text is present) */}
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear search"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Result Count (shown when searching) */}
            {inputValue && resultCount !== undefined && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {resultCount} {resultCount === 1 ? 'result' : 'results'}
                </div>
            )}
        </div>
    );
}

ListSearchBar.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    resultCount: PropTypes.number,
};

ListSearchBar.defaultProps = {
    placeholder: 'Search users...',
    resultCount: undefined,
};
