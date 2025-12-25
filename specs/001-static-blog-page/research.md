# Research: Static Blog Page

**Feature**: Static Blog Page
**Status**: Complete

## 1. Data Persistence Strategy

**Problem**: Need to persist blog posts without a backend server.
**Options**:
- **A. LocalStorage**: Persistent across reloads, easy API `getItem`/`setItem`. Limit ~5MB.
- **B. SessionStorage**: Cleared on tab close. Too volatile.
- **C. File System Access API**: Too complex, requires permissions.
- **D. IndexedDB**: More storage, async, but more complex API.

**Decision**: **Option A (LocalStorage)**.
**Rationale**: Simple synchronous API fits the "simple text and image" scope perfectly. The 5MB limit is a known constraint but acceptable for an MVP/Proof-of-Concept static page.

## 2. Image Handling within LocalStorage

**Problem**: "File Upload" requirement means storing binary data in a text-only storage (LocalStorage).
**Options**:
- **A. Base64 Encoding**: Convert file -> Base64 string. Increases size by ~33%.
- **B. Object URLs**: `URL.createObjectURL()`. specific to session, creates references that don't persist after reload. (Invalid for persistence).
- **C. External Hosting**: Upload to Imgur/etc. via API. (Violates "static/no-backend" simplicity scope).

**Decision**: **Option A (Base64 Encoding)** with Constraints.
**Rationale**: It's the only way to persist "uploads" in LocalStorage.
**Mitigation**: Enforce a strict file size limit (e.g., < 300KB) to prevent filling the 5MB quota immediately.

## 3. Application Architecture

**Problem**: How to structure the view vs post logic.
**Options**:
- **A. Single State Toggle**: `useState('view' | 'create')`. Simple, no URL changes.
- **B. React Router**: Standard routing `/` and `/create`. Better for browser history.

**Decision**: **Option B (React Router)**.
**Rationale**: Provides a more professional "blog" feel where users can navigate back/forward.

## Summary of Technical Choices

1. **Framework**: React.js (Vite)
2. **Storage**: LocalStorage (Key: `blog_posts_v1`)
3. **Images**: Base64 strings (Max 300KB)
4. **Routing**: `react-router-dom`
