---
description: "Task list for responsive mobile navigation and layout polish"
---

# Tasks: Mobile & Tablet UX Polish

**Feature**: 008-mobile-ux-polish
**Input**: Design documents from `/specs/008-mobile-ux-polish/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not explicitly requested - validation will be manual UI testing per quickstart.md guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/components/`, `src/pages/`, `src/layouts/`
- **Styles**: `src/index.css` (Tailwind)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create BottomNav component structure in src/components/BottomNav.jsx
- [x] T002 [P] Create Layout wrapper component in src/layouts/MainLayout.jsx to handle responsive padding
- [x] T003 [P] Add safe-area-inset variables configuration in src/index.css (if needed, or verify Tailwind support)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Wrap App routes with MainLayout in src/App.jsx to enable global responsive spacing
- [x] T005 [P] Add global CSS rule for input font-size (16px) on mobile in src/index.css (User Story 4 prep)

**Checkpoint**: Foundation ready - responsive layout structure in place

---

## Phase 3: User Story 1 - Mobile Navigation System (Priority: P1) 🎯 MVP

**Goal**: Implement a persistent bottom navigation bar for mobile (<640px) and simplified top navbar

**Independent Test**: Resize browser <640px. Verify BottomNav appears with correct links and TopNav simplifies. Verify navigation works.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement BottomNav component logic and styling in src/components/BottomNav.jsx
- [x] T007 [P] [US1] Update Navbar component to hide primary links on mobile in src/components/Navbar.jsx
- [x] T008 [P] [US1] Update Navbar component to keep Logo/Theme toggle visible on all screens in src/components/Navbar.jsx
- [x] T009 [US1] Integrate BottomNav into MainLayout (visible only on mobile) in src/layouts/MainLayout.jsx
- [x] T010 [US1] Add "active" state styling to BottomNav links (Feed, Search, Create, etc.) in src/components/BottomNav.jsx

**Checkpoint**: Mobile navigation is fully functional.

---

## Phase 4: User Story 2 - Responsive Feed & Content Layout (Priority: P1)

**Goal**: Ensure post feed and content areas use available screen real estate efficiently on mobile and tablet

**Independent Test**: View Feed on mobile (full width) and tablet based on specs.

### Implementation for User Story 2

- [x] T011 [P] [US2] Update Feed page container to remove excess padding on mobile in src/pages/Feed.jsx
- [x] T012 [P] [US2] Update Post component to be full-width on mobile in src/components/Post.jsx
- [x] T013 [P] [US2] update Post component max-width constraints for tablet/desktop in src/components/Post.jsx
- [x] T014 [US2] Verify and fix image scaling in Post component for mobile widths in src/components/Post.jsx
- [x] T015 [US2] Update CreatePost page form layout for mobile responsiveness in src/pages/CreatePost.jsx

**Checkpoint**: Content looks good on all device sizes.

---

## Phase 5: User Story 3 - Adaptive Profile Design (Priority: P2)

**Goal**: Stack profile information vertically on mobile for better readability

**Independent Test**: check Profile page on mobile - stats should stack, buttons full width.

### Implementation for User Story 3
 
- [x] T016 [P] [US3] Refactor Profile header to stack avatar/info on mobile in src/pages/Profile.jsx
- [x] T017 [P] [US3] Make Follow/Edit buttons full-width or large tap targets on mobile in src/components/FollowButton.jsx (and Profile.jsx)
- [x] T018 [US3] Update Profile post grid to use 1 or 2 columns on mobile (vs 3 on desktop) in src/pages/Profile.jsx
- [x] T019 [P] [US3] Ensure UserAvatar size adapts correctly in Profile header in src/components/UserAvatar.jsx

**Checkpoint**: Profile page is mobile-optimized.

---

## Phase 6: User Story 4 - Touch Targets & Inputs (Priority: P2)

**Goal**: Ensure usability on touch devices (no zoom on inputs, easy tapping)

**Independent Test**: Tap targets are easy to hit; inputs don't zoom the page on iOS.

### Implementation for User Story 4

- [x] T020 [P] [US4] Audit and update icon button sizes (Heart, etc.) to min 44px touch target in src/components/Navbar.jsx
- [x] T021 [P] [US4] Audit and update icon button sizes to min 44px touch target in src/components/Post.jsx
- [x] T022 [P] [US4] Verify text inputs use text-base (16px) class in src/pages/Login.jsx
- [x] T023 [P] [US4] Verify text inputs use text-base (16px) class in src/pages/Signup.jsx
- [x] T024 [P] [US4] Verify text inputs use text-base (16px) class in src/pages/CreatePost.jsx

**Checkpoint**: App feels native and usable on touch devices.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T025 [P] Verify safe area padding on iPhone (simulate via DevTools)
- [x] T026 Update quickstart.md with final testing screenshots/notes (if applicable)
- [x] T027 Code cleanup: Remove any debug styles or temporary logs
- [x] T028 Performance check: Verify no layout shifts on navigation switch

---

## Dependencies & Execution Order

1. **Phase 1-2 (Setup/Foundation)**: MUST start first.
2. **Phase 3 (Mobile Nav)**: Can start after foundation. P1 priority.
3. **Phase 4 (Feed Layout)**: Can run in parallel with Phase 3 (different files). P1 priority.
4. **Phase 5 (Profile)**: Can run in parallel with 3 & 4. P2 priority.
5. **Phase 6 (Touch Targets)**: Can run in parallel with others. P2 priority.

### Implementation Strategy

1. **MVP**: Complete Phase 1, 2, and 3 (Mobile Nav). This gives the biggest UX win.
2. **Increment 1**: Complete Phase 4 (Feed).
3. **Increment 2**: Complete Phase 5 & 6 (Profile/Touch).
