# Tasks: Followers and Following List

**Input**: Design documents from `/specs/001-followers-following-list/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: This feature does not require test generation (manual testing via browser as per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with the following structure:
- **Frontend components**: `src/components/`
- **Frontend pages**: `src/pages/`
- **Frontend hooks**: `src/hooks/`
- **Frontend services**: `src/services/`
- **Backend API**: `api/users/[username]/` (already exists - no changes)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational components and utilities that will be shared across all user stories

- [x] T001 [P] Create useInfiniteScroll custom hook in src/hooks/useInfiniteScroll.js for scroll pagination with Intersection Observer
- [x] T002 [P] Create EmptyState component in src/components/EmptyState.jsx for consistent empty state displays across lists
- [x] T003 [P] Create ListSearchBar component in src/components/ListSearchBar.jsx with debounced search input (300ms)
- [x] T004 [P] Create UserListItem component in src/components/UserListItem.jsx to display individual user in list with avatar, username, displayName, bio

**Checkpoint**: Shared components ready - user story implementation can now begin

---

## Phase 2: User Story 1 - View My Followers (Priority: P1) 🎯 MVP

**Goal**: Enable users to see who is following them by clicking on the followers count in their profile

**Independent Test**: Navigate to your profile page, click on "Followers" count → modal opens → see list of all users who follow you → click on a follower → navigate to their profile

### Implementation for User Story 1

- [x] T005 [P] [US1] Create useFollowers custom hook in src/hooks/useFollowers.js to fetch and manage followers list data with pagination
- [x] T006 [US1] Create FollowersList modal component in src/components/FollowersList.jsx to display followers with search, infinite scroll, and empty states
- [x] T007 [US1] Modify Profile page in src/pages/Profile.jsx to make followers count clickable and open FollowersList modal
- [x] T008 [US1] Add loading states (initial load spinner and "loading more" indicator) to FollowersList component
- [x] T009 [US1] Add error handling for API failures in FollowersList (show error message with "Try Again" button)
- [x] T010 [US1] Integrate search functionality from ListSearchBar into FollowersList to filter by username and displayName
- [x] T011 [US1] Integrate infinite scroll from useInfiniteScroll into FollowersList to load more followers on scroll
- [x] T012 [US1] Add empty state for zero followers using EmptyState component ("No followers yet" message)
- [x] T013 [US1] Add modal close functionality (backdrop click, close button, Escape key) to FollowersList
- [x] T014 [US1] Add responsive styling for mobile viewports (full screen on mobile, centered on desktop) to FollowersList

**Checkpoint**: At this point, users can view their own followers list with search and infinite scroll. User Story 1 is fully functional and testable independently.

---

## Phase 3: User Story 2 - View My Following List (Priority: P1) 🎯 MVP

**Goal**: Enable users to see who they are following by clicking on the following count in their profile

**Independent Test**: Navigate to your profile page, click on "Following" count → modal opens → see list of all users you follow → click on a user → navigate to their profile

### Implementation for User Story 2

- [x] T015 [P] [US2] Create useFollowing custom hook in src/hooks/useFollowing.js to fetch and manage following list data with pagination (mirror useFollowers logic)
- [x] T016 [US2] Create FollowingList modal component in src/components/FollowingList.jsx to display following with search, infinite scroll, and empty states
- [x] T017 [US2] Modify Profile page in src/pages/Profile.jsx to make following count clickable and open FollowingList modal
- [x] T018 [US2] Add loading states (initial load spinner and "loading more" indicator) to FollowingList component
- [x] T019 [US2] Add error handling for API failures in FollowingList (show error message with "Try Again" button)
- [x] T020 [US2] Integrate search functionality from ListSearchBar into FollowingList to filter by username and displayName
- [x] T021 [US2] Integrate infinite scroll from useInfiniteScroll into FollowingList to load more following on scroll
- [x] T022 [US2] Add empty state for zero following using EmptyState component ("Not following anyone" with suggestion to discover users)
- [x] T023 [US2] Add modal close functionality (backdrop click, close button, Escape key) to FollowingList
- [x] T024 [US2] Add responsive styling for mobile viewports (full screen on mobile, centered on desktop) to FollowingList

**Checkpoint**: At this point, users can view both their followers AND following lists independently. User Stories 1 and 2 are both fully functional.

---

## Phase 4: User Story 3 - View Other Users' Followers and Following (Priority: P2)

**Goal**: Enable users to view followers and following counts and lists on any public profile to discover new connections

**Independent Test**: Navigate to another user's profile page → click on their "Followers" count → see list of their followers → click on their "Following" count → see list of who they follow

### Implementation for User Story 3

- [x] T025 [US3] Update useFollowers hook in src/hooks/useFollowers.js to accept username parameter (allow viewing any user's followers, not just current user)
- [x] T026 [US3] Update useFollowing hook in src/hooks/useFollowing.js to accept username parameter (allow viewing any user's following, not just current user)
- [x] T027 [US3] Update FollowersList component in src/components/FollowersList.jsx to display correct username in modal title (e.g., "janedoe's followers" vs "Your followers")
- [x] T028 [US3] Update FollowingList component in src/components/FollowingList.jsx to display correct username in modal title (e.g., "janedoe's following" vs "Your following")
- [x] T029 [US3] Ensure Profile page in src/pages/Profile.jsx passes correct username to modal components when viewing other users' profiles
- [x] T030 [US3] Add permission handling for private profiles (if applicable - show appropriate message if user cannot view lists)

**Checkpoint**: At this point, users can view followers and following lists for ANY user profile. User Stories 1, 2, and 3 are all independently functional.

---

## Phase 5: User Story 4 - Quick Actions from Lists (Priority: P3)

**Goal**: Enable users to follow/unfollow directly from followers and following lists without navigating to individual profiles

**Independent Test**: Open followers list → see a follower you want to follow → click "Follow" button → button changes to "Following" without leaving the list. Open following list → click "Unfollow" → user is removed from list immediately.

### Implementation for User Story 4

- [x] T031 [P] [US4] Add followService helper functions in src/services/followService.js for getFollowersList and getFollowingList (if not already present, wrap API calls)
- [x] T032 [US4] Enhance UserListItem component in src/components/UserListItem.jsx to include FollowButton component (already exists in project) with proper props
- [x] T033 [US4] Add isFollowedByMe computed field to useFollowers hook in src/hooks/useFollowers.js by fetching current user's following IDs and checking membership
- [x] T034 [US4] Add isFollowingMe computed field to useFollowing hook in src/hooks/useFollowing.js by fetching current user's followers IDs and checking membership (for mutual follow indicators)
- [x] T035 [US4] Implement optimistic UI update in FollowersList component: when "Follow" clicked, immediately update button state before API call
- [x] T036 [US4] Implement optimistic UI update in FollowingList component: when "Unfollow" clicked, immediately remove user from list before API call
- [x] T037 [US4] Add rollback logic in FollowersList component: if follow API call fails, revert button state and show error toast
- [x] T038 [US4] Add rollback  logic in FollowingList component: if unfollow API call fails, re-add user to list and show error toast
- [x] T039 [US4] Update follower/following counts in parent Profile component when follow/unfollow actions succeed from within lists

**Checkpoint**: At this point, users can efficiently manage their network directly from lists without navigation. User Stories 1-4 are all independently functional.

---

## Phase 6: User Story 5 - Search and Filter Lists (Priority: P3)

**Goal**: Enable users with large networks to quickly find specific users by searching username or display name

**Independent Test**: Open followers list with 100+ users → type "john" in search bar → see only users matching "john" → clear search → see full list again

### Implementation for User Story 5

- [x] T040 [US5] Enhance ListSearchBar component in src/components/ListSearchBar.jsx to show result count when search is active (e.g., "5 results")
- [x] T041 [US5] Add debounce utility function (300ms) to ListSearchBar to prevent excessive re-renders during typing
- [x] T042 [US5] Implement client-side filtering logic in FollowersList component using useMemo to filter users by searchQuery on username and displayName fields
- [x] T043 [US5] Implement client-side filtering logic in FollowingList component using useMemo to filter users by searchQuery on username and displayName fields
- [x] T044 [US5] Add "No users found" empty state in FollowersList when search returns zero results (using EmptyState component)
- [x] T045 [US5] Add "No users found" empty state in FollowingList when search returns zero results (using EmptyState component)
- [x] T046 [US5] Add clear button (X icon) to ListSearchBar that appears when text is present to quickly clear search
- [x] T047 [US5] Ensure search bar has proper ARIA labels for accessibility (aria-label="Search users")

**Checkpoint**: At this point, all user stories are complete and independently functional. Users can efficiently search large networks.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final UX polish

- [x] T048 [P] Add React.memo optimization to UserListItem component in src/components/UserListItem.jsx to prevent unnecessary re-renders
- [x] T049 [P] Add loading="lazy" attribute to avatar images in UserAvatar component (if not already present) for performance
- [x] T050 [P] Add keyboard navigation support: Tab through list items, Enter to navigate to profile, Escape to close modals
- [ ] T051 [P] Add focus management: when modal opens, focus search bar; when closed, return focus to trigger button
- [x] T052 [P] Add ARIA attributes to FollowersList and FollowingList modals (role="dialog", aria-labelledby, aria-modal="true")
- [ ] T053 [P] Add ARIA live regions for follow/unfollow success/error announcements for screen readers
- [x] T054 [P] Test and fix dark mode styling for all new components (FollowersList, FollowingList, ListSearchBar, UserListItem, EmptyState)
- [x] T055 [P] Add smooth scroll behavior to infinite scroll (prevent janky scrolling on page load)
- [x] T056 Add mobile touch interactions: swipe gestures (optional enhancement), improved tap targets for small screens
- [x] T057 Test cross-browser compatibility (Chrome, Safari, Firefox, Edge) for all list components
- [x] T058 Validate responsive design on mobile (375px), tablet (768px), and desktop (1280px+) viewports
- [x] T059 Run manual testing checklist from quickstart.md for all 5 user stories
- [x] T060 [P] Add code comments and JSDoc documentation to custom hooks (useFollowers, useFollowing, useInfiniteScroll)
- [x] T061 Performance testing: verify lists with 1000+ users load smoothly with infinite scroll (no browser freeze)
- [x] T062 Accessibility audit: run Lighthouse accessibility checks (target >90 score)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Creates shared components (EmptyState, ListSearchBar, UserListItem, useInfiniteScroll)
- **User Story 1 (Phase 2)**: Depends on Setup completion
  - Followers list for own profile (MVP foundation)
- **User Story 2 (Phase 3)**: Depends on Setup completion
  - Following list for own profile (mirrors US1, can start in parallel with US1)
- **User Story 3 (Phase 4)**: Depends on US1 and US2 completion
  - Extends lists to work for other users' profiles
- **User Story 4 (Phase 5)**: Depends on US1, US2, US3 completion
  - Adds inline follow/unfollow actions to existing lists
- **User Story 5 (Phase 6)**: Depends on US1, US2 completion (can start after US1+US2, doesn't need US3 or US4)
  - Adds search/filter to existing lists
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Independence

- **User Story 1 (P1)**: ✅ Independent after Setup - can ship as MVP
- **User Story 2 (P1)**: ✅ Independent after Setup - mirrors US1, can develop in parallel
- **User Story 3 (P2)**: ⚠️ Depends on US1+US2 (extends existing components)
- **User Story 4 (P3)**: ⚠️ Depends on US1+US2+US3 (enhances existing lists)
- **User Story 5 (P3)**: ⚠️ Depends on US1+US2 (can skip US3/US4, adds search to lists)

### Within Each User Story

- Setup components before story implementation (Phase 1 first)
- Hooks before components (data fetching before UI)
- Core functionality before enhancements (basic list → infinite scroll → search)
- Modal display before interactions (show list → add actions)

### Parallel Opportunities

**Phase 1 (Setup)**: All 4 tasks can run in parallel (T001-T004 marked [P])

**Phase 2 (US1)**: 
- T005 (useFollowers hook) can run in parallel with setup tasks
- After T005+T006 complete, remaining tasks are sequential enhancements

**Phase 3 (US2)**: Can start in parallel with Phase 2 if team capacity allows
- T015 (useFollowing hook) mirrors T005 (useFollowers)
- T016 (FollowingList) mirrors T006 (FollowersList)
- Same pattern as US1, can reuse learnings

**Phase 5 (US4)**: T031-T034 marked [P] can run together (different files)

**Phase 7 (Polish)**: Most tasks marked [P] (different concerns, can parallelize)

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together (different files, no dependencies):
Task T001: "Create useInfiniteScroll hook in src/hooks/useInfiniteScroll.js"
Task T002: "Create EmptyState component in src/components/EmptyState.jsx"
Task T003: "Create ListSearchBar component in src/components/ListSearchBar.jsx"
Task T004: "Create UserListItem component in src/components/UserListItem.jsx"
```

