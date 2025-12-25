import { Post, CreatePostDTO } from '../../001-static-blog-page/contracts/BlogService';

/**
 * Extended Service contract for Blog operations.
 * Adds clearAllPosts functionality.
 */
export interface IBlogServiceExpanded {
    // ... previous methods ...

    /**
     * Delete ALL posts from storage.
     * @returns Promise resolving when cleared.
     */
    clearAllPosts(): Promise<void>;
}
