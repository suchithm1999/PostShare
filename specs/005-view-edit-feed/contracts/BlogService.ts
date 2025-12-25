export interface BlogServiceContract {
    /**
     * Updates an existing post.
     * @param id The ID of the post to update.
     * @param dto The partial post object containing fields to update (content, image).
     * @returns Promise resolving to the updated Post object.
     */
    updatePost(id: string, dto: { content: string; image?: string | null }): Promise<Post>;
}
