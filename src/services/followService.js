import api from './apiClient';

/**
 * Follow Service
 * Handles all follow request related API calls
 * Based on specs/007-follow-requests/contracts/api-follow-requests.yaml
 */

/**
 * Send a follow request to a user
 * @param {string} username - Username to send request to
 * @returns {Promise<Object>} Response with requestId
 */
export async function sendFollowRequest(username) {
    const response = await api.post(`/users/${username}/follow-request`);
    return response;
}

/**
 * Get all incoming follow requests for current user
 * @returns {Promise<Object>} { count, requests }
 */
export async function getIncomingRequests() {
    const response = await api.get('/users/me/follow-requests');
    return response;
}

/**
 * Get all outgoing follow requests sent by current user
 * @returns {Promise<Object>} { count, requests }
 */
export async function getSentRequests() {
    const response = await api.get('/users/me/sent-requests');
    return response;
}

/**
 * Accept a follow request
 * @param {string} requestId - ID of the request to accept
 * @returns {Promise<Object>} Response with followId
 */
export async function acceptFollowRequest(requestId) {
    const response = await api.post(`/users/me/follow-requests/${requestId}/accept`);
    return response;
}

/**
 * Decline a follow request (silent - no notification)
 * @param {string} requestId - ID of the request to decline
 * @returns {Promise<Object>} Success response
 */
export async function declineFollowRequest(requestId) {
    const response = await api.post(`/users/me/follow-requests/${requestId}/decline`);
    return response;
}

/**
 * Cancel a sent follow request
 * @param {string} requestId - ID of the request to cancel
 * @returns {Promise<Object>} Success response
 */
export async function cancelSentRequest(requestId) {
    const response = await api.delete(`/users/me/sent-requests/${requestId}`);
    return response;
}

/**
 * Check if there's a pending request between current user and target user
 * @param {string} username - Username to check
 * @returns {Promise<Object|null>} Request object if exists, null otherwise
 */
export async function checkPendingRequest(username) {
    try {
        // This would require a new endpoint or we fetch from sent-requests
        const { requests } = await getSentRequests();
        return requests.find(req => req.recipient.username === username) || null;
    } catch (error) {
        console.error('Error checking pending request:', error);
        return null;
    }
}

const followService = {
    sendFollowRequest,
    getIncomingRequests,
    getSentRequests,
    acceptFollowRequest,
    declineFollowRequest,
    cancelSentRequest,
    checkPendingRequest,
};

export default followService;
