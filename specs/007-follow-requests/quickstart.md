# Developer Quickstart: Follow Requests

**Feature**: 007-follow-requests  
**Last Updated**: 2025-12-26

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas connection configured
- Existing PostShare project running locally
- At least 2 test user accounts

## Setup

### 1. Database Setup

Create the `follow_requests` collection and indexes:

```bash
# From project root
node scripts/setup-follow-requests-indexes.js create
```

Or manually in MongoDB shell:

```javascript
use postshare

// Create collection
db.createCollection("follow_requests")

// Add indexes
db.follow_requests.createIndex(
  { recipientId: 1, createdAt: -1 },
  { name: 'recipient_requests_idx' }
)

db.follow_requests.createIndex(
  { requesterId: 1, createdAt: -1 },
  { name: 'requester_requests_idx' }
)

db.follow_requests.createIndex(
  { requesterId: 1, recipientId: 1 },
  { unique: true, name: 'unique_request_idx' }
)
```

### 2. Install Dependencies

No new dependencies needed - feature uses existing stack.

### 3. Start Development Server

```bash
# Terminal 1: Start API server
npm run dev:api
# or
node start-server.js

# Terminal 2: Start frontend
npm run dev
```

## Testing Follow Request Flows

### Test Data Setup

Create seed data for testing:

```javascript
// In MongoDB shell or using API
// User 1: alice
{ 
  username: "alice",
  email: "alice@example.com",
  displayName: "Alice Johnson",
  _id: ObjectId("...") 
}

// User 2: bob
{ 
  username: "bob",
  email: "bob@example.com",
  displayName: "Bob Smith",
  _id: ObjectId("...") 
}
```

### Manual Test Workflow

#### 1. Send Follow Request

```bash
# Login as Alice, get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}'

# Send request to Bob
curl -X POST http://localhost:3000/api/users/bob/follow-request \
  -H "Authorization: Bearer {ALICE_TOKEN}"

# Expected: 201 Created
```

#### 2. View Incoming Requests (Bob)

```bash
# Login as Bob
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "bob@example.com", "password": "password123"}'

# Get incoming requests
curl -X GET http://localhost:3000/api/users/me/follow-requests \
  -H "Authorization: Bearer {BOB_TOKEN}"

# Expected: List with Alice's request
```

#### 3. Accept Request (Bob)

```bash
curl -X POST http://localhost:3000/api/users/me/follow-requests/{REQUEST_ID}/accept \
  -H "Authorization: Bearer {BOB_TOKEN}"

# Expected: 200 OK, Follow created
```

#### 4. Verify Follow Relationship

```bash
# Check Bob's followers
curl -X GET http://localhost:3000/api/users/bob/followers \
  -H "Authorization: Bearer {BOB_TOKEN}"

# Expected: Alice in followers list
```

### Frontend Testing

1. **Login as Alice** → Navigate to Bob's profile
2. **Click "Follow"** → Button changes to "Request Sent"
3. **Login as Bob** → Open Notifications/Requests page
4. **See Alice's request** → Click "Accept"
5. **Verify** → Alice now in Bob's followers

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/{username}/follow-request` | Send request |
| GET | `/api/users/me/follow-requests` | List incoming |
| POST | `/api/users/me/follow-requests/{id}/accept` | Accept request |
| POST | `/api/users/me/follow-requests/{id}/decline` | Decline request |
| GET | `/api/users/me/sent-requests` | List sent requests |
| DELETE | `/api/users/me/sent-requests/{id}` | Cancel sent request |

## Common Issues

### Duplicate Request Error

**Error**: `Follow request already exists`

**Cause**: Request already pending between these users

**Fix**: Cancel existing request first, or check if already following

### Forbidden Error on Accept

**Error**: `403 Forbidden`

**Cause**: Trying to accept a request you didn't receive

**Fix**: Ensure you're logged in as the recipient (not the requester)

### Request Not Found

**Error**: `404 Not Found`

**Cause**: Request was already accepted, declined, or doesn't exist

**Fix**: Refresh the requests list

## Database Queries for Debugging

```javascript
// Find all pending requests
db.follow_requests.find({})

// Find requests for specific user
db.follow_requests.find({ recipientId: ObjectId("USER_ID") })

// Find requests from specific user
db.follow_requests.find({ requesterId: ObjectId("USER_ID") })

// Check for duplicates
db.follow_requests.find({
  requesterId: ObjectId("ALICE_ID"),
  recipientId: ObjectId("BOB_ID")
})

// Count total pending requests
db.follow_requests.countDocuments({})

// Clear all requests (testing only!)
db.follow_requests.deleteMany({})
```

## Feature Flags (Optional)

If implementing gradual rollout:

```javascript
// .env.local
FEATURE_FOLLOW_REQUESTS_ENABLED=true

// In code
const followRequestsEnabled = process.env.FEATURE_FOLLOW_REQUESTS_ENABLED === 'true'
```

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement backend API endpoints
3. Create FollowRequest component
4. Update FollowButton logic
5. Add notification polling
6. Write integration tests

## Resources

- [API Contract](./contracts/api-follow-requests.yaml)
- [Data Model](./data-model.md)
- [Research Doc](./research.md)
- [Feature Spec](./spec.md)
