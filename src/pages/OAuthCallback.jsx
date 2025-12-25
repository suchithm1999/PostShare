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
            console.log('✅ OAuth success! Logging in...');

            // Mark as processed BEFORE any async operations
            hasProcessed.current = true;

            // For now, we'll decode the JWT to get user info (temporary workaround)
            // In production, we'd fetch from /api/users/me
            try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const user = {
                    _id: payload.userId,
                    email: payload.email,
                    username: payload.username,
                    displayName: payload.displayName || payload.username,
                };

                console.log('👤 User from token:', user);

                // Login with tokens and user data
                login({
                    accessToken,
                    refreshToken,
                    expiresIn: 1800,
                    user,
                });

                console.log('✅ Login complete! Redirecting to home...');
                // Redirect to home
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Failed to parse token:', error);
                navigate('/login?error=auth_failed', { replace: true });
            }
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
