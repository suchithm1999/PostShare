# Research: Delete Post & Image Optimization

**Feature**: Delete Post & Image Optimization
**Status**: Complete

## 1. Image Compression Library Selection

**Problem**: Need a client-side library to compress images below 300KB without blocking the UI.
**Options**:
- **A. browser-image-compression**: Threaded (Web Workers), non-blocking, maintained, supports robust config.
- **B. compressorjs**: Lightweight, familiar API, widely used.
- **C. Custom Canvas Solution**: Zero dependencies, but high maintenance and complexity.

**Decision**: **Option A (browser-image-compression)**.
**Rationale**:
- Non-blocking (Web Workers) is critical for UX when processing multi-megabyte photos on the client side.
- robust API for iterative compression (can target max size explicitly in MB).
- widely adopted in React ecosystem.

## 2. Deletion Confirmation UX

**Problem**: How to prevent accidental deletion?
**Options**:
- **A. Native `window.confirm()`**: Simple, zero UI code, but ugly and blocking.
- **B. Custom Modal**: Beautiful, matches theme, but requires significant new UI code/state.

**Decision**: **Option A (Native confirm)** for MVP speed, or **Option B (Custom Modal)** if UI consistency is paramount?
*Refined Decision*: **Option A (`window.confirm`)** initially to match current scope, unless "UI Revamp" principles dictate otherwise. Given the "UI Revamp" feature just finished, a native alert might look jarring. *However*, strictly following MVP scope and "Delete single feed" request, native confirm is acceptable for now to focus effort on the tricky image compression logic. We can upgrade to a modal later.

## 3. Storage Constraints & Keys

**Decision**: Continue using `static_blog_posts` in `localStorage`.
- No migration needed.
- Deletion logic simply filters this array and blindly saves.
