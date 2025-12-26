# Implementation Plan: Mobile & Tablet UX Polish

**Branch**: `008-mobile-ux-polish` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-mobile-ux-polish/spec.md`

## Summary

Implement a responsive bottom navigation bar for mobile devices, hiding the top navbar's primary links on small screens. Refactor Feed and Profile layouts to be responsive, ensuring 100% width on mobile and centered constraints on tablet/desktop. Enforce minimum touch target sizes (44px) and prevent input zooming on iOS by enforcing 16px font size.

## Technical Context

**Language/Version**: JavaScript (React 18+, Node.js 18+)
**Primary Dependencies**: 
- `react-router-dom` (Navigation)
- `tailwind-merge` & `clsx` (Conditional styling)
- `lucide-react` (Icons)
**Storage**: N/A (UI-only feature)
**Testing**: Manual responsive testing (Chrome DevTools + real devices if possible)
**Target Platform**: Responsive Web (Mobile < 640px, Tablet 640px-1024px, Desktop > 1024px)
**Project Type**: Single Page Application (Web)
**Performance Goals**: No layout thrashing during resize; Navigation transitions < 100ms
**Constraints**: Must match existing design system; No horizontal scrolling on 320px width

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Analysis

1. **Responsive Design (Implicit)**: ✅ Feature is fully aligned with improved responsiveness.
2. **Accessibility (Implicit)**: ✅ Feature actively improves accessibility by fixing touch targets and input zooming.
3. **Simplicity**: ✅ Using standard CSS/Tailwind utilities instead of heavy new libraries.

**Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/008-mobile-ux-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A (UI only)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/          # Navigation components (TopNav, BottomNav)
├── pages/               # Page layouts (Feed, Profile)
├── styles/              # Global CSS (input resizing)
└── layouts/             # (Optional) Layout wrappers
api/                     # No changes anticipated
```

**Structure Decision**: Standard React component structure. Will introduce `BottomNav` component and modify `Navbar` (TopNav) to be responsive.
