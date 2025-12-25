# Quickstart: View & Edit Feed Posts

## Prerequisites

- Existing posts in the feed (for editing/viewing).

## Test Scenarios

### 1. View Image
1. Ensure a post has an image.
2. Click the image in the feed.
3. Verify it opens in a centralized, dark-overlay modal.
4. Click outside or on "Close".
5. Verify modal closes.

### 2. Edit Text
1. Click "Edit" icon on a post.
2. Verify Modal opens with text pre-filled.
3. Change text to "Edited Content".
4. Click Save.
5. Verify Modal closes and Feed updates immediately.

### 3. Replace Image
1. Edit a post with an image.
2. Click "Remove" (verify preview clears).
3. Upload new large image (>1MB to test compression).
4. Click Save.
5. Verify new image appears in feed.

### 4. Remove Image
1. Edit post with image.
2. Remove image transparently.
3. Save.
4. Verify post has no image in feed.
