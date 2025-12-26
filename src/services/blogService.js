import api from './apiClient';

/**
 * Blog Service
 * Handles all post-related API calls
 */
export const BlogService = {
    /**
     * Fetch all posts from API (personalized feed)
     * @returns {Promise<Array>}
     */
    async getAllPosts() {
        try {
            const response = await api.get('/posts');
            return response.posts || [];
        } catch (error) {
            console.error('Failed to load posts:', error);
            throw error;
        }
    },

    /**
     * Create a new post
     * @param {Object} dto - {content, image, visibility}
     * @returns {Promise<Object>}
     */
    async createPost(dto) {
        try {
            const response = await api.post('/posts/create', dto);
            return response;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw error;
        }
    },

    /**
     * Update an existing post
     * @param {string} id - Post ID
     * @param {Object} dto - {content, image, visibility}
     * @returns {Promise<Object>}
     */
    async updatePost(id, dto) {
        try {
            const response = await api.put(`/posts/${id}`, dto);
            return response;
        } catch (error) {
            console.error('Failed to update post:', error);
            throw error;
        }
    },

    /**
     * Delete a single post by ID
     * @param {string} id - Post ID
     * @returns {Promise<void>}
     */
    async deletePost(id) {
        try {
            await api.delete(`/posts/${id}`);
        } catch (error) {
            console.error('Failed to delete post:', error);
            throw error;
        }
    },

    /**
     * Get a single post by ID
     * @param {string} id - Post ID
     * @returns {Promise<Object>}
     */
    async getPost(id) {
        try {
            const response = await api.get(`/posts/${id}`);
            return response;
        } catch (error) {
            console.error('Failed to get post:', error);
            throw error;
        }
    },

    /**
     * Clear all posts (not implemented - would need backend endpoint)
     * Kept for backwards compatibility
     * @returns {Promise<void>}
     */
    async clearAllPosts() {
        console.warn('clearAllPosts is not implemented with API backend');
        throw new Error('Bulk delete not supported - delete posts individually');
    }
};
