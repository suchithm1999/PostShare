# Research: Followers and Following List

**Feature**: 001-followers-following-list  
**Date**: 2026-01-04  
**Status**: Completed

## Overview

This document consolidates research findings for implementing the followers and following list viewing feature in PostShare. All technical unknowns from the Technical Context have been resolved through analysis of existing codebase, industry best practices, and UX patterns from established social platforms.

## Research Areas

### 1. UI/UX Patterns for Social Network Lists

**Research Question**: What are the best practices for displaying followers/following lists in social applications?

**Findings**:

| Platform | Approach | Key Features |
|----------|----------|--------------|
| Twitter/X | Modal overlay | - Infinite scroll<br>- Inline follow/unfollow buttons<br>- Search bar at top<br>- Shows mutual follow indicators |
| Instagram | Modal overlay | - Infinite scroll<br>- Alphabet jump navigation<br>- "Remove" for followers<br>- Minimal info (avatar + username) |
| LinkedIn | Full page | - Traditional pagination<br>- Filters (connections, location)<br>- Rich profile previews<br>- "Connect" buttons inline |
| GitHub | Full page | - Traditional pagination (50 per page)<br>- Minimal design<br>- No inline actions<br>- Simple avatar + username grid |

**Recommendation**: **Twitter/X pattern** - Modal overlay with infinite scroll, inline actions, and search. This balances simplicity with functionality and matches PostShare's social media focus.

### 2. Infinite Scroll Implementation with React

**Research Question**: What's the best way to implement infinite scroll in React with existing paginated backend?

**Best Practice**: Use **Intersection Observer API** with custom React hook

**Implementation Pattern**:
```javascript
// Pattern: useInfiniteScroll hook
const useInfiniteScroll = (callback, hasMore) => {
  const observerRef = useRef();
  const loadMoreRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        callback(); // Load next page
      }
    });
    if (node) observerRef.current.observe(node);
  }, [callback, hasMore]);
  
  return loadMoreRef;
};
```

**Rationale**:
- Browser-native API, excellent performance
- Works seamlessly with React refs
- Automatically triggers when sentinel element enters viewport
- Cleanup handled in useEffect

**Alternative Considered**: Scroll event listeners with throttling/debouncing - rejected due to performance overhead and complexity.

### 3. Search and Filter Implementation

**Research Question**: How should search/filter work with paginated data?

**Approach**: **Client-side search on loaded data** with visual feedback

**Implementation Details**:
- Filter on `username` and `displayName` fields (case-insensitive)
- Use JavaScript `Array.filter()` with toLowerCase() comparison
- Show "X results" count when search active
- Display "No users found" empty state for no matches
- Search bar uses debounced input (300ms delay) to avoid excessive re-renders

**Example Pattern**:
```javascript
const [searchQuery, setSearchQuery] = useState('');
const filteredUsers = useMemo(() => {
  if (!searchQuery) return allUsers;
  const query = searchQuery.toLowerCase();
  return allUsers.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.displayName.toLowerCase().includes(query)
  );
}, [allUsers, searchQuery]);
```

**When to Add Server-Side Search**: If users regularly have 1000+ followers/following and search becomes slow (>500ms perceived), implement API query parameter: `?search=query`.

### 4. Optimistic UI Updates for Follow Actions

**Research Question**: How to handle follow/unfollow actions within the list to feel instant?

**Pattern**: **Optimistic updates with rollback on error**

**Existing Implementation** (from FollowButton component):
- Immediately update local state before API call
- Update UI to show new state (Following → Follow or vice versa)
- If API fails, rollback state and show error toast
- If in a list, remove/add user from local array for instant feedback

**Enhancements for Lists**:
```javascript
// Unfollow from following list → immediately remove from UI
const handleUnfollow = async (userId) => {
  setUsers(prev => prev.filter(u => u._id !== userId));
  try {
    await followService.unfollow(userId);
  } catch (error) {
    // Rollback: re-add user to list
    setUsers(prev => [...prev, removedUser]);
    showError('Failed to unfollow');
  }
};
```

**Key Principle**: Never make users wait for network. Update UI instantly, handle errors gracefully.

### 5. Mobile Responsiveness Considerations

**Research Question**: What adjustments are needed for mobile vs. desktop?

**Key Differences**:

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Modal Size | 600px width, 80vh height | Full screen or 95% height |
| List Item Layout | Horizontal (avatar, name, bio, button) | Vertical stack or compact horizontal |
| Search Bar | Always visible at top | Sticky header with search |
| Infinite Scroll | Loads 20-30 at a time | Loads 15-20 (smaller viewport) |
| Close Button | Top-right X icon | Top-left back arrow + X |

**Tailwind CSS Classes for Responsive Design**:
- Modal: `w-full sm:w-[600px] h-screen sm:h-[80vh]`
- List Item: `flex-col sm:flex-row gap-2 sm:gap-4`
- Avatar: `w-12 h-12 sm:w-14 sm:h-14`
- Follow Button: `w-full sm:w-auto`

### 6. Accessibility (a11y) Requirements

**Research Question**: What accessibility features are needed for list views?

**Requirements**:

1. **Keyboard Navigation**:
   - Tab through list items
   - Enter/Space to activate follow/unfollow buttons
   - Escape to close modal
   - Arrow keys for scroll navigation (optional enhancement)

2. **Screen Reader Support**:
   - Announce total count: "142 followers"
   - ARIA labels on buttons: "Follow @username" vs "Unfollow @username"
   - ARIA live region for follow/unfollow success/error messages
   - Modal ARIA attributes: `role="dialog"`, `aria-labelledby`, `aria-modal="true"`

