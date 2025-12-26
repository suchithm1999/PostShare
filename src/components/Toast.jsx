import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Toast Notification Component
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - 'success' | 'error' | 'info'
 * @param {number} props.duration - Auto-dismiss duration in ms
 * @param {function} props.onClose - Close callback
 */
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    };

    const Icon = icons[type];

    return (
        <div
            className={`fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300`}
        >
            <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${styles[type]}`}>
                <Icon size={20} className="flex-shrink-0" />
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
