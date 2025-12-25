/**
 * API Client Utility
 * Centralized HTTP client with automatic JWT token injection
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get access token from localStorage
 * @returns {string|null} Access token
 */
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token
 */
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

/**
 * Set tokens in localStorage
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 */
function setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
}

/**
 * Clear tokens and user data
 */
function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

/**
 * Make HTTP request with automatic token injection and refresh
 * @param {string} endpoint - API endpoint (e.g., '/posts')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add authorization header if token exists
    const token = getAccessToken();
    if (token && !options.skipAuth) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Make request
    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for OAuth
    });

    // Handle token expiration (401) - attempt to refresh
    // BUT: Skip this logic if skipAuth is true (login/signup endpoints)
    if (response.status === 401 && !options.skipRetry && !options.skipAuth) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            // Retry original request with new token
            headers.Authorization = `Bearer ${getAccessToken()}`;
            response = await fetch(url, {
                ...options,
                headers,
                skipRetry: true, // Prevent infinite retry loop
            });
        } else {
            // Refresh failed, redirect to login
            clearAuth();
            window.location.href = '/login';
            throw new Error('Session expired. Please log in again.');
        }
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const data = isJson ? await response.json() : await response.text();

    // Handle error responses
    if (!response.ok) {
        const error = new Error(data.error || 'An error occurred');
        error.status = response.status;
        error.code = data.code;
        error.details = data.details;
        throw error;
    }

    return data;
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} True if refresh successful
 */
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.accessToken, refreshToken);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * API methods
 */
export const api = {
    /**
     * GET request
     */
    get: (endpoint, options = {}) => {
        return request(endpoint, {
            method: 'GET',
            ...options,
        });
    },

    /**
     * POST request
     */
    post: (endpoint, data, options = {}) => {
        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    },

    /**
     * PUT request
     */
    put: (endpoint, data, options = {}) => {
        return request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    },

    /**
     * DELETE request
     */
    delete: (endpoint, options = {}) => {
        return request(endpoint, {
            method: 'DELETE',
            ...options,
        });
    },

    /**
     * PATCH request
     */
    patch: (endpoint, data, options = {}) => {
        return request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options,
        });
    },

    /**
     * Upload file (multipart/form-data)
     */
    upload: (endpoint, formData, options = {}) => {
        const token = getAccessToken();
        const headers = {
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData (browser sets it with boundary)
        return fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
            ...options,
        }).then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                const error = new Error(data.error || 'Upload failed');
                error.status = response.status;
                error.code = data.code;
                throw error;
            }
            return data;
        });
    },
};

/**
 * Example usage:
 * 
 * // GET request
 * const posts = await api.get('/posts');
 * 
 * // POST request
 * const newPost = await api.post('/posts/create', {
 *   title: 'My Post',
 *   content: 'Hello world',
 * });
 * 
 * // File upload
 * const formData = new FormData();
 * formData.append('file', file);
 * const result = await api.upload('/images/upload', formData);
 * 
 * // With error handling
 * try {
 *   const user = await api.get('/users/me');
 * } catch (error) {
 *   console.error('API error:', error.message, error.code);
 * }
 */

export default api;
