# Data Model: Static Blog Page

## Entities

### Post

Represents a single blog entry created by a user.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` (UUID) | Unique identifier | Required, Auto-generated |
| `title` | `string` | Title of the post | Required, Max 100 chars |
| `content` | `string` | Main text content | Required, Min 1 char |
| `imageUrl` | `string` | Base64 string or URL | Optional |
| `createdAt` | `string` (ISO 8601) | Creation timestamp | Required, Auto-generated |
| `likes` | `number` | Simple counter | Default 0 |

## Storage Schema (LocalStorage)

**Key**: `static_blog_posts`
**Value**: JSON Array of `Post` objects.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Post",
    "content": "Hello world!",
    "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2025-12-25T12:00:00Z",
    "likes": 0
  }
]
```
