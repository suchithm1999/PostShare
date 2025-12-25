import { verifyToken, extractTokenFromHeader } from './auth.js';

/**
 * Authentication middleware for Vercel serverless functions
 * Verifies JWT token and attaches user info to request object
 * 
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with authentication
 */
export function requireAuth(handler) {
    return async (req, res) => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization || req.headers.Authorization;
            const token = extractTokenFromHeader(authHeader);

            if (!token) {
                return res.status(401).json({
                    error: 'Authentication required',
                    code: 'MISSING_TOKEN',
                });
            }

            // Verify token
            let decoded;
            try {
                decoded = verifyToken(token);
            } catch (error) {
                return res.status(401).json({
                    error: error.message || 'Invalid or expired token',
                    code: 'INVALID_TOKEN',
                });
            }

            // Check token type (must be access token, not refresh token)
            if (decoded.type !== 'access') {
                return res.status(401).json({
                    error: 'Invalid token type',
                    code: 'WRONG_TOKEN_TYPE',
                });
            }

            // Attach user info to request object
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                username: decoded.username,
            };

            // Call the actual handler
            return handler(req, res);
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                code: 'AUTH_ERROR',
            });
        }
    };
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 * 
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with optional authentication
 */
export function optionalAuth(handler) {
    return async (req, res) => {
        try {
            const authHeader = req.headers.authorization || req.headers.Authorization;
            const token = extractTokenFromHeader(authHeader);

            if (token) {
                try {
                    const decoded = verifyToken(token);
                    if (decoded.type === 'access') {
                        req.user = {
                            userId: decoded.userId,
                            email: decoded.email,
                            username: decoded.username,
                        };
                    }
                } catch (error) {
                    // Token is invalid, but that's okay for optional auth
                    req.user = null;
                }
            } else {
                req.user = null;
            }

            return handler(req, res);
        } catch (error) {
            console.error('Optional auth middleware error:', error);
            return handler(req, res);
        }
    };
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, consider using Redis or Vercel Edge Config
 * 
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (handler) => {
        return async (req, res) => {
            // Get client identifier (IP address or user ID)
            const identifier = req.user?.userId ||
                req.headers['x-forwarded-for'] ||
                req.headers['x-real-ip'] ||
                'unknown';

            const now = Date.now();
            const userRequests = requests.get(identifier) || [];

            // Filter out old requests outside the time window
            const recentRequests = userRequests.filter(time => now - time < windowMs);

            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
                });
            }

            // Add current request timestamp
            recentRequests.push(now);
            requests.set(identifier, recentRequests);

            // Cleanup old entries periodically
            if (Math.random() < 0.01) { // 1% chance to cleanup
                for (const [key, times] of requests.entries()) {
                    const filtered = times.filter(time => now - time < windowMs);
                    if (filtered.length === 0) {
                        requests.delete(key);
                    } else {
                        requests.set(key, filtered);
                    }
                }
            }

            return handler(req, res);
        };
    };
}

/**
 * CORS middleware for API routes
 * 
 * @param {Object} options - CORS options
 * @returns {Function} Middleware function
 */
export function cors(options = {}) {
    const {
        origin = '*',
        methods = 'GET,POST,PUT,DELETE,OPTIONS',
        allowedHeaders = 'Content-Type,Authorization',
        credentials = true,
    } = options;

    return (handler) => {
        return async (req, res) => {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', methods);
            res.setHeader('Access-Control-Allow-Headers', allowedHeaders);

            if (credentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }

            // Handle OPTIONS preflight request
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }

            return handler(req, res);
        };
    };
}

/**
 * Compose multiple middleware functions
 * 
 * @param {...Function} middlewares - Middleware functions to compose
 * @returns {Function} Composed middleware
 */
export function compose(...middlewares) {
    return (handler) => {
        return middlewares.reduceRight(
            (wrappedHandler, middleware) => middleware(wrappedHandler),
            handler
        );
    };
}

/**
 * Example usage:
 * 
 * // Simple authentication
 * export default requireAuth(async (req, res) => {
 *   // req.user is available here
 *   res.json({ user: req.user });
 * });
 * 
 * // Authentication + Rate limiting
 * export default compose(
 *   requireAuth,
 *   rateLimit(100, 15 * 60 * 1000)
 * )(async (req, res) => {
 *   res.json({ user: req.user });
 * });
 * 
 * // CORS + Optional auth
 * export default compose(
 *   cors(),
 *   optionalAuth
 * )(async (req, res) => {
 *   res.json({ user: req.user || null });
 * });
 */

export default {
    requireAuth,
    optionalAuth,
    rateLimit,
    cors,
    compose,
};
