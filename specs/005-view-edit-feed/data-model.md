# Data Model: View & Edit Feed Posts

## Entities

### Post (Existing)

```typescript
interface Post {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  updatedAt?: string; // New field optional, good for showing "(edited)"
}
```

## Storage

**Key**: `static_blog_posts`
**Operations**:
- **Update**: Find by `id`, merge new fields, save to `localStorage`.

## UI State (Feed.jsx)

```javascript
{
  viewingImage: "base64_string...", // or null
  editingPost: { id: "...", content: "...", ... } // or null
}
```
