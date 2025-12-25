# Data Model: Clear Feed

## Entities

No new entities. Operates on the existing **Post** entity collection.

## Storage Schema (LocalStorage)

**Key**: `static_blog_posts`

**Operation**:
- **Before**: `[ { "id": "..." }, { "id": "..." } ]`
- **After**: `[]` (Empty Array)
