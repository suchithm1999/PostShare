# Tasks: UI Revamp & Theming

**Feature**: UI Revamp & Theming
**Status**: Planned
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Implementation Strategy

The implementation is divided into three key phases. Phase 1 focuses on installing and configuring Tailwind CSS as the core styling engine. Phase 2 rewrites the existing component styles to use Tailwind utility classes, introducing the vibrant aesthetic and animations. Phase 3 implements the dark mode toggle logic and persistence.

## Dependencies

1. **Phase 1 (Setup)** MUST be completed before any styling changes.
2. **Phase 2 (US1)** depends on Phase 1.
3. **Phase 3 (US2)** depends on Phase 1 (for configuration) but can be parallel to Phase 2, though sequential is safer for testing.

## Phase 1: Setup (Tailwind Integration)

*Goal: Replace custom CSS with Tailwind infrastructure.*

- [x] T001 Install Tailwind CSS, PostCSS, and Autoprefixer dependencies `npm install -D tailwindcss @tailwindcss/vite` in `package.json`.
- [x] T002 Initialize Tailwind configuration in `tailwind.config.js` with content paths and `darkMode: 'class'`.
- [x] T003 Configure PostCSS in `postcss.config.js`.
- [x] T004 Replace contents of `src/index.css` with Tailwind directives `@tailwind base; @tailwind components; @tailwind utilities;`.

## Phase 2: User Story 1 - Modern & Vibrant Interface (P1)

*Goal: As a user, I want to interact with a visually stunning, colorful, and animated interface.*
*Independent Test*: Load app, check for rounded corners, vibrant primary colors, and fade-in animations.

- [x] T005 [US1] Apply Tailwind global styles to `body` in `src/index.css` (fonts, background colors).
- [x] T006 [US1] Revamp `Navbar.jsx` using Tailwind utilities (`flex`, `shadow`, `bg-white`, `dark:bg-slate-900`) in `src/components/Navbar.jsx`.
- [x] T007 [P] [US1] Revamp `PostForm.jsx` inputs and buttons with modern styles (`rounded-xl`, `ring`, `transition-all`) in `src/components/PostForm.jsx`.
- [x] T008 [P] [US1] Revamp `PostCard.jsx` with card layout, shadow, and hover scales (`hover:scale-[1.02]`) in `src/components/PostCard.jsx`.
- [x] T009 [US1] Update `Feed.jsx` layout container and typography for a polished look in `src/pages/Feed.jsx`.

## Phase 3: User Story 2 - Day/Night Theme Toggle (P2)

*Goal: As a user, I want to toggle between Day (Light) and Night (Dark) themes.*
*Independent Test*: Click toggle, verify immediate background/text inversion and persistence on reload.

- [x] T010 [US2] Create simple `useTheme` logic (or inline effect) to manage `dark` class on `html` element and `localStorage` in `src/App.jsx`.
- [x] T011 [US2] Add Theme Toggle button (Sun/Moon icon) to `Navbar.jsx` in `src/components/Navbar.jsx`.
- [x] T012 [P] [US2] Verify and adjust dark mode colors (`dark:text-white`, `dark:bg-slate-800`) across all components (`PostCard`, `PostForm`, `Feed`).

## Phase 4: Polish

*Goal: Consistency and cleanup.*

- [x] T013 [P] Clean up any unused legacy CSS files or inline styles if remaining.
- [x] T014 [US1] Polish "Create New Post" heading with vibrant gradient and scale by updating `src/pages/CreatePost.jsx`.
- [x] T015 [US1] Ensure `tailwind.config.js` and `src/index.css` implement clarified standard Light Mode contrast (gray-100 background, shadow-xl cards).
