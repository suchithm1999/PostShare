# Research: UI Revamp & Theming

**Feature**: UI Revamp with Tailwind CSS
**Status**: Complete

## 1. Tailwind Integration Strategy

**Problem**: Adding Tailwind to an existing Vite + React project.
**Solution**: Standard PostCSS integration.
- Install: `npm install -D tailwindcss postcss autoprefixer`
- Init: `npx tailwindcss init -p`
- Config: Add content paths in `tailwind.config.js`.
- Directives: Replace `index.css` content with `@tailwind base; @tailwind components; @tailwind utilities;`.

## 2. Theming Strategy (Dark vs Light)

**Problem**: How to implement and switch themes efficiently?
**Options**:
- **A. CSS Variables**: Define colors in `:root` and `.dark`, use `var(--color)` in Tailwind.
- **B. Tailwind `darkMode: 'class'`**: Use `dark:bg-black` utilities directly.

**Decision**: **Option B (Tailwind class strategy)** with a hybrid approach.
- We will set `darkMode: 'class'` in `tailwind.config.js`.
- We will toggle the `dark` class on the `<html>` element.
- This allows explicit control (`onClick` handler) and system preference detection.

## 3. Vibrant Color Palette

**Decision**: Use Tailwind's default palette (v3/v4 has excellent colors) but customize a primary brand color.
- **Primary**: `violet` / `purple` (Vibrant and modern).
- **Secondary**: `rose` / `pink` (For accents).
- **Dark Background**: `slate-900` (Rich dark blue-grey) instead of pure black for a premium look.

## 4. Animation Strategy

**Decision**: Use standard Tailwind `animate-` classes + arbitrary values for custom needs.
- **Hover**: `hover:scale-105`, `transition-all`, `duration-300`.
- **Entry**: `animate-fade-in` (need to extend config keyframes).
