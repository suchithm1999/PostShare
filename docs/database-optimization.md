# Database Performance Optimization

## Running the Index Setup Script

After deploying your MongoDB database, run this script to create optimized indexes:

```bash
node scripts/setup-indexes.js
```

### Commands

```bash
# Create all indexes (default)
node scripts/setup-indexes.js create

# List all existing indexes
node scripts/setup-indexes.js list

# Drop all custom indexes (be careful!)
node scripts/setup-indexes.js drop
```

## Performance Impact

After creating indexes, you should see:
- **Feed queries**: 10-100x faster
- **User lookups**: Near-instant  
- **Follow operations**: 5-50x faster

## Indexes Created

### Posts Collection
1. `feed_query_idx`: (authorId, visibility, createdAt) - For personalized feeds
2. `public_timeline_idx`: (visibility, createdAt) - For public post discovery
3. `author_posts_idx`: (authorId, createdAt) - For user profile pages

### Users Collection
1. `email_unique_idx`: (email, unique) - For login/registration
2. `username_unique_idx`: (username, unique, case-insensitive) - For profiles
3. `oauth_lookup_idx`: (oauth.provider, oauth.providerId) - For social login

### Follows Collection
1. `follower_list_idx`: (followerId, createdAt) - For following lists
2. `following_list_idx`: (followingId, createdAt) - For follower lists
3. `unique_follow_idx`: (followerId, followingId, unique) - Prevents duplicate follows

## Monitoring

To check if indexes are being used:

```javascript
// In MongoDB shell or script
db.posts.find({ visibility: 'public' }).sort({ createdAt: -1 }).explain("executionStats")
```

Look for `"stage": "IXSCAN"` in the executionStats to confirm index usage.
