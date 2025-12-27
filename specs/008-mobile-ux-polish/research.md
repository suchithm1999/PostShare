# Research: Mobile UX Polish

**Feature**: `008-mobile-ux-polish`
**Goal**: Design technical approach for responsive mobile navigation and layout fixes.

## Critical Decisions

### 1. Navigation Strategy

**Context**: Need to switch between Top Navbar (Desktop) and Bottom Bar (Mobile).
**Decision**: Responsive Components with CSS Media Queries.
**Rationale**:
- Use `hidden md:flex` for Desktop Top Nav items.
- Use `fixed bottom-0 w-full md:hidden` for Bottom Navigation bar.
- This avoids JS window resize listeners which are less performant.
- **Components**:
  - `Navbar.jsx`: Will keep the logo/branding for mobile, but hide links.
  - `BottomNav.jsx`: New component, only visible on `md:hidden`.
  - `Layout.jsx`: New wrapper component to manage the padding-bottom required so content isn't hidden behind the fixed bottom bar.

### 2. Layout Structure

**Context**: Content needs to respect the 44px+ navigation bar at the bottom on mobile.
**Decision**: `pb-16` (64px) on the main content container when on mobile.
**Implementation**:
- Add a main layout wrapper or apply class to `App.jsx` container: `pb-20 md:pb-0`.

### 3. iOS Safe Areas

**Context**: Modern iPhones have a home indicator bar at the bottom.
**Decision**: Use CSS Environment variables.
**Implementation**:
- Bottom Nav class: `pb-[env(safe-area-inset-bottom)]`
- This ensures the click targets aren't overlapped by the home bar.

### 4. Input Zoom on iOS

**Context**: iOS Safari zooms in if inputs are < 16px font size.
**Decision**: Enforce `text-base` (16px) on all inputs for mobile.
**Implementation**:
- Update `index.css` or Tailwind config to ensure base input classes use `text-base`.

## Alternatives Considered

- **Library `react-responsive`**: Rejected. CSS media queries are faster and sufficient via Tailwind.
- **Separate Mobile/Desktop Routes**: Rejected. Application is simple enough for a responsive single view.
