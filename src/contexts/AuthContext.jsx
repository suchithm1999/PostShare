import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 * Manages global authentication state
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

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
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

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
    };

    /**
     * Logout function
     * Clears all auth state
     */
    const logout = () => {
        // Clear state
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    /**
     * Update user profile
     * @param {Object} updates - Updated user fields
     */
    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    /**
     * Update access token (after refresh)
     * @param {string} newAccessToken - New access token
     */
    const updateAccessToken = (newAccessToken) => {
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
    };

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
