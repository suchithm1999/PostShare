# Mobile UX Polish - Quickstart & Testing Guide

This guide describes how to validate the responsive design and mobile optimizations.

## Setup

1. **Start the app**:
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

2. **Open DevTools Device Toolbar**:
   - Chrome/Edge: Press `F12`, then `Ctrl+Shift+M` (or Cmd+Shift+M on Mac).
   - Firefox: Press `F12`, then `Ctrl+Shift+M`.

## Validation Scenarios

### 1. Navigation Responsive Switching

**Test**: Resize window from Desktop (>1024px) to Tablet (768px) to Mobile (<640px).

- **Desktop (>1024px)**:
  - [ ] Top Navbar shows Links (Feed, Create, etc.)
  - [ ] Bottom Bar is HIDDEN
- **Mobile (<640px)**:
  - [ ] Top Navbar shows ONLY Logo and Theme Toggle
  - [ ] Bottom Bar is VISIBLE and fixed at bottom
  - [ ] Bottom Bar has: Feed, Search, Create, Notifications, Profile icons

### 2. Feed Layout

**Test**: View Home Feed on Mobile view.

- [ ] Posts take up full width (minus small padding)
- [ ] No horizontal scrolling
- [ ] Images fit within the screen width

### 3. Profile Layout

**Test**: Go to `/profile` on Mobile view.

- [ ] Avatar and Name are legible (stacked or compact)
- [ ] "Follow/Edit" buttons are easily clickable (full width recommended)
- [ ] Stats (Followers/Following) are clearly visible
- [ ] Post grid adapts (1 or 2 columns, not cramped 3)

### 4. Create Post

**Test**: Go to `/create` on Mobile view.

- [ ] Text area font size is large enough (16px)
- [ ] "Post" button is easily reachable

### 5. Touch Targets

**Test**: Enable "Touch simulation" in DevTools (simulates finger taps).

- [ ] Verify you can easily tap the Bottom Nav icons without mis-clicking
- [ ] Verify Notification Heart icon is tappable

## Troubleshooting

- **Issue**: Bottom bar covers content.
  - **Fix**: Check `pb-20` (padding bottom) exists on the main container `div`.
- **Issue**: Input zooms in on focus (iOS).
  - **Fix**: Verify `font-size: 16px` is computed style for the input.
