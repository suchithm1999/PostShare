import { getDatabase } from './mongodb.js';

/**
 * Initialize MongoDB collections and indexes
 * Run this once to set up the database schema
 */
export async function initializeDatabase() {
    try {
        const db = await getDatabase();

        console.log('🔧 Initializing MongoDB collections and indexes...');

        // Create users collection with validation schema
        try {
            await db.createCollection('users', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['email', 'username', 'displayName', 'createdAt'],
                        properties: {
                            email: {
                                bsonType: 'string',
                                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                                description: 'Valid email address required',
                            },
                            passwordHash: {
                                bsonType: ['string', 'null'],
                                description: 'bcrypt hash or null for OAuth-only accounts',
                            },
                            username: {
                                bsonType: 'string',
                                pattern: '^[a-zA-Z0-9_-]{3,20}$',
                                description: 'Username: 3-20 chars, alphanumeric, underscore, hyphen',
                            },
                            displayName: {
                                bsonType: 'string',
                                minLength: 1,
                                maxLength: 50,
                                description: 'Display name: 1-50 characters',
                            },
                            role: {
                                enum: ['user', 'admin'],
                                description: 'User role',
                            },
                        },
                    },
                },
            });
            console.log('✅ Created users collection');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Users collection already exists');
            } else {
                throw error;
            }
        }

        // Create indexes for users collection
        const usersCollection = db.collection('users');

        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Created unique index on email');

        await usersCollection.createIndex({ username: 1 }, { unique: true });
        console.log('✅ Created unique index on username');

        await usersCollection.createIndex({ 'oauthProviders.google': 1 }, { sparse: true });
        console.log('✅ Created index on Google OAuth ID');

        await usersCollection.createIndex({ 'oauthProviders.github': 1 }, { sparse: true });
        console.log('✅ Created index on GitHub OAuth ID');

        // Create posts collection (for future use)
        try {
            await db.createCollection('posts');
            console.log('✅ Created posts collection');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Posts collection already exists');
            } else {
                throw error;
            }
        }

        // Create indexes for posts collection
        const postsCollection = db.collection('posts');

        await postsCollection.createIndex({ createdAt: -1 });
        console.log('✅ Created index on posts.createdAt');

        await postsCollection.createIndex({ authorId: 1, createdAt: -1 });
        console.log('✅ Created index on posts.authorId + createdAt');

        await postsCollection.createIndex({ authorId: 1, visibility: 1, createdAt: -1 });
        console.log('✅ Created compound index for feed queries');

        // Create follows collection (for future use)
        try {
            await db.createCollection('follows');
            console.log('✅ Created follows collection');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Follows collection already exists');
            } else {
                throw error;
            }
        }

        // Create indexes for follows collection
        const followsCollection = db.collection('follows');

        await followsCollection.createIndex(
            { followerId: 1, followingId: 1 },
            { unique: true }
        );
        console.log('✅ Created unique compound index on follows');

        await followsCollection.createIndex({ followerId: 1, createdAt: -1 });
        console.log('✅ Created index on follows.followerId');

        await followsCollection.createIndex({ followingId: 1, createdAt: -1 });
        console.log('✅ Created index on follows.followingId');

        console.log('🎉 Database initialization complete!');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

/**
 * Drop all collections (for testing/reset)
 * WARNING: This deletes all data!
 */
export async function dropAllCollections() {
    try {
        const db = await getDatabase();
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`🗑️  Dropped collection: ${collection.name}`);
        }

        console.log('✅ All collections dropped');
        return true;
    } catch (error) {
        console.error('❌ Failed to drop collections:', error);
        throw error;
    }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase()
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default { initializeDatabase, dropAllCollections };
