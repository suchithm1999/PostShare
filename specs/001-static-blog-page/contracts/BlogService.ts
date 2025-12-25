export interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
}

export interface CreatePostDTO {
    title: string;
    content: string;
    imageUrl?: string;
}

/**
 * Service contract for Blog operations.
 * Implemented via LocalStorage in this iteration.
 */
export interface IBlogService {
    /**
     * Fetch all posts, sorted by newest first.
     */
    getAllPosts(): Promise<Post[]>;

    /**
     * Create a new post.
     */
    createPost(dto: CreatePostDTO): Promise<Post>;

    /**
     * Delete a post by ID.
     */
    deletePost(id: string): Promise<void>;

    /**
     * Like a post.
     */
    likePost(id: string): Promise<Post>;
}
