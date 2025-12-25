# Tasks: Clear Feed Functionality

**Feature**: Clear Feed Functionality
**Status**: Planned
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Implementation Strategy

The implementation is compact and centered around a single user story. We will first extend the service layer to support the delete operation, then integrate the UI button into the Feed component with the required confirmation logic.

## Dependencies

1. **Phase 1 (Foundation)** MUST be completed before UI work.
2. **Phase 2 (US1)** depends on Phase 1.

## Phase 1: Foundation (Service Layer)

*Goal: Enable the deletion capability in the service layer.*

- [x] T001 Implement `clearAllPosts` method in `src/services/blogService.js` to modify LocalStorage.

## Phase 2: User Story 1 - Clear All Posts (P1)

*Goal: As a user, I want to satisfy my need to reset the application by clearing all posts from the feed.*
*Independent Test*: Populate feed -> click Clear Feed -> Confirm -> Verify feed is empty.

- [x] T002 [US1] Add a "Clear Feed" button to the header area in `src/pages/Feed.jsx`.
- [x] T003 [US1] Implement the `handleClearFeed` function in `src/pages/Feed.jsx` with `window.confirm` logic.
- [x] T004 [US1] Connect `handleClearFeed` to `BlogService.clearAllPosts` and update local state to reflect empty list.

## Phase 3: Polish

*Goal: Ensure better user experience.*

- [x] T005 [P] Disable or hide the "Clear Feed" button when `posts.length` is 0 in `src/pages/Feed.jsx`.
