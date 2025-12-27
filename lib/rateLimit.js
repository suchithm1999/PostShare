/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API endpoints
 * For production, consider using Redis or a dedicated rate limiting service
 */

// Store for tracking requests: { key: { count, resetTime } }
const requestStore = new Map();

// Cleanup interval to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestStore.entries()) {
        if (data.resetTime < now) {
            requestStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Rate limit middleware
 * @param {Object} options - Rate limit configuration
 * @param {number} options.maxRequests - Maximum requests allowed in the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {Function} options.keyGenerator - Function to generate unique key for user (default: uses user ID from token)
 * @returns {Function} Middleware function
 */
export function rateLimit(options = {}) {
    const {
        maxRequests = 50,
        windowMs = 60 * 60 * 1000, // 1 hour default
        keyGenerator = null,
    } = options;

    return (req, decoded) => {
        // Generate unique key for this user+endpoint
        const key = keyGenerator
            ? keyGenerator(req, decoded)
            : `${decoded.userId}:${req.url}`;

        const now = Date.now();
        const data = requestStore.get(key);

        // If no data or window has passed, start fresh
        if (!data || data.resetTime < now) {
            requestStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return { allowed: true, remaining: maxRequests - 1 };
        }

        // Increment count
        data.count++;

        // Check if limit exceeded
        if (data.count > maxRequests) {
            const retryAfter = Math.ceil((data.resetTime - now) / 1000); // seconds
            return {
                allowed: false,
                remaining: 0,
                retryAfter,
                resetTime: new Date(data.resetTime).toISOString(),
            };
        }

        return {
            allowed: true,
            remaining: maxRequests - data.count,
        };
    };
}

/**
 * Follow/Unfollow rate limiter
 * Limits to 50 follow/unfollow actions per hour per user
 */
export const followRateLimit = rateLimit({
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req, decoded) => `follow:${decoded.userId}`,
});

/**
 * Post creation rate limiter
 * Limits to 100 posts per hour per user
 */
export const postCreationRateLimit = rateLimit({
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req, decoded) => `post-create:${decoded.userId}`,
});

/**
 * Login attempt rate limiter
 * Limits to 10 login attempts per 15 minutes per IP
 */
export const loginRateLimit = rateLimit({
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
        // Try to get real IP behind proxies
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded
            ? forwarded.split(',')[0].trim()
            : req.connection?.remoteAddress || 'unknown';
        return `login:${ip}`;
    },
});

/**
 * Apply rate limiting to a handler
 * @param {Function} handler - Original handler function
 * @param {Function} rateLimiter - Rate limiter function
 * @param {Function} verifyToken - Token verification function
 * @returns {Function} Wrapped handler with rate limiting
 */
export function withRateLimit(handler, rateLimiter, verifyToken) {
    return async (req, res) => {
        // For endpoints that require authentication, extract decoded token
        if (verifyToken) {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // Let the main handler deal with auth errors
                return handler(req, res);
            }

            const token = authHeader.split(' ')[1];
            let decoded;
            try {
                decoded = verifyToken(token);
            } catch (error) {
                // Let the main handler deal with auth errors
                return handler(req, res);
            }

            // Check rate limit
            const result = rateLimiter(req, decoded);

            if (!result.allowed) {
                return res.status(429).json({
                    error: 'Too many requests. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: result.retryAfter,
                    resetTime: result.resetTime,
                    timestamp: new Date().toISOString(),
                });
            }

            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', rateLimiter.maxRequests || 50);
            res.setHeader('X-RateLimit-Remaining', result.remaining);
        } else {
            // For endpoints without auth, use IP-based limiting
            const result = rateLimiter(req);

            if (!result.allowed) {
                return res.status(429).json({
                    error: 'Too many requests. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: result.retryAfter,
                    resetTime: result.resetTime,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        // Continue to main handler
        return handler(req, res);
    };
}

export default {
    rateLimit,
    followRateLimit,
    postCreationRateLimit,
    loginRateLimit,
    withRateLimit,
};
