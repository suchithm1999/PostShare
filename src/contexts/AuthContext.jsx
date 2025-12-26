import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

// Token will be refreshed 5 minutes before expiry
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const ACCESS_TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Decode JWT token to get expiry time
 * @param {string} token - JWT token
 * @returns {number|null} Expiry timestamp in milliseconds
 */
function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<string|null>} New access token or null if failed
 */
async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        return null;
    }

    try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.accessToken;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}

/**
 * Authentication Context Provider
 * Manages global authentication state with automatic token refresh
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const refreshTimerRef = useRef(null);

    /**
     * Schedule token refresh
     * Refreshes access token 5 minutes before it expires
     */
    const scheduleTokenRefresh = useCallback((token, refToken) => {
        // Clear existing timer
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        if (!token || !refToken) {
            return;
        }

        const expiry = getTokenExpiry(token);
        if (!expiry) {
            // If we can't determine expiry, assume 30 minutes and refresh at 25 minutes
            const timeUntilRefresh = ACCESS_TOKEN_EXPIRY_MS - REFRESH_THRESHOLD_MS;
            refreshTimerRef.current = setTimeout(async () => {
                const newToken = await refreshAccessToken(refToken);
                if (newToken) {
                    updateAccessToken(newToken);
                    console.log('✅ Access token auto-refreshed');
                } else {
                    console.warn('⚠️ Failed to auto-refresh token');
                    logout();
                }
            }, timeUntilRefresh);
            return;
        }

        const now = Date.now();
        const timeUntilExpiry = expiry - now;
        const timeUntilRefresh = timeUntilExpiry - REFRESH_THRESHOLD_MS;

        if (timeUntilRefresh > 0) {
            refreshTimerRef.current = setTimeout(async () => {
                console.log('🔄 Auto-refreshing access token...');
                const newToken = await refreshAccessToken(refToken);
                if (newToken) {
                    updateAccessToken(newToken);
                    console.log('✅ Access token auto-refreshed successfully');
                } else {
                    console.warn('⚠️ Failed to auto-refresh token, logging out');
                    logout();
                }
            }, timeUntilRefresh);
        } else if (timeUntilExpiry > 0) {
            // Token expires soon, refresh immediately
            refreshAccessToken(refToken).then((newToken) => {
                if (newToken) {
                    updateAccessToken(newToken);
                    console.log('✅ Access token refreshed immediately (near expiry)');
                } else {
                    console.warn('⚠️ Failed to refresh expired token');
                    logout();
                }
            });
        } else {
            // Token already expired
            console.warn('⚠️ Access token already expired');
            logout();
        }
    }, []);

    /**
     * Initialize auth state from localStorage on mount
     */
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedAccessToken = localStorage.getItem('accessToken');
                const storedRefreshToken = localStorage.getItem('refreshToken');
                const storedUser = localStorage.getItem('user');

                if (storedAccessToken && storedUser) {
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                    setUser(JSON.parse(storedUser));

                    // Schedule token refresh
                    if (storedRefreshToken) {
                        scheduleTokenRefresh(storedAccessToken, storedRefreshToken);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Cleanup timer on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [scheduleTokenRefresh]);

    /**
     * Login function
     * @param {Object} authData - { accessToken, refreshToken, user }
     */
    const login = (authData) => {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } = authData;

        // Update state
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);

        // Persist to localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Schedule token refresh
        if (newRefreshToken) {
            scheduleTokenRefresh(newAccessToken, newRefreshToken);
        }
    };

    /**
     * Logout function
     * Clears all auth state and refresh timer
     */
    const logout = useCallback(() => {
        // Clear refresh timer
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        // Clear state
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }, []);

    /**
     * Update user profile
     * @param {Object} updates - Updated user fields
     */
    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist to localStorage
    };

    /**
     * Update access token (after refresh)
     * @param {string} newAccessToken - New access token
     */
    const updateAccessToken = useCallback((newAccessToken) => {
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);

        // Schedule next refresh
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (currentRefreshToken) {
            scheduleTokenRefresh(newAccessToken, currentRefreshToken);
        }
    }, [scheduleTokenRefresh]);

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is logged in
     */
    const isAuthenticated = () => {
        return !!user && !!accessToken;
    };

    /**
     * Get authorization header
     * @returns {string|null} Bearer token string or null
     */
    const getAuthHeader = () => {
        if (!accessToken) return null;
        return `Bearer ${accessToken}`;
    };

    const value = {
        // State
        user,
        accessToken,
        refreshToken,
        loading,
        isAuthenticated: isAuthenticated(),

        // Actions
        login,
        logout,
        updateUser,
        updateAccessToken,
        getAuthHeader,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
