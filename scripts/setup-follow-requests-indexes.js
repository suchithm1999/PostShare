import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI environment variable is not defined');
    process.exit(1);
}

/**
 * Create indexes for follow_requests collection
 * Based on specs/007-follow-requests/data-model.md
 */
async function createIndexes() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('postshare');
        const collection = db.collection('follow_requests');

        console.log('\n📝 Creating indexes for follow_requests collection...\n');

        // 1. Primary query pattern: Get all incoming requests for a user
        await collection.createIndex(
            { recipientId: 1, createdAt: -1 },
            { name: 'recipient_requests_idx' }
        );
        console.log('✓ Created index: recipient_requests_idx (recipientId, createdAt)');

        // 2. Secondary query pattern: Get all outgoing requests from a user
        await collection.createIndex(
            { requesterId: 1, createdAt: -1 },
            { name: 'requester_requests_idx' }
        );
        console.log('✓ Created index: requester_requests_idx (requesterId, createdAt)');

        // 3. Uniqueness constraint: Prevent duplicate requests
        await collection.createIndex(
            { requesterId: 1, recipientId: 1 },
            { unique: true, name: 'unique_request_idx' }
        );
        console.log('✓ Created index: unique_request_idx (requesterId, recipientId) [UNIQUE]');

        console.log('\n✅ All indexes created successfully!');

        // Display created indexes
        const indexes = await collection.indexes();
        console.log('\n📊 Current indexes on follow_requests:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB connection closed');
    }
}

/**
 * Drop all indexes (for cleanup/reset)
 */
async function dropIndexes() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('postshare');
        const collection = db.collection('follow_requests');

        console.log('\n🗑️  Dropping indexes for follow_requests collection...\n');

        // Drop all indexes except _id
        await collection.dropIndexes();
        console.log('✓ All indexes dropped');

    } catch (error) {
        console.error('❌ Error dropping indexes:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB connection closed');
    }
}

// CLI interface
const command = process.argv[2];

if (command === 'create') {
    createIndexes();
} else if (command === 'drop') {
    dropIndexes();
} else {
    console.log('Usage: node scripts/setup-follow-requests-indexes.js [create|drop]');
    console.log('');
    console.log('Commands:');
    console.log('  create  - Create all required indexes for follow_requests collection');
    console.log('  drop    - Drop all indexes (except _id) from follow_requests collection');
    process.exit(1);
}
