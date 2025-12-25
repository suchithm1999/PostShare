# Implementation Plan: Delete Post & Image Optimization

**Branch**: `004-delete-post-image-opt` | **Date**: 2025-12-25 | **Spec**: [Link](./spec.md)
**Input**: Feature specification from `/specs/004-delete-post-image-opt/spec.md`

## Summary

Implement functionality to delete individual posts from the feed and automatically resize/compress uploaded images to fit within the 300KB limit.

## Technical Context

**Language/Version**: JavaScript (React 18+)
**Primary Dependencies**: React, LocalStorage, browser-image-compression (NEEDS CLARIFICATION: confirm library choice)
**Storage**: LocalStorage (`static_blog_posts`)
**Testing**: Manual / Integration (Browser)
**Target Platform**: Modern Browser
**Project Type**: Single Page Web Application
**Performance Goals**: Image compression < 2s for typical 4MB photo.
**Constraints**: Client-side only processing; strict 300KB limit for LocalStorage efficiency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core Principles**: N/A
- **Governance**: N/A

## Project Structure

### Documentation (this feature)

```text
specs/004-delete-post-image-opt/
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
│   ├── PostCard.jsx         # Add Delete button + confirmation logic
│   └── PostForm.jsx         # Add image resizing logic to handleImageChange
├── utils/
│   └── imageHelpers.js      # New utility for image compression
└── services/
    └── blogService.js       # Add deletePost(id) method
```

**Structure Decision**: Extending existing React component structure. Adding a specialized utility for image processing to keep components clean.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
