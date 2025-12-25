# Research: Clear Feed Functionality

**Feature**: Clear Feed
**Status**: Complete

## 1. UI Placement

**Problem**: Where should the "Clear Feed" button live?
**Options**:
- **A. In the Navbar**: Globally accessible.
- **B. In the Feed Page (Top Right)**: Contextually relevant to "Viewing Feed".
- **C. In Settings Page**: Overkill, we don't have a settings page.

**Decision**: **Option B (Feed Page)**.
**Rationale**: It is strictly an action related to the Feed. Placing it in the Navbar might clutter the global navigation.

## 2. Confirmation UX

**Problem**: How to ask for confirmation?
**Options**:
- **A. Native `window.confirm()`**: Simple, zero dependencies, blocking.
- **B. Custom Modal**: Better styling, more work.
- **C. Double Click**: "Click to arm, Click to delete". Tricky UX.

**Decision**: **Option A (Native confirm)**.
**Rationale**: Fits the "static/simple" scope of the project perfectly. Low complexity.

## Summary of Technical Choices

1. **Service**: Add `clearAllPosts()` to `BlogService`.
2. **UI**: Add Button to `Feed.jsx` header area.
3. **UX**: Use `window.confirm` for safety.
