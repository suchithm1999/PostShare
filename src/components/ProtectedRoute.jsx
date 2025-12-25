import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Child components or redirect to login
 * 
 * @example
 * <Route path="/profile" element={
 *   <ProtectedRoute>
 *     <ProfilePage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render children
    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * Public Only Route Component
 * Redirects to home if user is already authenticated
 * Use for login/signup pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactElement} Child components or redirect to home
 * 
 * @example
 * <Route path="/login" element={
 *   <PublicOnlyRoute>
 *     <LoginPage />
 *   </PublicOnlyRoute>
 * } />
 */
export function PublicOnlyRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If authenticated, redirect to home
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // User is not authenticated, render children (login/signup pages)
    return children;
}

PublicOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
