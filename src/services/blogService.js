const STORAGE_KEY = 'static_blog_posts';

export const BlogService = {
    /**
     * Fetch all posts from LocalStorage.
     * @returns {Promise<import('../types').Post[]>}
     */
    async getAllPosts() {
        return new Promise((resolve) => {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                const posts = data ? JSON.parse(data) : [];
                // Sort by newer first
                posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                resolve(posts);
            } catch (error) {
                console.error("Failed to load posts", error);
                resolve([]);
            }
        });
    },

    /**
     * Create a new post.
     * @param {import('../types').CreatePostDTO} dto
     * @returns {Promise<import('../types').Post>}
     */
    async createPost(dto) {
        return new Promise((resolve, reject) => {
            try {
                const postsData = localStorage.getItem(STORAGE_KEY);
                const posts = postsData ? JSON.parse(postsData) : [];

                const newPost = {
                    id: crypto.randomUUID(),
                    content: dto.content,
                    image: dto.image || null,
                    createdAt: new Date().toISOString()
                };

                // Optimistic quota check (simple length check, not accurate byte size but safer)
                const currentSize = postsData ? postsData.length : 0;
                const newSize = JSON.stringify(newPost).length;

                // LocalStorage limit varies, but usually ~5MB (5 million chars approx)
                if (currentSize + newSize > 4500000) {
                    reject(new Error("Storage quota exceeded. Please remove some old posts."));
                    return;
                }

                const updatedPosts = [newPost, ...posts];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
                resolve(newPost);
            } catch (error) {
                if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                    reject(new Error("Storage quota exceeded"));
                } else {
                    reject(error);
                }
            }
        });
    },

    /**
     * Update an existing post.
     * @param {string} id
     * @param {{content: string, image?: string|null}} dto
     * @returns {Promise<import('../types').Post>}
     */
    async updatePost(id, dto) {
        return new Promise((resolve, reject) => {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                let posts = data ? JSON.parse(data) : [];

                const index = posts.findIndex(p => p.id === id);
                if (index === -1) {
                    reject(new Error("Post not found"));
                    return;
                }

                // Create updated post object
                const updatedPost = {
                    ...posts[index],
                    content: dto.content,
                    image: dto.image !== undefined ? dto.image : posts[index].image, // Update image if provided (null means delete)
                    updatedAt: new Date().toISOString()
                };

                // Optimistic quota check (approximate)
                const currentSize = data ? data.length : 0;
                // Calculate size difference (roughly)
                const sizeDiff = JSON.stringify(updatedPost).length - JSON.stringify(posts[index]).length;

                if (currentSize + sizeDiff > 4500000) {
                    reject(new Error("Storage quota exceeded. Please remove some old posts."));
                    return;
                }

                posts[index] = updatedPost;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
                resolve(updatedPost);
            } catch (error) {
                if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                    reject(new Error("Storage quota exceeded"));
                } else {
                    console.error("Failed to update post", error);
                    reject(error);
                }
            }
        });
    },

    /**
     * Delete a single post by ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    async deletePost(id) {
        return new Promise((resolve, reject) => {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                let posts = data ? JSON.parse(data) : [];
                posts = posts.filter(post => post.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
                resolve();
            } catch (error) {
                console.error("Failed to delete post", error);
                reject(error);
            }
        });
    },

    /**
     * Delete ALL posts from storage.
     * @returns {Promise<void>}
     */
    async clearAllPosts() {
        return new Promise((resolve, reject) => {
            try {
                localStorage.removeItem(STORAGE_KEY);
                resolve();
            } catch (error) {
                console.error("Failed to clear posts", error);
                reject(error);
            }
        });
    }
};