3. **Focus Management**:
   - When modal opens, focus moves to search input or first list item
   - When modal closes, focus returns to the trigger button (follower count)
   - Focus trap within modal (can't tab outside)

4. **Visual Accessibility**:
   - Maintain 4.5:1 contrast ratios (Tailwind's default grays pass WCAG AA)
   - Focus indicators visible on all interactive elements
   - Support browser font scaling (use rem units)

**Implementation Libraries**:
- `@headlessui/react` for accessible modal primitives (if not already using it)
- Or manual implementation with `react-focus-lock` and ARIA attributes

### 7. Performance Optimization Strategies

**Research Question**: How to ensure smooth performance with large lists?

**Optimizations**:

1. **Virtual Scrolling**: NOT needed for MVP
   - Only implement if lists >1000 users become common
   - Libraries: `react-window` or `react-virtual`
   - Current pagination approach (20-50 per load) is sufficient

2. **Image Lazy Loading**: Use `loading="lazy"` on avatar images
   ```jsx
   <img src={avatarUrl} loading="lazy" alt={username} />
   ```

3. **Memoization**: 
   - Memo list items with `React.memo(UserListItem)` to prevent unnecessary re-renders
   - Use `useMemo` for filtered search results
   - Use `useCallback` for stable function references passed to children

4. **Debounce Search**: 300ms debounce on search input
   ```javascript
   const debouncedSearch = useMemo(
     () => debounce((query) => setSearchQuery(query), 300),
     []
   );
   ```

5. **API Response Caching**: Store fetched pages in state, don't re-fetch if user scrolls back up

### 8. Edge Case Handling

**Research Question**: How to handle real-time updates (user unfollows while viewing list)?

**Approach**: **Stale data is acceptable for MVP** with manual refresh option

**Scenarios**:

| Edge Case | Handling |
|-----------|----------|
| User unfollows me while I view followers | List shows stale data until I refresh or close/reopen modal |
| I unfollow someone in the list | Optimistically remove immediately, rollback on error |
| User deletes account while in list | Show "User not found" or grayed-out entry if clicked |
| Network error during page load | Show error message with "Try Again" button |
| Zero followers/following | Show empty state: "No followers yet" with suggestion to share profile |

**Future Enhancement**: WebSocket or polling for real-time updates (not MVP).

### 9. Relationship Indicators

**Research Question**: Should the list show if I follow users who follow me (mutual follows)?

**Decision**: **Yes, show relationship indicators**

**UI Patterns**:
- "Follows you" badge for users in my followers list who I don't follow
- "Following" state for users I already follow
- Button states:
  - "Follow" (not following)
  - "Following" (following, shows "Unfollow" on hover)
  - "Follows you" pill/badge (text only, not button)

**API Note**: The existing followers/following endpoints return user objects. We'll need to check against the current user's following list to determine relationship. Options:

**Option A**: Fetch current user's following IDs once, check in memory
```javascript
const myFollowingIds = new Set(myFollowing.map(u => u._id));
const isFollowing = (userId) => myFollowingIds.has(userId);
```

**Option B**: Use existing `followStatus` check per user (more API calls, not scalable)

**Recommendation**: **Option A** - Fetch once, check locally. Scales to thousands of users.

## Summary of Key Decisions

| Decision Area | Choice | Reason |
|---------------|--------|--------|
| **UI Pattern** | Modal overlay (primary) + optional full page | Matches Twitter/X UX, less disruptive |
| **Pagination** | Infinite scroll with Intersection Observer | Modern UX standard, better mobile experience |
| **Search** | Client-side filtering | Instant results for <500 users, no backend changes |
| **Inline Actions** | Yes (reuse FollowButton) | Major UX improvement, low implementation cost |
| **Optimistic Updates** | Yes, with rollback | Feels instant, existing pattern in codebase |
| **Mobile Design** | Responsive with full-screen on mobile | Better focus, standard mobile UX |
| **Accessibility** | Full keyboard nav + ARIA labels | WCAG AA compliance, screen reader support |
| **Real-time Updates** | No (stale data acceptable for MVP) | Simpler implementation, refresh available |
| **Relationship Indicators** | Yes ("Follows you" badges) | Social context helpful for users |
| **Virtual Scrolling** | No (defer to future) | Over-engineering for MVP, pagination sufficient |

## Dependencies & Integration Points

### Existing Systems to Integrate With:

1. **API Endpoints** (already exist, no changes):
   - `GET /api/users/[username]/followers` - Paginated followers list
   - `GET /api/users/[username]/following` - Paginated following list

2. **Components to Reuse**:
   - `UserAvatar` - Display user profile pictures
   - `FollowButton` - Follow/unfollow actions
   - Theme system - Dark mode support

3. **Services**:
   - `apiClient` - HTTP requests
   - `followService` - Follow/unfollow logic (may need getFollowersList helper)

4. **Hooks**:
   - `useAuth` - Current user context

### New Components to Create:

1. `FollowersList` - Modal/page component
2. `FollowingList` - Modal/page component  
3. `UserListItem` - Individual user row
4. `ListSearchBar` - Search input component
5. `useFollowers` - Data fetching hook
6. `useFollowing` - Data fetching hook
7. `useInfiniteScroll` - Scroll pagination hook

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with 10k+ users | High CPU usage, slow rendering | Implement virtual scrolling if needed, monitor analytics |
| Stale data confuses users | Medium - users see outdated counts | Add "Last updated" timestamp, refresh button |
| API rate limiting | Medium - excessive requests if user scrolls fast | Debounce scroll, cache fetched pages, respect API limits |
| Mobile browser compatibility | Low - Intersection Observer not supported in very old browsers | Provide "Load More" button fallback |
| Follow/unfollow race conditions | Low - rapid clicks cause errors | Disable button during API call, debounce clicks |

## Open Questions for Implementation

None - all research complete. Ready for Phase 1 (Data Model & Contracts).
