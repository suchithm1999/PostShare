/**
 * BlogService Contract
 * 
 * This file defines the interface for blog post data operations.
 * Implementations should work with either localStorage (legacy) or cloud storage (new).
 */

export interface BlogPost {
  _id?: string;              // MongoDB ObjectId (undefined for new posts)
  id?: string;               // Legacy localStorage UUID (for migration compatibility)
  title: string;             // Post title (max 200 chars)
  content: string;           // Post content (max 10,000 chars)
  imageUrl?: string | null;  // Cloudinary URL or base64 data URL (legacy)
  imagePublicId?: string | null; // Cloudinary public_id for deletion
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    bytes: number;
    uploadedAt: Date;
  } | null;
  author?: string;           // Author identifier (default: 'anonymous')
  createdAt: Date | string;  // Creation timestamp
  updatedAt?: Date | string; // Last update timestamp
  date?: string;             // Legacy field (mapped to createdAt for compatibility)
  image?: string;            // Legacy base64 image (migrated to imageUrl)
  syncStatus?: 'synced' | 'pending' | 'error'; // Sync status for offline support
  version?: number;          // Version for optimistic locking
  _localOnly?: boolean;      // True if created offline, not yet synced
}

export interface CreatePostInput {
  title: string;
  content: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  imageMetadata?: BlogPost['imageMetadata'];
  author?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  imageMetadata?: BlogPost['imageMetadata'];
  version: number;  // Required for optimistic locking
}

export interface BlogService {
  /**
   * Fetch all posts from storage, ordered by creation date (newest first)
   * @param limit - Maximum number of posts to return (default: 50)
   * @param offset - Number of posts to skip for pagination (default: 0)
   * @returns Array of blog posts
   */
  getAllPosts(limit?: number, offset?: number): Promise<BlogPost[]>;

  /**
   * Get a single post by ID
   * @param id - Post ID (MongoDB ObjectId or legacy UUID)
   * @returns Blog post or null if not found
   */
  getPostById(id: string): Promise<BlogPost | null>;

  /**
   * Create a new blog post
   * @param post - Post data (without ID)
   * @returns Created post with generated ID
   */
  createPost(post: CreatePostInput): Promise<BlogPost>;

  /**
   * Update an existing blog post
   * @param id - Post ID to update
   * @param updates - Fields to update
   * @returns Updated post
   * @throws Error if version conflict (optimistic locking)
   */
  updatePost(id: string, updates: UpdatePostInput): Promise<BlogPost>;

  /**
   * Delete a blog post and associated image
   * @param id - Post ID to delete
   * @returns true if deleted, false if not found
   */
  deletePost(id: string): Promise<boolean>;

  /**
   * Migrate posts from localStorage to cloud storage
   * @param localPosts - Array of posts from localStorage
   * @returns Migration result with success/failure counts
   */
  migratePosts(localPosts: BlogPost[]): Promise<{
    success: number;
    failed: number;
    posts: BlogPost[];
    errors: Array<{ index: number; error: string }>;
  }>;

  /**
   * Check if migration has been completed
   * @returns true if migration is complete
   */
  isMigrationComplete(): boolean;

  /**
   * Mark migration as complete
   */
  setMigrationComplete(): void;

  /**
   * Get pending operations from offline queue
   * @returns Array of pending operations
   */
  getPendingOperations(): Promise<Array<{
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: BlogPost;
  }>>;

  /**
   * Process pending operations from offline queue
   * @returns Number of operations successfully synced
   */
  syncPendingOperations(): Promise<number>;
}

export interface ImageService {
  /**
   * Upload image to cloud storage
   * @param file - Image file to upload
   * @returns Upload result with URL and metadata
   */
  uploadImage(file: File): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    createdAt: Date;
  }>;

  /**
   * Get signed upload parameters for direct browser upload
   * @returns Signed parameters for client-side upload
   */
  getSignedUploadParams(): Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
    uploadUrl: string;
  }>;

  /**
   * Delete image from cloud storage
   * @param publicId - Cloudinary public_id
   * @returns true if deleted successfully
   */
  deleteImage(publicId: string): Promise<boolean>;

  /**
   * Compress image before upload
   * @param file - Original image file
   * @returns Compressed image file
   */
  compressImage(file: File): Promise<File>;
}

/**
 * Legacy localStorage format (for migration)
 */
export interface LegacyPost {
  id: string;                // UUID
  title: string;
  content: string;
  date: string;              // ISO date string
  image?: string | null;     // Base64 data URL or null
}

/**
 * Migration utilities
 */
export interface MigrationService {
  /**
   * Read posts from localStorage
   * @returns Array of legacy posts
   */
  readLocalStoragePosts(): LegacyPost[];

  /**
   * Transform legacy post to new format
   * @param legacyPost - Post in old format
   * @returns Transformed post (image may need separate upload)
   */
  transformLegacyPost(legacyPost: LegacyPost): Promise<CreatePostInput>;

  /**
   * Upload base64 image to Cloudinary
   * @param base64Data - Base64 data URL
   * @returns Cloudinary upload result
   */
  uploadBase64Image(base64Data: string): Promise<{
    url: string;
    publicId: string;
    metadata: BlogPost['imageMetadata'];
  }>;

  /**
   * Clear localStorage after successful migration
   */
  clearLocalStorage(): void;

  /**
   * Check if localStorage has posts to migrate
   * @returns true if migration needed
   */
  needsMigration(): boolean;
}

/**
 * Offline queue storage
 */
export interface OfflineQueueService {
  /**
   * Add operation to queue
   */
  enqueue(operation: {
    operation: 'create' | 'update' | 'delete';
    collection: 'posts';
    data: BlogPost;
  }): Promise<void>;

  /**
   * Get all queued operations
   */
  getQueue(): Promise<Array<{
    id: string;
    operation: 'create' | 'update' | 'delete';
    collection: 'posts';
    data: BlogPost;
    createdAt: string;
    retries: number;
    lastError?: string;
  }>>;

  /**
   * Remove operation from queue
   */
  dequeue(id: string): Promise<void>;

  /**
   * Update retry count and error message
   */
  updateQueueItem(id: string, retries: number, error?: string): Promise<void>;

  /**
   * Clear entire queue
   */
  clearQueue(): Promise<void>;
}

/**
 * IndexedDB cache service
 */
export interface CacheService {
  /**
   * Cache posts in IndexedDB
   */
  cachePosts(posts: BlogPost[]): Promise<void>;

  /**
   * Get cached posts
   */
  getCachedPosts(limit?: number, offset?: number): Promise<BlogPost[]>;

  /**
   * Cache single post
   */
  cachePost(post: BlogPost): Promise<void>;

  /**
   * Remove post from cache
   */
  removeCachedPost(id: string): Promise<void>;

  /**
   * Clear all cached data
   */
  clearCache(): Promise<void>;

  /**
   * Get posts that are local-only (not synced)
   */
  getLocalOnlyPosts(): Promise<BlogPost[]>;
}
