import { useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ImageModal({ imageUrl, isOpen, onClose }) {
    const dialogRef = useRef(null);

    const handleBackdropClick = (e) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    if (!isOpen || !imageUrl) return null;

    return createPortal(
        <div
            ref={dialogRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
            <div className="relative max-w-7xl max-h-[90vh] animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 rounded-full text-white bg-black/50 hover:bg-black/70 transition-colors z-10"
                    title="Close"
                >
                    <X size={24} />
                </button>

                <img
                    src={imageUrl}
                    alt="Full size view"
                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    onClick={e => e.stopPropagation()}
                />
            </div>
        </div>,
        document.body
    );
}
