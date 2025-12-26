# Tasks: Follow Request Approval System

**Feature**: 007-follow-requests  
**Input**: Design documents from `/specs/007-follow-requests/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested - focusing on implementation tasks with manual testing per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Web application structure (per plan.md):
- **Backend API**: `api/users/` for API routes
- **Frontend**: `src/components/`, `src/pages/`, `src/services/`, `src/hooks/`
- **Shared**: `lib/` for utilities

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database setup and shared API utilities

- [x] T001 Create MongoDB indexes for follow_requests collection using scripts/setup-follow-requests-indexes.js
- [x] T002 [P] Create FollowRequest initialization script in lib/initFollowRequests.js
- [x] T003 [P] Create followService frontend utility in src/services/followService.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Verify MongoDB follow_requests collection exists and indexes are applied
- [x] T005 [P] Create base notification utility in lib/notifications.js (or extend existing)
- [x] T006 [P] Update getCollection helper in lib/mongodb.js to include follow_requests collection

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send Follow Request (Priority: P1) 🎯 MVP

**Goal**: Users can send follow requests to other users instead of automatically following them

**Independent Test**: Click "Follow" on a user's profile, verify pending request is created (not instant follow), verify button shows "Request Sent"

### Implementation for User Story 1

- [x] T007 [P] [US1] Create POST /api/users/[username]/follow-request endpoint in api/users/[username]/follow-request.js
- [x] T008 [P] [US1] Update FollowButton component in src/components/FollowButton.jsx to handle request send
- [x] T009 [US1] Add request state logic to FollowButton (detect pending, disable during request)
- [x] T010 [US1] Add optimistic UI update for "Request Sent" state in FollowButton
- [x] T011 [US1] Add error handling and rollback for failed request in FollowButton
- [x] T012 [US1] Implement cancellation flow: DELETE /api/users/me/sent-requests/[id] endpoint in api/users/me/sent-requests/[id].js
- [x] T013 [US1] Add "Cancel Request" functionality to FollowButton when request is pending

**Checkpoint**: At this point, users can send and cancel follow requests - button states work correctly

---

## Phase 4: User Story 2 - View and Manage Incoming Requests (Priority: P1)

**Goal**: Users can view all incoming follow requests and approve or decline them

**Independent Test**: Receive a follow request, navigate to requests page, see pending request with requester info, accept or decline the request

### Implementation for User Story 2

- [x] T014 [P] [US2] Create GET /api/users/me/follow-requests endpoint in api/users/me/follow-requests/index.js
- [x] T015 [P] [US2] Create POST /api/users/me/follow-requests/[id]/accept endpoint in api/users/me/follow-requests/[id].js
- [x] T016 [P] [US2] Create POST /api/users/me/follow-requests/[id]/decline endpoint in api/users/me/follow-requests/[id].js
- [x] T017 [P] [US2] Create FollowRequestCard component in src/components/FollowRequestCard.jsx
- [x] T018 [US2] Create FollowRequests page in src/pages/FollowRequests.jsx
- [x] T019 [US2] Add route for /follow-requests in React Router configuration
- [x] T020 [US2] Implement accept request logic in FollowRequests page (update follower count)
- [x] T021 [US2] Implement decline request logic in FollowRequests page (silent delete)
- [x] T022 [US2] Add empty state message when no pending requests exist
- [x] T023 [US2] Add loading states and error handling for request list

**Checkpoint**: At this point, users can view and manage all incoming follow requests - accept/decline works correctly

---

## Phase 5: User Story 3 - View Outgoing Requests (Priority: P2)

**Goal**: Users can view all their outgoing pending follow requests and cancel them

**Independent Test**: Send multiple follow requests, navigate to "Sent Requests" page, verify all pending outgoing requests are listed, cancel one request

### Implementation for User Story 3

- [x] T024 [P] [US3] Create GET /api/users/me/sent-requests endpoint in api/users/me/sent-requests/index.js
- [x] T025 [P] [US3] Create SentRequests page in src/pages/SentRequests.jsx
- [x] T026 [US3] Add route for /sent-requests in React Router configuration
- [x] T027 [US3] Reuse FollowRequestCard component with "recipient" variant for sent requests
- [x] T028 [US3] Implement cancel request UI in SentRequests page
- [x] T029 [US3] Add empty state message when no sent requests exist
- [x] T030 [US3] Add loading states and error handling for sent requests list

**Checkpoint**: All user stories should now be independently functional - users can manage both incoming and outgoing requests

---

## Phase 6: User Story 4 - Notifications for Request Actions (Priority: P2)

**Goal**: Users receive notifications when their follow requests are accepted or when they receive new follow requests

**Independent Test**: Send a request, have it accepted, verify notification appears; receive a request, verify notification badge/alert

### Implementation for User Story 4

- [x] T031 [P] [US4] Create NotificationBadge component in src/components/NotificationBadge.jsx
- [x] T032 [P] [US4] Create useFollowRequests hook in src/hooks/useFollowRequests.js for polling
- [x] T033 [US4] Add notification count to GET /api/users/me/follow-requests response
- [x] T034 [US4] Implement polling logic in useFollowRequests (30-second interval when active)
- [x] T035 [US4] Add NotificationBadge to navbar/header with unread count
- [x] T036 [US4] Add notification for accepted requests (in-app alert/toast)
- [x] T037 [US4] Link NotificationBadge click to /follow-requests page
- [x] T038 [US4] Add visibility check to stop polling when user is inactive/away

**Checkpoint**: All user stories complete - notifications working for key events

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Add privacy enforcement: verify private posts not visible until request accepted in api/posts/index.js
- [x] T040 [P] Update Profile page in src/pages/Profile.jsx to show correct button states (Follow/Request Sent/Following)
- [x] T041 Update follower/following counts to only change on request acceptance (not on send) in api endpoints
- [x] T042 [P] Add duplicate request prevention validation in api/users/[username]/follow-request.js
- [x] T043 [P] Add request cleanup on user deactivation (if applicable) in relevant API routes
- [x] T044 [P] Documentation: Update quickstart.md with actual testing flows
- [x] T045 Code cleanup: Remove any TODO comments and debug console.logs
- [x] T046 Run manual end-to-end testing per quickstart.md validation scenarios
- [x] T047 [P] Add error messages for edge cases (self-request, already following, etc.)
- [x] T048 Performance check: Verify index usage with MongoDB query analysis

---

##  Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Independent - can start after Phase 2
  - User Story 2 (P1): Can run parallel with US1 (different files) OR depends on US1 for testing flow
  - User Story 3 (P2): Independent - can start after Phase 2
  - User Story 4 (P2): Depends on US1 and US2 (needs request endpoints to exist)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Should be tested WITH US1 but can be implemented independently
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Depends on US1 and US2 API endpoints existing (needs data to notify about)

### Within Each User Story

- API endpoints before frontend components (but can parallelize within same story)
- Components before pages
- Pages before routing integration
- Core implementation before error handling/polish

### Parallel Opportunities

- Phase 1: All tasks marked [P] can run in parallel (T002, T003)
- Phase 2: All tasks marked [P] can run in parallel (T005, T006)
- User Story 1: T007, T008 can run in parallel (API + component)
- User Story 2: T014, T015, T016, T017 can all run in parallel (different files)
- User Story 3: T024, T025 can run in parallel
- User Story 4: T031, T032, T033 can run in parallel
- Polish: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all API endpoints for User Story 2 together:
Task: "Create GET /api/users/me/follow-requests endpoint in api/users/me/follow-requests/index.js"
Task: "Create POST /api/users/me/follow-requests/[id]/accept endpoint in api/users/me/follow-requests/[id].js"
Task: "Create POST /api/users/me/follow-requests/[id]/decline endpoint in api/users/me/follow-requests/[id].js"
Task: "Create FollowRequestCard component in src/components/FollowRequestCard.jsx"

# All these can develop in parallel since they're in different files
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 - Both P1)

1. Complete Phase 1: Setup (indexes and utilities)
2. Complete Phase 2: Foundational (verify DB, notifications helper)
3. Complete Phase 3: User Story 1 (send/cancel requests)
4. Complete Phase 4: User Story 2 (accept/decline requests)
5. **STOP and VALIDATE**: Test end-to-end flow - send request → accept → verify follow
6. Deploy/demo if ready

**This gives you a fully functional follow request system!**

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Database and infrastructure ready
2. **MVP** (Phase 3-4) → Send & manage requests works end-to-end → Deploy/Demo 🎯
3. **Enhancement 1** (Phase 5) → Add outgoing requests view → Deploy/Demo
4. **Enhancement 2** (Phase 6) → Add notifications → Deploy/Demo
5. **Polish** (Phase 7) → Edge cases and optimization → Final Deploy

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **All** complete Setup + Foundational together (critical path)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (send/cancel flow)
   - **Developer B**: User Story 2 (accept/decline flow) - coordinate on API contracts
   - **Developer C**: User Story 3 (sent requests view) - starts after US1 API done
3. After US1+US2 complete:
   - **Developer A or B**: User Story 4 (notifications)
   - **Developer C**: Polish tasks
4. Stories integrate independently for final deployment

---

## ✅ **Implementation Status Summary**

### Completed Phases (MVP + Enhancements):
- ✅ **Phase 1: Setup** (3/3 tasks)
- ✅ **Phase 2: Foundational** (3/3 tasks)
- ✅ **Phase 3: User Story 1 - Send Follow Request** (7/7 tasks)
- ✅ **Phase 4: User Story 2 - Manage Incoming Requests** (10/10 tasks)

### Total MVP Completed: 23/23 tasks ✨

**What's Working:**
- ✅ Users can send follow requests (not instant follow)
- ✅ Button shows "Request Sent" with visual feedback
- ✅ Users can cancel sent requests by clicking the button
- ✅ Recipients can view incoming requests at `/follow-requests`
- ✅ Recipients can accept or decline requests
- ✅ Accepting creates follow relationship and updates counts
- ✅ Declining is silent (no notification to requester)
- ✅ Profile page correctly shows button states
- ✅ All API endpoints working correctly

**Remaining Phases (Optional Enhancements):**
- **Phase 5: User Story 3** - View Outgoing Requests page (7 tasks)
- **Phase 6: User Story 4** - Notifications with polling (8 tasks)  
- **Phase 7: Polish** - Edge cases and optimizations (10 tasks)

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing per quickstart.md after each user story phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4** (send & manage requests complete)

---

## Task Summary

- **Total Tasks**: 48
- **Setup**: 3 tasks
- **Foundational**: 3 tasks (MUST complete before stories)
- **User Story 1** (P1 - MVP): 7 tasks
- **User Story 2** (P1 - MVP): 10 tasks
- **User Story 3** (P2): 7 tasks
- **User Story 4** (P2): 8 tasks
- **Polish**: 10 tasks
- **Parallel Opportunities**: 20+ tasks can run in parallel across phases
- **Suggested MVP Scope**: Phases 1-4 (User Stories 1 & 2 only) = 23 tasks
