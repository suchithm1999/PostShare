import 'dotenv/config';
import { getCollection } from './mongodb.js';

/**
 * Initialize posts collection with proper indexes and schema
 * Run this once to set up the database schema for posts
 */
async function initPostsCollection() {
    try {
        const postsCollection = await getCollection('posts');

        // Create indexes for efficient queries

        // Index for getting user's posts sorted by date
        await postsCollection.createIndex(
            { authorId: 1, createdAt: -1 }
        );

        // Index for filtering posts by author and visibility
        await postsCollection.createIndex(
            { authorId: 1, visibility: 1, createdAt: -1 }
        );

        // Index for feed queries (get posts from followed users)
        await postsCollection.createIndex(
            { createdAt: -1 }
        );

        // Text index for search functionality (future)
        await postsCollection.createIndex(
            { content: 'text' }
        );

        console.log('✅ Posts collection indexes created successfully');
    } catch (error) {
        console.error('Error creating posts indexes:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initPostsCollection()
        .then(() => {
            console.log('Posts database initialization complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Posts database initialization failed:', error);
            process.exit(1);
        });
}

export { initPostsCollection };
