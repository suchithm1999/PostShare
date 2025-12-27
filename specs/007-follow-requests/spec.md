# Feature Specification: Follow Request Approval System

**Feature Branch**: `007-follow-requests`  
**Created**: 2025-12-26  
**Status**: Draft  
**Input**: User description: "When user follows any user, currently we are following them directly there is no accept request thing, need to add that."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Follow Request (Priority: P1)

Users can send follow requests to other users instead of automatically following them. The follow relationship only becomes active after the recipient approves the request.

**Why this priority**: This is the core functionality - without it, the feature doesn't exist. Gives users control over who can follow them and see their content.

**Independent Test**: Can be fully tested by clicking "Follow" on a user's profile and verifying a pending request is created instead of an immediate follow relationship. Delivers value by empowering users with consent-based connections.

**Acceptance Scenarios**:

1. **Given** a logged-in user views another user's profile, **When** they click "Follow", **Then** a follow request is created in pending status
2. **Given** a user has sent a follow request, **When** they view the profile again, **Then** the button shows "Request Sent" and is disabled
3. **Given** a follow request is pending, **When** the user clicks "Cancel Request", **Then** the request is deleted and button changes back to "Follow"
4. **Given** a user sends a follow request, **When** the recipient hasn't responded, **Then** the sender cannot see the recipient's private posts

---

### User Story 2 - View and Manage Incoming Requests (Priority: P1)

Users can view all incoming follow requests and approve or decline them. This gives users control over their follower list and privacy.

**Why this priority**: Critical for the feature to be functional - requests are useless if recipients can't respond to them. Core privacy control.

**Independent Test**: Can be fully tested by receiving a follow request, navigating to notifications/requests page, and accepting or declining the request. Delivers immediate value by enabling privacy control.

**Acceptance Scenarios**:

1. **Given** a user receives a follow request, **When** they navigate to their notifications or requests page, **Then** they see the pending request with requester's profile info
2. **Given** a user views a pending request, **When** they click "Accept", **Then** the request is converted to an active follow relationship
3. **Given** a user views a pending request, **When** they click "Decline", **Then** the request is deleted
4. **Given** a user accepts a follow request, **When** the requester views their posts, **Then** the requester can now see private posts (if following grants that access)
5. **Given** a user has no pending requests, **When** they view the requests page, **Then** they see an empty state message

---

### User Story 3 - View Outgoing Requests (Priority: P2)

Users can view all their outgoing pending follow requests to track who they've requested to follow and manage those requests.

**Why this priority**: Important for user awareness but not critical for core functionality. Users can still send and receive requests without this view.

**Independent Test**: Can be fully tested by sending multiple follow requests, navigating to a "Sent Requests" page, and verifying all pending outgoing requests are listed. Delivers value through transparency.

**Acceptance Scenarios**:

1. **Given** a user has sent follow requests, **When** they navigate to their sent requests page, **Then** they see all pending outgoing requests
2. **Given** a user views their sent requests, **When** they click "Cancel" on a request, **Then** the request is removed from the list
3. **Given** a request is accepted by the recipient, **When** the sender views their sent requests page, **Then** that request is no longer in the pending list

---

### User Story 4 - Notifications for Request Actions (Priority: P2)

Users receive notifications when their follow requests are accepted, declined, or when they receive new follow requests.

**Why this priority**: Enhances user experience but feature is functional without real-time notifications. Can use in-app badges initially.

**Independent Test**: Can be tested independently by sending a request, having it accepted, and verifying a notification appears. Delivers value through timely awareness.

**Acceptance Scenarios**:

1. **Given** a user receives a follow request, **When** the request is created, **Then** they see a notification badge or alert
2. **Given** a user's follow request is accepted, **When** the acceptance happens, **Then** they receive a notification
3. **Given** a user's follow request is declined, **When** the decline happens, **Then** NO notification is sent to the requester (silent decline to prevent social awkwardness)

---

### Edge Cases

