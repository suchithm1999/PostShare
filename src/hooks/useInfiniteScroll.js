import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for infinite scroll functionality using Intersection Observer
 * 
 * @param {Function} callback - Function to call when sentinel element enters viewport
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether data is currently being fetched
 * @returns {Function} - Ref callback to attach to sentinel element
 * 
 * @example
 * const loadMoreRef = useInfiniteScroll(loadNextPage, pagination.hasMore, loading);
 * // In JSX: <div ref={loadMoreRef} className="h-1" />
 */
export default function useInfiniteScroll(callback, hasMore, loading = false) {
    const observerRef = useRef();

    const sentinelRef = useCallback(
        (node) => {
            // Disconnect previous observer if it exists
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            // Don't observe if loading or no more items
            if (loading || !hasMore) return;

            // Create new Intersection Observer
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    // Check if sentinel element is intersecting (visible in viewport)
                    if (entries[0].isIntersecting && hasMore && !loading) {
                        callback();
                    }
                },
                {
                    // Trigger when element is 100px from entering viewport
                    rootMargin: '100px',
                    threshold: 0.1,
                }
            );

            // Start observing the sentinel element
            if (node) {
                observerRef.current.observe(node);
            }
        },
        [callback, hasMore, loading]
    );

    // Cleanup observer on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return sentinelRef;
}
