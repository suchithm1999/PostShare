# Implementation Plan: View & Edit Feed Posts

**Branch**: `005-view-edit-feed` | **Date**: 2025-12-25 | **Spec**: [Link](./spec.md)
**Input**: Feature specification from `/specs/005-view-edit-feed/spec.md`

## Summary

Implement a two-part feature:
1. **View**: An image modal/lightbox for detailed viewing of post images.
2. **Edit**: An edit interface allowing users to modify text and replace/remove images of existing posts.

## Technical Context

**Language/Version**: JavaScript (React 18+)
**Primary Dependencies**: React, LocalStorage, `browser-image-compression` (existing), `lucide-react` (icons)
**Storage**: LocalStorage (`static_blog_posts`)
**Testing**: Manual / Integration (Browser)
**Target Platform**: Modern Browser
**Project Type**: Single Page Web Application
**Performance Goals**: Edit mode open < 200ms, Save < 500ms.
**Constraints**: Client-side only state management; ensure existing image compression rules apply to edits.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core Principles**: N/A
- **Governance**: N/A

## Project Structure

### Documentation (this feature)

```text
specs/005-view-edit-feed/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ImageModal.jsx       # NEW: Reusable modal for viewing images
│   ├── EditPostModal.jsx    # NEW: Modal specifically for editing posts
│   └── PostCard.jsx         # Update hooks for View/Edit actions
├── services/
│   └── blogService.js       # Add updatePost(id, dto) method
└── pages/
    └── Feed.jsx             # Manage modal states
```

**Structure Decision**: Introducing dedicated Modal components to avoid cluttering `Feed.jsx` or `PostCard.jsx`. `EditPostModal` will reuse logic from `PostForm` (possibly by extracting `PostForm` logic or just composing it, but a separate simple modal might be cleaner for MVPl).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
