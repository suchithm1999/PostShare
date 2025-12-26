# Data Model: Follow Request Approval System

**Feature**: 007-follow-requests  
**Date**: 2025-12-26

## Entity: FollowRequest

Represents a pending follow request from one user to another.

### Schema

```javascript
{
  _id: ObjectId,           // Auto-generated unique identifier
  requesterId: ObjectId,   // User who sent the follow request
  recipientId: ObjectId,   // User who received the follow request
  status: String,          // Always 'pending' (accepted/declined don't persist)
  createdAt: Date,         // When the request was created
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Auto-generated MongoDB document ID |
| `requesterId` | ObjectId | Yes | References `users._id` - who wants to follow |
| `recipientId` | ObjectId | Yes | References `users._id` - who is being requested to follow |
| `status` | String | Yes | Always `'pending'` - accepted converts to Follow, declined deletes request |
| `createdAt` | Date | Yes | Timestamp when request was sent, used for sorting |

### Indexes

```javascript
// 1. Primary query pattern: Get all incoming requests for a user
db.follow_requests.createIndex(
  { recipientId: 1, createdAt: -1 },
  { name: 'recipient_requests_idx' }
);

// 2. Secondary query pattern: Get all outgoing requests from a user
db.follow_requests.createIndex(
  { requesterId: 1, createdAt: -1 },
  { name: 'requester_requests_idx' }
);

// 3. Uniqueness constraint: Prevent duplicate requests
db.follow_requests.createIndex(
  { requesterId: 1, recipientId: 1 },
  { unique: true, name: 'unique_request_idx' }
);

// 4. Optional: Cleanup old requests (if auto-expiration implemented)
db.follow_requests.createIndex(
  { createdAt: 1 },
  { name: 'created_at_idx', expireAfterSeconds: 2592000 } // 30 days (OPTIONAL)
);
```

### State Transitions

```
[No Request] 
    ↓
    POST /api/users/{username}/follow-request
    ↓
[Pending Request]
    ↓
    ├→ POST /api/users/me/follow-requests/{id}/accept → [Following] (creates Follow, deletes FollowRequest)
    ├→ POST /api/users/me/follow-requests/{id}/decline → [No Request] (deletes FollowRequest)
    └→ DELETE /api/users/me/sent-requests/{id} → [No Request] (requester cancels, deletes FollowRequest)
```

**Important**: `FollowRequest` documents are **ephemeral**:
- Created when request is sent
- Deleted when accepted (replaced by Follow document)
- Deleted when declined (no trace)
- Deleted when canceled by requester

---

## Relationship to Existing Collections

### Existing: `follows` Collection

```javascript
{
  _id: ObjectId,
  followerId: ObjectId,    // User who is following
  followingId: ObjectId,   // User being followed
  createdAt: Date
}
```

**No changes to this collection.** Active follows remain separate from pending requests.

### Existing: `users` Collection

```javascript
{
  _id: ObjectId,
  username: String,
  displayName: String,
  avatarUrl: String,
  followerCount: Number,   // Updated when Follow created/deleted
  followingCount: Number,  // Updated when Follow created/deleted
  ...
}
```

**Behavior Change**:
- `followerCount` and `followingCount` update only when `FollowRequest` → `Follow` (acceptance)
- **NOT updated** when `FollowRequest` is created or deleted

---

## Validation Rules

### Create FollowRequest

- ✅ `requesterId` must exist in `users` collection
- ✅ `recipientId` must exist in `users` collection
- ✅ `requesterId !== recipientId` (cannot request to follow yourself)
- ✅ No existing `FollowRequest` with same `(requesterId, recipientId)` pair
- ✅ No existing `Follow` with same `(followerId: requesterId, followingId: recipientId)` pair (already following)

### Accept FollowRequest

- ✅ Request must exist
- ✅ Current user must be the `recipientId` (can only accept requests sent to you)
- ✅ Request status must be `'pending'`

### Decline FollowRequest

- ✅ Request must exist
- ✅ Current user must be the `recipientId` (can only decline requests sent to you)

### Cancel FollowRequest (Requester)

- ✅ Request must exist
- ✅ Current user must be the `requesterId` (can only cancel your own requests)

---

## Example Documents

### FollowRequest Document

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  requesterId: ObjectId("507f1f77bcf86cd799439012"), // Alice
  recipientId: ObjectId("507f1f77bcf86cd799439013"), // Bob
  status: "pending",
  createdAt: ISODate("2025-12-26T14:30:00Z")
}
```

**Meaning**: Alice sent a follow request to Bob at 2:30 PM on Dec 26, 2025. Bob hasn't responded yet.

### Follow Document (after acceptance)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  followerId: ObjectId("507f1f77bcf86cd799439012"), // Alice
  followingId: ObjectId("507f1f77bcf86cd799439013"), // Bob
  createdAt: ISODate("2025-12-26T14:32:00Z")
}
```

**Result**: Bob accepted. The `FollowRequest` is deleted, a `Follow` is created. Alice is now following Bob.

---

## Query Patterns

### Get Incoming Requests (Recipient)

```javascript
db.follow_requests.find({
  recipientId: currentUserId
}).sort({ createdAt: -1 })
```

**Use**: Display "Follow Requests" page for current user

### Get Outgoing Requests (Requester)

```javascript
db.follow_requests.find({
  requesterId: currentUserId
}).sort({ createdAt: -1 })
```

**Use**: Display "Sent Requests" page for current user

### Check Pending Request Exists

```javascript
db.follow_requests.findOne({
  requesterId: currentUserId,
  recipientId: targetUserId
})
```

**Use**: Determine FollowButton state when viewing a profile

### Count Unread Requests

```javascript
db.follow_requests.countDocuments({
  recipientId: currentUserId
})
```

**Use**: Display notification badge count

---

## Performance Considerations

### Expected Usage Patterns

- **Read-heavy**: Users view their incoming requests frequently
- **Low write rate**: Follow requests sent less often than post views
- **Small dataset**: Assuming ~100-1000 pending requests per user max

### Index Effectiveness

| Query | Index Used | Efficiency |
|-------|------------|------------|
| Get incoming requests | `recipient_requests_idx` | O(log n) + O(k) where k = results |
| Get outgoing requests | `requester_requests_idx` | O(log n) + O(k) |
| Check duplicate | `unique_request_idx` | O(log n) |
| Accept request | `_id` (default) | O(log n) |

### Scaling Strategy

If request volume grows significantly:
1. Add caching layer (Redis) for notification counts
2. Denormalize request count into users collection
3. Archive old requests instead of deleting (if historical data needed)

---

## Migration Notes

**For v1**: No migration needed.
- Create `follow_requests` collection (empty)
- Add indexes
- Deploy API endpoints
- Existing `follows` collection unchanged

**Future**: If moving to request-based follows entirely:
- Could add "auto-accepted" flag to existing follows
- Or leave existing follows as-is (grandfather clause)
