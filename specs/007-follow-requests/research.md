# Research: Follow Request Approval System

**Feature**: 007-follow-requests  
**Date**: 2025-12-26  
**Purpose**: Document technical decisions and research findings

## 1. Follow Request Data Model

### Decision
Store follow requests in a separate `follow_requests` collection with minimal fields:
- `_id`: ObjectId (auto-generated)
- `requesterId`: ObjectId (who sent the request)
- `recipientId`: ObjectId (who received the request)
- `status`: enum ['pending'] (only pending requests stored)
- `createdAt`: Date (when request was sent)

### Rationale
- **Separate collection**: Keeps request state independent from active follows, easier to query and manage
- **Pending only**: Accepted requests convert to follows collection, declined requests are deleted (no historical tracking for v1)
- **Minimal fields**: YAGNI principle - no message, no priority, no expiration for initial version

### Alternatives Considered
1. **Single collection with status field**: Would mix active follows with pending requests, complicates queries
2. **Store accepted/declined history**: Adds complexity, unclear user value, can add later if needed
3. **Embedded in users collection**: Denormalization issues, harder to query cross-user relationships

### Indexing Strategy
```javascript
// Compound index for recipient queries (most common)
{ recipientId: 1, createdAt: -1 }

// Compound index for requester queries
{ requesterId: 1, createdAt: -1 }

// Unique compound index to prevent duplicates
{ requesterId: 1, recipientId: 1 } (unique: true)
```

---

## 2. Notification Strategy

### Decision
**In-app polling** with badge counts, no real-time WebSockets for v1

### Implementation
- Frontend polls `/api/users/me/follow-requests` endpoint every 30 seconds when user is active
- Returns `{ count: N, requests: [...] }` with unread count
- Badge appears in navbar/notifications icon
- Clicking navigates to full requests page

### Rationale
- Simpler implementation (no WebSocket infrastructure needed)
- Sufficient UX for follow requests (not time-critical like messaging)
- Reduces server load compared to persistent connections
- Can upgrade to WebSockets/SSE later if needed

### Alternatives Considered
1. **WebSockets/Server-Sent Events**: More complex, overkill for follow requests, adds infrastructure
2. **Push notifications**: Out of scope (requires service worker, notification permissions)
3. **No polling, manual refresh**: Poor UX, users won't discover new requests

---

## 3. UI State Management

### Decision
**Three primary FollowButton states** with optimistic UI updates:

| State | Display | User Action | API Call |
|-------|---------|-------------|----------|
| Not following, no request | "Follow" button | Click → Send request | POST /api/users/{username}/follow-request |
| Request sent (pending) | "Request Sent" (disabled) | Click → Cancel | DELETE /api/users/me/sent-requests/{id} |
| Following | "Following" button | Click → Unfollow | DELETE /api/users/{username}/follow |

**Optimistic Updates**:
- Immediately change button state on click
- Rollback if API fails (show error toast)
- Re-fetch on page load to ensure consistency

### Rationale
- Clear visual feedback for all relationship states
- Optimistic updates improve perceived performance
- Graceful degradation if API is slow/fails
- Prevents double-clicks/race conditions with disabled state

### Alternatives Considered
1. **Wait for server confirmation**: Slower UX, feels laggy
2. **More granular states** (e.g., "Sending...", "Canceling..."): Adds complexity for minimal UX benefit
3. **No disabled state during pending**: Risk of duplicate requests

### Error Handling
- Network errors: Show toast, rollback to previous state
- Duplicate request: Silently treat as success (idempotent)
- User not found: Show error, disable button

---

## 4. Migration Path

### Decision
**No migration needed** - zero-downtime rollout

### Approach
1. Deploy new API endpoints (follow request routes)
2. Add follow_requests collection (empty initially)
3. Update frontend FollowButton component with feature flag
4. Gradually enable new flow for users
5. Existing follows remain unchanged

### Rationale
- New feature doesn't break existing functionality
- Follow relationships already established continue working
- Users can still be followed/unfollowed using existing flow during transition
- No data transformation required

### Alternatives Considered
1. **Convert existing follows to "auto-accepted" requests**: Unnecessary complexity, no user benefit
2. **Hard cutover**: Risky, no rollback path
3. **Dual-write period**: Overcomplicates, not needed since collections are separate

---

## 5. Mutual Follow Request Behavior

### Decision
**Keep both requests pending** (as specified in spec)

### Implementation
- If User A sends request to User B, and User B sends request to User A:
  - Both requests exist independently in database
  - Each user sees incoming request from the other
  - Either can accept to establish follow in that direction
  - No special detection or auto-acceptance

### Rationale
- Simpler implementation (no cross-request logic needed)
- Maintains consistent approval flow
- Users have full control over accepting/declining
- Edge case unlikely to cause major UX issues

### Alternatives Considered
1. **Auto-accept mutual requests**: Requires detecting condition, adds complexity, can implement later if users request
2. **Merge into single "mutual request"**: Confusing data model, unclear who initiated

---

## 6. Request Limits & Spam Prevention

### Decision
**No request limits for v1**, rely on existing rate limiting

### Future Considerations (if spam becomes issue)
- Max N requests per user per day
- Cooldown period after declined request
- Block auto-retry from same user
- Auto-expire old requests after 30 days

### Rationale
- YAGNI - add complexity only if needed
- Existing API rate limits (from 006-vercel-db-storage) apply
- Social pressure discourages spam in small networks
- Can implement limits reactively if abuse occurs

---

## 7. Notification Content

### Decision
**Minimal notification data**:
```javascript
{
  type: 'follow_request',
  actorId: requesterId,
  actorUsername: string,
  actorDisplayName: string,
  actorAvatar: string,
  createdAt: Date,
  read: boolean
}
```

### Rationale
- Enough info to display in notification list without extra API calls
- Denormalized user data for performance (accept stale data tradeoff)
- `read` flag for marking notifications as seen

### Alternatives Considered
1. **Reference-only** (just IDs, fetch user data on demand): Slower, more API calls
2. **Full user object**: Unnecessary data transfer, harder to keep in sync

---

## Summary

All technical unknowns resolved. Ready for Phase 1 (design artifacts).

**Key Technologies**: MongoDB (follow_requests collection), React (components/pages), Vercel Serverless Functions (API routes)

**Key Patterns**:
- RESTful API design
- Optimistic UI updates
- Polling for notifications (upgrade path to WebSockets if needed)
- Separate collections for clear data boundaries
