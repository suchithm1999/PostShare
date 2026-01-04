# PostShare Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-25

## Active Technologies
- JavaScript (React 18+) + React (State Management) (002-clear-feed)
- LocalStorage (`static_blog_posts` key) (002-clear-feed)
- JavaScript (React 18+) + React, Tailwind CSS (New), PostCSS (New), Autoprefixer (New) (003-ui-revamp-theme)
- LocalStorage (`theme` key: 'light' | 'dark') (003-ui-revamp-theme)
- LocalStorage (`static_blog_posts`) (004-delete-post-image-opt)
- JavaScript (React 18+) + React, LocalStorage, `browser-image-compression` (existing), `lucide-react` (icons) (005-view-edit-feed)
- JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime) (006-vercel-db-storage)
- JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime) + React, React Router, MongoDB (database), Vercel (hosting), lucide-react (icons) (007-follow-requests)
- MongoDB Atlas (users, posts, follows collections) + new follow_requests collection (007-follow-requests)
- JavaScript (React 18+, Node.js 18+) (008-mobile-ux-polish)
- N/A (UI-only feature) (008-mobile-ux-polish)
- JavaScript (React 19+) with ES6+ syntax, JSX for components + React 19.2.0, React Router DOM 7.11.0, lucide-react 0.562.0 (icons), Tailwind CSS 3.4.17 (styling) (001-followers-following-list)
- MongoDB Atlas (users, follows collections) - already configured, no changes needed (001-followers-following-list)

- JavaScript (React 18+) + React, ReactDOM, Vite (Build Tool), simple CSS (Vanilla or CSS Modules) (001-static-blog-page)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (React 18+): Follow standard conventions

## Recent Changes
- 001-followers-following-list: Added JavaScript (React 19+) with ES6+ syntax, JSX for components + React 19.2.0, React Router DOM 7.11.0, lucide-react 0.562.0 (icons), Tailwind CSS 3.4.17 (styling)
- 008-mobile-ux-polish: Added JavaScript (React 18+, Node.js 18+)
- 007-follow-requests: Added JavaScript (React 18+), Node.js 18+ (Vercel serverless runtime) + React, React Router, MongoDB (database), Vercel (hosting), lucide-react (icons)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
