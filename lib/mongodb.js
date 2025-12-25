import { MongoClient } from 'mongodb';

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

// MongoDB client options for serverless optimization
const options = {
    maxPoolSize: 10, // Connection pool size
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip IPv6
};

let client;
let clientPromise;

// In production (Vercel), cache the MongoDB client in global scope
// to reuse connections across serverless function invocations
if (process.env.NODE_ENV === 'production') {
    // In production, use a global variable to preserve the client across hot reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In development, create a new client for each request
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}

/**
 * Get MongoDB client instance
 * @returns {Promise<MongoClient>} MongoDB client
 */
export async function getMongoClient() {
    return clientPromise;
}

/**
 * Get MongoDB database instance
 * @param {string} [dbName='postshare'] - Database name
 * @returns {Promise<import('mongodb').Db>} MongoDB database
 */
export async function getDatabase(dbName = 'postshare') {
    const client = await clientPromise;
    return client.db(dbName);
}

/**
 * Get a specific collection
 * @param {string} collectionName - Collection name
 * @returns {Promise<import('mongodb').Collection>} MongoDB collection
 */
export async function getCollection(collectionName) {
    const db = await getDatabase();
    return db.collection(collectionName);
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
    try {
        const client = await clientPromise;
        await client.db('admin').command({ ping: 1 });
        console.log('✅ MongoDB connection successful');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
}

/**
 * Close database connection (for cleanup)
 * Note: In serverless, connections are typically kept alive
 */
export async function closeConnection() {
    try {
        const client = await clientPromise;
        await client.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
}

export default clientPromise;