- What happens when a user sends a follow request to someone who has already sent them a request? (Both requests remain pending; either user can accept the other's request to establish the follow relationship in that direction)
- What happens when a user blocks someone who has a pending follow request from them? (Request should be automatically declined)
- What happens when a user tries to send multiple follow requests to the same person? (System should prevent duplicates)
- What happens to pending requests when a user deactivates their account? (Requests should be automatically canceled/deleted)
- What happens when a user views a profile with a pending outgoing request after the recipient deletes their account? (Should show appropriate message instead of "Request Sent")
- How many pending requests can a user have at once? (Should there be a limit to prevent spam?)

## Requirements *(mandatory)*

### Functional Requirements

#### Follow Request Management

- **FR-001**: System MUST allow users to send follow requests to other users
- **FR-002**: System MUST prevent duplicate follow requests from the same user to the same recipient
- **FR-003**: System MUST allow users to cancel their pending outgoing follow requests
- **FR-004**: System MUST store follow requests with status (pending, accepted, declined)
- **FR-005**: System MUST allow follow request recipients to accept or decline requests
- **FR-006**: System MUST convert accepted follow requests into active follow relationships
- **FR-007**: System MUST delete declined follow requests from the system
- **FR-008**: System MUST prevent users from sending follow requests to users who have blocked them

#### Privacy & Visibility

- **FR-009**: System MUST NOT grant access to private posts until a follow request is accepted
- **FR-010**: System MUST display "Request Sent" status on profiles where the current user has a pending outgoing request
- **FR-011**: System MUST display "Follow" button state for users with no active follow or pending request
- **FR-012**: System MUST show pending incoming requests to the recipient user

#### User Interface States

- **FR-013**: System MUST display different button states: "Follow", "Request Sent", "Accept/Decline", "Following"
- **FR-014**: System MUST allow users to view a list of all their incoming pending requests
- **FR-015**: System MUST allow users to view a list of all their outgoing pending requests
- **FR-016**: System MUST show request sender's profile information (username, display name, avatar) in request lists

#### Notifications

- **FR-017**: System MUST notify users when they receive new follow requests
- **FR-018**: System MUST notify users when their follow requests are accepted
- **FR-019**: System MUST NOT notify users when their follow requests are declined (silent decline to prevent social awkwardness)

#### Data Integrity

- **FR-020**: System MUST automatically cancel/delete pending requests when the requester deactivates their account
- **FR-021**: System MUST automatically decline/delete pending requests when the recipient deactivates their account
- **FR-022**: System MUST update follower and following counts only when requests are accepted, not when sent

### Key Entities

- **FollowRequest**: Represents a pending follow request with requester ID, recipient ID, status (pending/accepted/declined), creation timestamp, and action timestamp
- **Follow**: Existing entity representing active follow relationships (unchanged by this feature)
- **Notification**: Represents user notifications with type (follow_request, request_accepted), actor ID, target ID, read status, and creation timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can send a follow request in under 3 seconds (single click action)
- **SC-002**: Users can view all incoming requests within 2 seconds of navigating to requests page
- **SC-003**: 95% of follow requests are successfully delivered and displayed to recipients
- **SC-004**: Users can accept or decline a request in under 5 seconds (maximum 2 clicks)
- **SC-005**: System correctly enforces privacy rules - users cannot see private posts from accounts with pending requests
- **SC-006**: Button states accurately reflect relationship status 100% of the time
- **SC-007**: Zero duplicate requests are allowed - attempting to send a duplicate shows appropriate feedback
- **SC-008**: Notifications appear within 10 seconds of request actions (send, accept, decline)

### Assumptions

- Users want control over who follows them (privacy-focused social network)
- Follow requests apply to all users equally (no public/private account distinction yet)
- The existing follow system has proper database collections and API endpoints
- Request limits (if any) will be set based on spam prevention needs during implementation
- Email notifications for follow requests are out of scope (in-app only initially)

### Dependencies

- Existing Follow system (`follows` collection, follow/unfollow API endpoints)
- User authentication system (to identify requester and recipient)
- Notification system infrastructure (or needs to be built as part of this feature)
- Real-time update mechanism (WebSockets/polling) or page refresh for notification updates

### Out of Scope

- Bulk accept/decline of multiple requests
- Request expiration (auto-decline after X days)
- Follow request message/note from requester
- Email notifications for follow requests
- Account privacy settings (public vs private accounts requiring approval)
- Follow suggestion based on mutual connections
