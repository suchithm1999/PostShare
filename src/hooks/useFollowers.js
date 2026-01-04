import { useState, useEffect } from 'react';
import api from '../services/apiClient';

/**
 * Custom hook for fetching and managing followers list data
 * 
 * @param {string} username - Username to fetch followers for
 * @returns {Object} - Followers data and control functions
 * @property {Array} followers - Array of follower user objects
 * @property {Object} pagination - Pagination metadata
 * @property {boolean} loading - Initial load state
 * @property {boolean} loadingMore - Loading next page state
 * @property {string|null} error - Error message if any
 * @property {Function} loadNextPage - Load next page of followers
 * @property {Function} refresh - Reload from page 1
 * 
 * @example
 * const { followers, loading, loadNextPage, pagination } = useFollowers('johndoe');
 */
export default function useFollowers(username) {
    const [followers, setFollowers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: true,
    });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Fetch initial page on mount or when username changes
    useEffect(() => {
        if (username) {
            fetchFollowers(1, true);
        }
    }, [username]);

    /**
     * Fetch followers for a specific page
     * @param {number} page - Page number to fetch
     * @param {boolean} isInitial - Whether this is the initial load
     */
    const fetchFollowers = async (page, isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const response = await api.get(`/users/${username}/followers`, {
                params: { page, limit: 20 },
            });

            const { followers: newFollowers, pagination: newPagination } = response;

            if (isInitial) {
                // Replace followers for initial load
                setFollowers(newFollowers || []);
            } else {
                // Append followers for pagination
                setFollowers((prev) => [
                    ...prev,
                    ...(newFollowers || []),
                ]);
            }

            setPagination(newPagination || {
                page,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasMore: false,
            });

        } catch (err) {
            console.error('Failed to fetch followers:', err);
            setError(err.message || 'Failed to load followers');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    /**
     * Load next page of followers
     */
    const loadNextPage = () => {
        if (!pagination.hasMore || loadingMore || loading) return;

        const nextPage = pagination.page + 1;
        fetchFollowers(nextPage, false);
    };

    /**
     * Refresh followers from page 1
     */
    const refresh = () => {
        fetchFollowers(1, true);
    };

    return {
        followers,
        pagination,
        loading,
        loadingMore,
        error,
        loadNextPage,
        refresh,
    };
}
