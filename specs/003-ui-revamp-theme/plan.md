# Implementation Plan: UI Revamp & Theming

**Branch**: `003-ui-revamp-theme` | **Date**: 2025-12-25 | **Spec**: [Link](./spec.md)
**Input**: Feature specification from `/specs/003-ui-revamp-theme/spec.md`

## Summary

Integrate Tailwind CSS to completely revamp the UI, implementing a vibrant color palette, day/night theme toggling with persistence, and smooth animations.

## Technical Context

**Language/Version**: JavaScript (React 18+)
**Primary Dependencies**: React, Tailwind CSS (New), PostCSS (New), Autoprefixer (New)
**Storage**: LocalStorage (`theme` key: 'light' | 'dark')
**Testing**: Vitest + React Testing Library (if enabled)
**Target Platform**: Modern Web Browsers
**Project Type**: Single Page Web Application
**Performance Goals**: CSS-based theme switch <50ms.
**Constraints**: Tailwind must be configured to support dynamic class twiddling (darkMode: 'class').

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core Principles**: N/A
- **Governance**: N/A

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-revamp-theme/
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
├── components/          # Update all components with tailwind classes
├── pages/               # Update page layouts
├── index.css            # Replace vanilla CSS with @tailwind directives
└── theme/               # (Optional) Theme configuration
tailwind.config.js       # New configuration file
postcss.config.js        # New configuration file
```

**Structure Decision**: Standard Tailwind setup. No separate theme directory needed; `tailwind.config.js` will handle the design system.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
