# Implementation Plan: Follow Request Approval System

**Branch**: `007-follow-requests` | **Date**: 2025-12-26 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/007-follow-requests/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add follow request approval system to replace instant follows with a request/accept flow. Users send follow requests that recipients can accept or decline. The system maintains pending request state, sends notifications for new requests and acceptances, uses silent declines to prevent awkwardness, and enforces privacy (no private posts visible until request is accepted). This enhances user privacy and control over their follower relationships.

## Technical Context

**Language/Version**: JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime)  
**Primary Dependencies**: React, React Router, MongoDB (database), Vercel (hosting), lucide-react (icons)  
**Storage**: MongoDB Atlas (users, posts, follows collections) + new follow_requests collection  
**Testing**: Jest + React Testing Library (existing), manual testing  
**Target Platform**: Web application (Vite dev server, Vercel production)  
**Project Type**: Web (frontend React SPA + backend API routes)  
**Performance Goals**: Request send/accept under 3 seconds, list views under 2 seconds  
**Constraints**: Free-tier MongoDB and Vercel limits, must work on existing schema  
**Scale/Scope**: Extends existing follow system, adds 3-4 new API endpoints, 2-3 new React components/pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Design Check**: No formal constitution file exists yet. Following existing project patterns:
- ✅ Simplicity: Builds on existing follow system without major refactoring
- ✅ Security: Uses existing JWT auth, follows same patterns as current follow endpoints
- ✅ Maintainability: Clear separation between requests and follows collections

**Post-Phase 1 Constitution Check**: 
- ✅ **Simplicity Confirmed**: Design uses minimal new entities (1 collection, 6 endpoints), no new frameworks
- ✅ **Security Maintained**: All endpoints use same auth pattern, proper authorization checks (requester vs recipient)
- ✅ **Performance Considered**: Appropriate indexes defined, polling strategy avoids overhead
- ✅ **Data Integrity**: Unique constraints prevent duplicates, validation rules clearly defined
- ✅ **Migration Safety**: No changes to existing collections, zero-downtime deployment possible

**Verdict**: ✅ Design ready for implementation (Phase 2: `/speckit.tasks`)

## Project Structure

### Documentation (this feature)

```text
specs/007-follow-requests/
├── plan.md              # This file
├── research.md          # Phase 0: Decision rationale for request model
├── data-model.md        # Phase 1: FollowRequest entity schema
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API endpoint contracts
│   └── api-follow-requests.yaml
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Web application structure (existing)
api/
├── users/
│   ├── [username]/
│   │   ├── follow.js           # Existing: instant follow (WILL MODIFY)
│   │   ├── followers.js        # Existing: list followers
│   │   └── following.js        # Existing: list following
│   └── me/
│       ├── follow-requests/    # NEW: Incoming requests
│       │   ├── index.js        # List incoming requests
│       │   └── [id].js         # Accept/decline specific request
│       └── sent-requests/      # NEW: Outgoing requests
│           ├── index.js        # List sent requests
│           └── [id].js         # Cancel specific request

src/
├── components/
│   ├── FollowButton.jsx        # Existing: will modify for request states
│   ├── FollowRequestCard.jsx   # NEW: Display request in list
│   └── NotificationBadge.jsx   # NEW: Show unread request count
├── pages/
│   ├── FollowRequests.jsx      # NEW: View/manage incoming requests
│   └── SentRequests.jsx        # NEW: View/manage outgoing requests
├── services/
│   └── followService.js        # NEW: API calls for follow requests
└── hooks/
    └── useFollowRequests.js    # NEW: React hook for request management

lib/
└── mongodb.js                   # Existing: will add follow_requests collection

tests/
├── api/
│   └── follow-requests.test.js # NEW: API endpoint tests
└── components/
    └── FollowButton.test.js     # Modify existing tests
```

**Structure Decision**: Extending existing web application structure. Follow request APIs go under `/api/users/me/` for incoming and `/api/users/[username]/` for actions. Frontend follows existing component/page patterns. Minimal changes to existing code - primarily extends FollowButton component and adds new request management pages.

## Complexity Tracking

No constitutional violations. This feature:
- Extends existing patterns (MongoDB collections, API routes, React components)
- Does not introduce new architecture or frameworks
- Maintains separation of concerns (data layer, API layer, UI layer)
- Follows existing authentication and authorization patterns

## Phase 0: Research & Decisions

### Key Research Areas

1. **Follow Request Data Model**
   - Decision on request states (pending only, or include accepted/declined history?)
   - Indexing strategy for efficient queries
   - Relationship to existing follows collection

2. **Notification Strategy**
   - In-app only vs. real-time updates
   - Pull (polling) vs. push (WebSockets) for new requests
   - Badge count calculation

3. **UI State Management**
   - Button states: Follow vs Request Sent vs Pending vs Following
   - Optimistic UI updates vs. server confirmation
   - Error handling and rollback

4. **Migration Path**
   - Handling existing instant-follow relationships
   - Backward compatibility during rollout

See [research.md](research.md) for detailed findings and rationale.

## Phase 1: Design Artifacts

### Data Model
See [data-model.md](data-model.md) for:
- FollowRequest entity schema
- Indexes for performance
- State transitions
- Relationship to Users and Follows collections

### API Contracts
See [contracts/api-follow-requests.yaml](contracts/api-follow-requests.yaml) for:
- POST /api/users/[username]/follow-request - Send request
- DELETE /api/users/me/sent-requests/[id] - Cancel sent request
- GET /api/users/me/follow-requests - List incoming requests
- POST /api/users/me/follow-requests/[id]/accept - Accept request
- POST /api/users/me/follow-requests/[id]/decline - Decline request
- GET /api/users/me/sent-requests - List sent requests

### Developer Quickstart
See [quickstart.md](quickstart.md) for:
- Local development setup
- Testing follow request workflows
- Database seed data for testing

## Phase 2: Task Breakdown

*Generated by `/speckit.tasks` command - not part of this plan*

Tasks will be organized by:
1. Backend: Database schema, API endpoints
2. Frontend: Components, pages, hooks
3. Integration: End-to-end flows
4. Testing: Unit, integration, manual test cases

## Dependencies

**Existing Systems:**
- User authentication (JWT tokens)
- Follow system (follows collection, API endpoints)
- MongoDB connection and collections
- React Router navigation
- Existing UI components (UserAvatar, etc.)

**New Requirements:**
- None - using existing tech stack

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing follow functionality | High | Thorough testing, feature flag for rollout |
| Performance degradation with request queries | Medium | Proper indexing on follow_requests collection |
| Confusion between follows and requests | Medium | Clear UI states, comprehensive user testing |
| Notification spam | Low | Silent declines, no auto-retry |

## Deployment Strategy

1. **Phase 1**: Add follow_requests collection, deploy API endpoints (feature-flagged)
2. **Phase 2**: Deploy frontend changes for request management
3. **Phase 3**: Update FollowButton to use new request flow
4. **Phase 4**: Monitor and iterate based on user feedback

No migration needed - existing follows remain unchanged.
