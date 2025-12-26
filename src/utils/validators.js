/**
 * Input Validation Utilities
 * Provides reusable validation functions for user input across the application
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
        return { valid: false, error: 'Email cannot be empty' };
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    if (trimmedEmail.length > 254) {
        return { valid: false, error: 'Email address is too long' };
    }

    return { valid: true, error: null };
}

/**
 * Validate username format and constraints
 * @param {string} username - Username to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0) {
        return { valid: false, error: 'Username cannot be empty' };
    }

    if (trimmedUsername.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (trimmedUsername.length > 20) {
        return { valid: false, error: 'Username must be 20 characters or less' };
    }

    // Only allow alphanumeric, underscore, and hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;

    if (!usernameRegex.test(trimmedUsername)) {
        return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    // Prevent usernames that start or end with special characters
    if (trimmedUsername.startsWith('-') || trimmedUsername.startsWith('_') ||
        trimmedUsername.endsWith('-') || trimmedUsername.endsWith('_')) {
        return { valid: false, error: 'Username cannot start or end with special characters' };
    }

    return { valid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, error: string|null, strength: 'weak'|'medium'|'strong'|null}}
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required', strength: null };
    }

    if (password.length === 0) {
        return { valid: false, error: 'Password cannot be empty', strength: null };
    }

    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters', strength: null };
    }

    if (password.length > 128) {
        return { valid: false, error: 'Password is too long (max 128 characters)', strength: null };
    }

    // Check password strength
    let strength = 'weak';
    let strengthScore = 0;

    // Has lowercase
    if (/[a-z]/.test(password)) strengthScore++;

    // Has uppercase
    if (/[A-Z]/.test(password)) strengthScore++;

    // Has numbers
    if (/[0-9]/.test(password)) strengthScore++;

    // Has special characters
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

    // Length bonus
    if (password.length >= 12) strengthScore++;

    if (strengthScore >= 4) {
        strength = 'strong';
    } else if (strengthScore >= 2) {
        strength = 'medium';
    }

    // Require at least medium strength
    if (strengthScore < 2) {
        return {
            valid: false,
            error: 'Password is too weak. Use a mix of uppercase, lowercase, numbers, and special characters',
            strength: 'weak'
        };
    }

    return { valid: true, error: null, strength };
}

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateDisplayName(displayName) {
    if (!displayName || typeof displayName !== 'string') {
        return { valid: false, error: 'Display name is required' };
    }

    const trimmedName = displayName.trim();

    if (trimmedName.length === 0) {
        return { valid: false, error: 'Display name cannot be empty' };
    }

    if (trimmedName.length > 50) {
        return { valid: false, error: 'Display name must be 50 characters or less' };
    }

    return { valid: true, error: null };
}

/**
 * Validate bio/description text
 * @param {string} bio - Bio text to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateBio(bio) {
    if (!bio || typeof bio !== 'string') {
        // Bio is optional, so empty is valid
        return { valid: true, error: null };
    }

    if (bio.length > 500) {
        return { valid: false, error: 'Bio must be 500 characters or less' };
    }

    return { valid: true, error: null };
}

/**
 * Validate post content
 * @param {string} content - Post content to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validatePostContent(content) {
    if (!content || typeof content !== 'string') {
        return { valid: false, error: 'Content is required' };
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
        return { valid: false, error: 'Post content cannot be empty' };
    }

    if (trimmedContent.length > 5000) {
        return { valid: false, error: 'Post content must be 5000 characters or less' };
    }

    return { valid: true, error: null };
}

/**
 * Validate image file
 * @param {File} file - File object to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateImageFile(file, options = {}) {
    const {
        maxSizeMB = 5,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    } = options;

    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
        };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File is too large. Maximum size is ${maxSizeMB}MB`
        };
    }

    return { valid: true, error: null };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    try {
        new URL(url);
        return { valid: true, error: null };
    } catch (e) {
        return { valid: false, error: 'Please enter a valid URL' };
    }
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
