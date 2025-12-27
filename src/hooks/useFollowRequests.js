import { useState, useEffect, useRef } from 'react';
import followService from '../services/followService';
import { useAuth } from './useAuth';

/**
 * Custom hook to poll for follow requests
 * Fetches incoming follow requests at regular intervals
 * Automatically stops when user is inactive or away
 * 
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms = 30s)
 * @returns {Object} { requests, count, loading, error, refetch }
 */
export function useFollowRequests(interval = 30000) {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const isActiveRef = useRef(true);

    const fetchRequests = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await followService.getIncomingRequests();
            setRequests(data.requests || []);
            setCount(data.count || 0);
        } catch (err) {
            console.error('Failed to fetch follow requests:', err);
            setError(err.message || 'Failed to load follow requests');
        } finally {
            setLoading(false);
        }
    };

    // Track page visibility to pause polling when user is away
    useEffect(() => {
        const handleVisibilityChange = () => {
            isActiveRef.current = !document.hidden;

            if (document.hidden) {
                // Page is hidden, stop polling
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                // Page is visible again, resume polling
                fetchRequests(); // Immediate fetch
                intervalRef.current = setInterval(fetchRequests, interval);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [interval, user]);

    // Initial fetch and setup polling
    useEffect(() => {
        if (!user) {
            setRequests([]);
            setCount(0);
            return;
        }

        // Initial fetch
        fetchRequests();

        // Setup polling interval (only if page is visible)
        if (!document.hidden) {
            intervalRef.current = setInterval(fetchRequests, interval);
        }

        // Listen for follow request changes from other components
        const handleRequestsChanged = () => {
            fetchRequests();
        };
        window.addEventListener('followRequestsChanged', handleRequestsChanged);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            window.removeEventListener('followRequestsChanged', handleRequestsChanged);
        };
    }, [user, interval]);

    return {
        requests,
        count,
        loading,
        error,
        refetch: fetchRequests,
    };
}

export default useFollowRequests;
