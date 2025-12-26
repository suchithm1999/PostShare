import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * OAuth Callback Handler
 * Handles OAuth redirect with tokens in URL parameters
 */
export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const hasProcessed = useRef(false); // Prevent double execution

    useEffect(() => {
        // Only run once
        if (hasProcessed.current) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const oauthSuccess = params.get('oauth_success');
        const oauthError = params.get('oauth_error');

        console.log('🔍 OAuth Callback - Params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, oauthSuccess, oauthError });

        if (oauthError) {
            console.error('❌ OAuth error:', oauthError);
            hasProcessed.current = true;
            navigate('/login?error=oauth_failed', { replace: true });
            return;
        }

        if (oauthSuccess && accessToken && refreshToken) {
            console.log('✅ OAuth success! Fetching user profile...');

            // Mark as processed BEFORE any async operations
            hasProcessed.current = true;

            // Fetch user profile from API to get complete data including avatarUrl
            const fetchUserProfile = async () => {
                try {
                    const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
                    const response = await fetch(`${API_BASE_URL}/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch user profile');
                    }

                    const userData = await response.json();
                    console.log('👤 User profile fetched:', userData);

                    // Login with tokens and complete user data
                    login({
                        accessToken,
                        refreshToken,
                        expiresIn: 1800,
                        user: userData,
                    });

                    console.log('✅ Login complete! Redirecting to home...');
                    navigate('/', { replace: true });
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    navigate('/login?error=auth_failed', { replace: true });
                }
            };

            fetchUserProfile();
        } else {
            console.warn('⚠️ No valid OAuth data - redirecting to login');
            hasProcessed.current = true;
            navigate('/login', { replace: true });
        }
    }, [location, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
}
