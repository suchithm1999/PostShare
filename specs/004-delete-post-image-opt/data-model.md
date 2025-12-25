# Data Model: Delete Post & Image Optimization

## Entities

### Post (Existing)

No schema changes required.

```typescript
interface Post {
  id: string; // UUID
  title: string;
  content: string;
  image: string; // Base64 string
  date: string; // ISO Date
}
```

## Storage

**Key**: `static_blog_posts`
**Type**: `Post[]`
**Operations**:
- **Delete**: Filter array by `id` and overwrite `localStorage`.
- **Create**: (Existing) Append to array. Now includes compressed image string.

## State Management

- **Feed State**: React state array `posts`.
- **Deletions**: Optimistic UI update (remove from state immediately) + async LocalStorage update.