## Parallel Example: User Story 1 + User Story 2

```bash
# With 2 developers, after Setup phase completes:
Developer A: Phase 2 (User Story 1 - Followers List)
Developer B: Phase 3 (User Story 2 - Following List)
# Both can work simultaneously, minimal conflicts (different components/hooks)
```

## Parallel Example: Polish Phase

```bash
# Launch independent polish tasks together:
Task T048: "Add React.memo to UserListItem"
Task T049: "Add loading='lazy' to images"
Task T050: "Add keyboard navigation"
Task T052: "Add ARIA attributes to modals"
Task T054: "Test dark mode styling"
Task T060: "Add JSDoc documentation"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. **Complete Phase 1: Setup** (T001-T004) - Shared components
2. **Complete Phase 2: User Story 1** (T005-T014) - View own followers
3. **Complete Phase 3: User Story 2** (T015-T024) - View own following
4. **STOP and VALIDATE**: Test both US1 and US2 independently
5. **Deploy/Demo MVP**: Users can view their own followers and following lists

**MVP Deliverable**: Users can click on follower/following counts on their profile and see paginated, searchable lists with infinite scroll. This delivers the core P1 value.

### Incremental Delivery

1. **Setup Complete** (Phase 1) → Shared components ready
2. **Add User Story 1** (Phase 2) → Test independently → Own followers viewable (partial MVP)
2. **Add User Story 2** (Phase 3) → Test independently → Own following viewable (full MVP)
4. **Add User Story 3** (Phase 4) → Test independently → View other users' lists (social discovery enabled)
5. **Add User Story 4** (Phase 5) → Test independently → Inline follow/unfollow (efficiency boost)
6. **Add User Story 5** (Phase 6) → Test independently → Search large lists (power user feature)
7. **Polish** (Phase 7) → Final UX and accessibility improvements → Production ready

Each story adds incremental value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **All developers**: Complete Phase 1 (Setup) together (4 small tasks, ~2-4 hours)
2. **Once Setup is done**:
   - Developer A: User Story 1 (Followers list)
   - Developer B: User Story 2 (Following list) - mirrors US1, can work in parallel
3. **Once US1+US2 done**:
   - Developer A: User Story 3 (Extend to other profiles)
   - Developer B: User Story 5 (Search/filter)
4. **Once US3 done**:
   - Developer A or B: User Story 4 (Inline actions)
5. **Once all stories done**:
   - Both developers: Polish tasks in parallel (many [P] tasks)

---

## Task Summary

**Total Tasks**: 62
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (User Story 1)**: 10 tasks
- **Phase 3 (User Story 2)**: 10 tasks (mirrors US1)
- **Phase 4 (User Story 3)**: 6 tasks (extends existing)
- **Phase 5 (User Story 4)**: 9 tasks (inline actions)
- **Phase 6 (User Story 5)**: 8 tasks (search/filter)
- **Phase 7 (Polish)**: 15 tasks (cross-cutting)

**Parallelizable Tasks**: 19 tasks marked [P]

**MVP Scope** (Recommended): Phase 1 + Phase 2 + Phase 3 = **24 tasks**
- Delivers core value: view own followers and following lists
- Estimated effort: 2-3 days for single developer, 1-2 days for 2 developers working in parallel

**Full Feature** (All 5 User Stories): Phase 1-6 = **47 tasks**
- Estimated effort: 5-7 days for single developer, 3-4 days for 2 developers

**Production Ready** (With Polish): All 62 tasks
- Estimated effort: 6-8 days for single developer, 4-5 days for 2 developers

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** (US1, US2, etc.) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests in this feature (manual browser testing as per plan.md)
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently before proceeding
- All backend APIs already exist - this is frontend-only work
- Dark mode compatibility required for all components (PostShare standard)
- Mobile-first responsive design required (320px+ viewport support)

---

## References

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api.md](./contracts/api.md)
- **Quickstart Guide**: [quickstart.md](./quickstart.md)
