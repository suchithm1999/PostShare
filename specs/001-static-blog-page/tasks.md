# Tasks: Static Blog Page

**Feature**: Static Blog Page
**Status**: Planned
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Implementation Strategy

We will build the application in distinct phases. Phase 1 sets up the project structure and dependencies. Phase 2 establishes the data layer using LocalStorage, which is a foundational dependency for the user stories. Phases 3 and 4 implement the user stories in priority order (Create Post, then View Feed). We conclude with a Polish phase for navigation and edge cases.

## Dependencies

1. **Phase 1 (Setup)** MUST be completed first.
2. **Phase 2 (Foundation)** MUST be completed before Phase 3 or 4.
3. **Phase 3 (US1)** and **Phase 4 (US2)** are loosely coupled but US2 depends on US1 to have data to display for end-to-end testing. However, they can be implemented in parallel if mock data is used.

## Phase 1: Project Setup

*Goal: Initialize the codebase and infrastructure.*

- [x] T001 Initialize React project with Vite (if needed) and install dependencies (`react-router-dom`, `lucide-react`, `date-fns`) in `package.json`.
- [x] T002 Create project directory structure (`components`, `pages`, `services`, `types`, `utils`) in `src/`.
- [x] T003 Setup global styles and simplified CSS variables in `src/index.css`.
- [x] T004 Setup `react-router-dom` `BrowserRouter` and main layout shell in `src/App.jsx`.

## Phase 2: Foundation (Data Layer)

*Goal: Establish the storage mechanism required by all features.*

- [x] T005 Create type definitions (JSDoc/Types) for `Post` and `CreatePostDTO` in `src/types.js`.
- [x] T006 Implement `BlogService` using LocalStorage (matching the contract) in `src/services/blogService.js`.

## Phase 3: User Story 1 - Create Blog Post (P1)

*Goal: As a user, I want to be able to create a new blog post with text and an image.*
*Independent Test*: Navigate to /create, fill form, submit, verify data appears in LocalStorage.

- [x] T007 [P] [US1] Implement utility function for File-to-Base64 conversion in `src/utils/fileHelpers.js`.
- [x] T008 [US1] Create `PostForm` component with text inputs and image file picker in `src/components/PostForm.jsx`.
- [x] T009 [US1] Implement `CreatePost` page logic connecting `PostForm` to `BlogService.createPost` in `src/pages/CreatePost.jsx`.
- [x] T010 [US1] Add route for `/create` in `src/App.jsx`.

## Phase 4: User Story 2 - View Blog Feed (P1)

*Goal: As a viewer, I want to see a list of all blog posts.*
*Independent Test*: Navigate to /, verify list of posts (or empty state) is displayed.

- [x] T011 [P] [US2] Create `PostCard` component to display a single post (image + text + date) in `src/components/PostCard.jsx`.
- [x] T012 [P] [US2] Create `Feed` page to fetch posts via `BlogService.getAllPosts` and render list in `src/pages/Feed.jsx`.
- [x] T013 [US2] Add route for `/` (Home) in `src/App.jsx`.

## Phase 5: Polish

*Goal: Improve navigation and handling of edge cases.*

- [x] T014 Create `Navbar` component with links to Home/Create in `src/components/Navbar.jsx`.
- [x] T015 Handle empty states in `Feed.jsx` and loading states in `CreatePost.jsx`.
- [x] T016 [P] Add error handling for LocalStorage quota exceeded in `src/services/blogService.js`.
