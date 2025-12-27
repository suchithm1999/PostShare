import { getCollection } from './mongodb.js';
import { ObjectId } from 'mongodb';

/**
 * Initialize follow_requests collection with seed data for testing
 * Based on specs/007-follow-requests/data-model.md
 */
export async function initFollowRequests() {
    try {
        const collection = await getCollection('follow_requests');

        // Check if collection already has data
        const count = await collection.countDocuments();
        if (count > 0) {
            console.log(`✓ follow_requests collection already has ${count} documents`);
            return;
        }

        console.log('📝 Initializing follow_requests collection...');

        // No default seed data - collection starts empty
        // Follow requests will be created by users through the UI

        console.log('✅ follow_requests collection initialized (empty)');

    } catch (error) {
        console.error('❌ Error initializing follow_requests:', error);
        throw error;
    }
}

/**
 * Utility: Create a follow request (for testing)
 * @param {ObjectId} requesterId - User sending the request
 * @param {ObjectId} recipientId - User receiving the request
 * @returns {Promise<Object>} Created follow request document
 */
export async function createFollowRequest(requesterId, recipientId) {
    const collection = await getCollection('follow_requests');

    // Validate: cannot request to follow yourself
    if (requesterId.toString() === recipientId.toString()) {
        throw new Error('Cannot send follow request to yourself');
    }

    // Check for duplicate request
    const existing = await collection.findOne({
        requesterId,
        recipientId
    });

    if (existing) {
        throw new Error('Follow request already exists');
    }

    // Create request
    const request = {
        requesterId,
        recipientId,
        status: 'pending',
        createdAt: new Date()
    };

    const result = await collection.insertOne(request);
    return { ...request, _id: result.insertedId };
}

/**
 * Utility: Get incoming requests for a user
 * @param {ObjectId} userId - User ID to get requests for
 * @returns {Promise<Array>} List of incoming requests
 */
export async function getIncomingRequests(userId) {
    const collection = await getCollection('follow_requests');

    return await collection
        .find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .toArray();
}

/**
 * Utility: Get outgoing requests for a user
 * @param {ObjectId} userId - User ID to get requests from
 * @returns {Promise<Array>} List of outgoing requests
 */
export async function getOutgoingRequests(userId) {
    const collection = await getCollection('follow_requests');

    return await collection
        .find({ requesterId: userId })
        .sort({ createdAt: -1 })
        .toArray();
}

/**
 * Utility: Delete a follow request
 * @param {ObjectId} requestId - Request ID to delete
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteFollowRequest(requestId) {
    const collection = await getCollection('follow_requests');

    const result = await collection.deleteOne({ _id: requestId });
    return result.deletedCount > 0;
}

/**
 * Utility: Clear all follow requests (for testing)
 */
export async function clearAllFollowRequests() {
    const collection = await getCollection('follow_requests');
    const result = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} follow requests`);
    return result.deletedCount;
}
