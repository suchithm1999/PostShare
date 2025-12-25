# Tasks: Delete Post & Image Optimization

**Feature**: Delete Post & Image Optimization
**Status**: Planned
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Implementation Strategy

The implementation is broken down into three phases. Phase 1 sets up the necessary dependencies for image compression. Phase 2 implements the delete functionality (US1), which is simpler and independent. Phase 3 implements the more complex image compression logic (US2) and integrates it into the post creation flow.

## Dependencies

1. **Phase 1 (Setup)** MUST be completed first to provide the required libraries.
2. **Phase 2 (US1)** depends on Phase 1 but is independent of Phase 3.
3. **Phase 3 (US2)** depends on Phase 1.

## Phase 1: Setup

*Goal: Install dependencies and prepare utilities.*

- [x] T001 Install `browser-image-compression` dependency `npm install browser-image-compression` in `package.json`.
- [x] T002 Create image utility `src/utils/imageHelpers.js` with a placeholder `compressImage` function to verify structure.

## Phase 2: User Story 1 - Delete Single Post (P1)

*Goal: Allow users to delete their posts with confirmation.*
*Independent Test*: Create a post, click delete, confirm, verify removal.

- [x] T003 [US1] Add `deletePost(id)` method to `BlogService` in `src/services/blogService.js` that filters `static_blog_posts`.
- [x] T004 [US1] Add "Delete" button (using an icon, e.g., Heroicon Trash) to `PostCard.jsx` in `src/components/PostCard.jsx` with absolute positioning or footer layout.
- [x] T005 [P] [US1] Implement `handleDelete` in `PostCard.jsx` (or pass down from `Feed.jsx`) using `window.confirm`.
- [x] T006 [US1] Update `Feed.jsx` in `src/pages/Feed.jsx` to handle the delete action state update (remove item from `posts` state without reload).

## Phase 3: User Story 2 - Image Optimization & Resizing (P1)

*Goal: Automatically compress large images to <300KB.*
*Independent Test*: Upload 2MB image, verify it attaches successfully and is <300KB in LocalStorage.

- [x] T007 [US2] Implement actual compression logic in `src/utils/imageHelpers.js` using `browser-image-compression` (maxSizeMB: 0.29, maxWidthOrHeight: 1024).
- [x] T008 [US2] Update `PostForm.jsx` in `src/components/PostForm.jsx` to intercept file selection in `handleImageChange`.
- [x] T009 [P] [US2] Add loading state ("Compressing...") to `PostForm.jsx` while image is being processed.
- [x] T010 [US2] Handle compression errors in `PostForm.jsx` (show alert if file remains > 300KB or processing fails).
- [x] T011 [US2] Verify `fileHelpers.js` usage to ensure base64 conversion happens *after* compression on the new File object.

## Phase 4: Polish

*Goal: Ensure UI consistency and error handling.*

- [x] T012 [P] Verify Delete button styling matches `003-ui-revamp-theme` (e.g., hover effects, text-red-500).
- [x] T013 [P] Ensure error messages for failed compression are styled using the existing alert component styles.
