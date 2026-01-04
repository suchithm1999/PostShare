import { useState, useEffect } from 'react';
import api from '../services/apiClient';

/**
 * Custom hook for fetching and managing following list data
 * 
 * @param {string} username - Username to fetch following for
 * @returns {Object} - Following data and control functions
 * @property {Array} following - Array of following user objects
 * @property {Object} pagination - Pagination metadata
 * @property {boolean} loading - Initial load state
 * @property {boolean} loadingMore - Loading next page state
 * @property {string|null} error - Error message if any
 * @property {Function} loadNextPage - Load next page of following
 * @property {Function} refresh - Reload from page 1
 * 
 * @example
 * const { following, loading, loadNextPage, pagination } = useFollowing('johndoe');
 */
export default function useFollowing(username) {
    const [following, setFollowing] = useState([]);
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
            fetchFollowing(1, true);
        }
    }, [username]);

    /**
     * Fetch following for a specific page
     * @param {number} page - Page number to fetch
     * @param {boolean} isInitial - Whether this is the initial load
     */
    const fetchFollowing = async (page, isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const response = await api.get(`/users/${username}/following`, {
                params: { page, limit: 20 },
            });

            const { following: newFollowing, pagination: newPagination } = response;

            if (isInitial) {
                // Replace following for initial load
                setFollowing(newFollowing || []);
            } else {
                // Append following for pagination
                setFollowing((prev) => [
                    ...prev,
                    ...(newFollowing || []),
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
            console.error('Failed to fetch following:', err);
            setError(err.message || 'Failed to load following list');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    /**
     * Load next page of following
     */
    const loadNextPage = () => {
        if (!pagination.hasMore || loadingMore || loading) return;

        const nextPage = pagination.page + 1;
        fetchFollowing(nextPage, false);
    };

    /**
     * Refresh following from page 1
     */
    const refresh = () => {
        fetchFollowing(1, true);
    };

    return {
        following,
        pagination,
        loading,
        loadingMore,
        error,
        loadNextPage,
        refresh,
    };
}
