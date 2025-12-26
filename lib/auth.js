import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '30m'; // Access token expires in 30 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expires in 7 days

if (!JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET environment variable not configured');
}

// bcrypt Configuration
const SALT_ROUNDS = 10; // Cost factor for password hashing

/**
 * ======================================
 * JWT TOKEN UTILITIES (T012)
 * ======================================
 */

/**
 * Generate access token (short-lived)
 * @param {Object} payload - Token payload (userId, email, username)
 * @returns {string} JWT access token
 */
export function generateAccessToken(payload) {
    const { userId, email, username, displayName } = payload;

    return jwt.sign(
        {
            userId,
            email,
            username,
            displayName,
            type: 'access',
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRY,
            issuer: 'postshare',
            audience: 'postshare-api',
        }
    );
}

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - Token payload (userId)
 * @returns{string} JWT refresh token
 */
export function generateRefreshToken(payload) {
    const { userId } = payload;

    return jwt.sign(
        {
            userId,
            type: 'refresh',
        },
        JWT_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
            issuer: 'postshare',
            audience: 'postshare-api',
        }
    );
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object with _id, email, username
 * @returns {Object} {accessToken, refreshToken, expiresIn}
 */
export function generateTokens(user) {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName || user.username, // Include display name
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    return {
        accessToken,
        refreshToken,
        expiresIn: 1800, // 30 minutes in seconds
    };
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'postshare',
            audience: 'postshare-api',
        });
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
 */
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * ======================================
 * PASSWORD HASHING UTILITIES (T013)
 * ======================================
 */

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Compare plain password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        throw new Error('Failed to compare passwords');
    }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} {valid: boolean, errors: string[]}
 */
export function validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * ======================================
 * EXPORTS
 * ======================================
 */

export default {
    // JWT functions
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyToken,
    decodeToken,
    extractTokenFromHeader,

    // Password functions
    hashPassword,
    comparePassword,
    validatePasswordStrength,
};
