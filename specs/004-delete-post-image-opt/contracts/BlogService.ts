export interface BlogServiceContract {
    /**
     * Deletes a post by its ID.
     * @param id The unique identifier of the post to delete.
     * @throws Error if post not found (optional, or just silent success)
     */
    deletePost(id: string): Promise<void>;

    /**
     * Compresses an image file to ensure it is below the specified size limit (300KB).
     * @param imageFile The raw File object from input.
     * @returns A Promise resolving to the compressed File object.
     * @throws Error if compression fails or cannot meet size limit.
     */
    compressImage(imageFile: File): Promise<File>;
}
