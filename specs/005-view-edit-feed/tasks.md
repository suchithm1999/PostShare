# Tasks: View & Edit Feed Posts

**Feature**: View & Edit Feed Posts
**Status**: Planned
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Implementation Strategy

We will start by implementing the backend service method for updating posts (Phase 1). Then, we will implement the edit functionality (US2) as it is the higher priority and complexity, involving refactoring `PostForm` and creating the `EditPostModal`. Finally, we will implement the simpler image viewer (US1).

## Dependencies

1. **Phase 1 (Setup)** MUST be completed first.
2. **Phase 2 (US2)** updates `Feed` and `PostCard` logic, so it should be done before or in parallel with viewing if resources allowed, but we will sequence it first due to priority.
3. **Phase 3 (US1)** is independent UI logic.

## Phase 1: Setup & Service Layer

*Goal: Enable post updates in the "backend" service.*

- [x] T001 [US2] update `BlogService` in `src/services/blogService.js` to include `updatePost(id, dto)` method that merges content and image.

## Phase 2: User Story 2 - Edit Post Content (P1)

*Goal: Enable full editing of post content and images.*
*Independent Test*: Edit a post, change text, replace image, save, and verify updates persist.

- [x] T002 [US2] Refactor `PostForm.jsx` in `src/components/PostForm.jsx` to accept `initialValues` and `onCancel` props.
- [x] T003 [US2] Create `EditPostModal.jsx` in `src/components/EditPostModal.jsx` that wraps `PostForm` in a modal overlay.
- [x] T004 [US2] Update `PostCard.jsx` in `src/components/PostCard.jsx` to verify Edit button is present (similar to Delete).
- [x] T005 [P] [US2] Update `Feed.jsx` in `src/pages/Feed.jsx` to manage `editingPost` state (open modal with post data).
- [x] T006 [US2] Implement `handleUpdatePost` in `Feed.jsx` to call `BlogService.updatePost` and update local state `posts`.

## Phase 3: User Story 1 - View Post Image (P2)

*Goal: Allow users to view images in a large modal.*
*Independent Test*: Click image, verify modal opens, close modal.

- [x] T007 [US1] Create `ImageModal.jsx` in `src/components/ImageModal.jsx` as a simple centered overlay for displaying `imageUrl`.
- [x] T008 [P] [US1] Update `Feed.jsx` in `src/pages/Feed.jsx` to manage `viewingImage` state.
- [x] T009 [US1] Update `PostCard.jsx` in `src/components/PostCard.jsx` to make the image clickable and trigger `onViewImage` callback.

## Phase 4: Polish

*Goal: Ensure smooth transitions and UI consistency.*

- [x] T010 [P] Verify z-index layering of Modals (Edit vs View) to ensure they sit above everything.
- [x] T011 [P] Ensure "Edited" indicator (optional) or just verified timestamp updates if applicable, though spec didn't strictly mandate visible "edited" label found in `updatedAt` field proposal.
