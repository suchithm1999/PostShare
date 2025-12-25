# Quickstart: Static Blog Page

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Setup

1. **Initialize Project** (if not already done):
   ```bash
   npm create vite@latest . -- --template react
   npm install
   npm install react-router-dom lucide-react date-fns
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build available at**: `http://localhost:5173`

## Usage

1. **View Feed**: The home page `/` lists all current posts.
2. **Create Post**: Click "New Post" or navigate to `/create` to add content.
3. **Reset**: To clear data, run `localStorage.clear()` in the browser console.
