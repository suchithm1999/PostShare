# Data Model: UI Revamp & Theming

## Entities

No new backend/data entities.

## LocalStorage Schema

**Key**: `theme`
**Value**: string (`'light'` | `'dark'`)
**Default**: System preference (`window.matchMedia('(prefers-color-scheme: dark)').matches` ? 'dark' : 'light')

## State Management

- **Theme Context**: A simple React Context or just a hook (`useTheme`) to manage the class on `<html>` and the LocalStorage persistence.
