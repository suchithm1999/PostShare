import 'dotenv/config';
import { getCollection } from './mongodb.js';

/**
 * Initialize follows collection with proper indexes
 * Run this once to set up the database schema
 */
async function initFollowsCollection() {
    try {
        const followsCollection = await getCollection('follows');

        // Create compound index for efficient queries
        await followsCollection.createIndex(
            { followerId: 1, followingId: 1 },
            { unique: true } // Prevent duplicate follows
        );

        // Index for finding followers of a user
        await followsCollection.createIndex({ followingId: 1, createdAt: -1 });

        // Index for finding who a user is following
        await followsCollection.createIndex({ followerId: 1, createdAt: -1 });

        console.log('✅ Follows collection indexes created successfully');
    } catch (error) {
        console.error('Error creating follows indexes:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initFollowsCollection()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}

export { initFollowsCollection };
