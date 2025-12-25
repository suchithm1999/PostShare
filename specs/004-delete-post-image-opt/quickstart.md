# Quickstart: Delete Post & Image Optimization

## Prerequisites

- Browser: Chrome/Firefox/Safari (Latest)
- Node.js > 16.x

## Setup

1. Install dependencies:
   ```bash
   npm install browser-image-compression
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

## Test Scenarios

### 1. Delete Post
1. Create a new post "To Delete".
2. Locate it in the Feed.
3. Click "Delete" icon/button.
4. Accept confirmation.
5. Verify post is gone.
6. Reload page. Verify post is still gone.

### 2. Image Compression
1. Find a large image (> 2MB).
2. Create a new post.
3. attach the large image.
4. Watch for loading indicator (optional).
5. Submit post.
6. Verify post appears with image.
7. (DevTools) Check `localStorage` size or log image size to verify it is < 300KB.
