# Research: View & Edit Feed Posts

**Feature**: View & Edit Feed Posts
**Status**: Complete

## 1. Edit UI Strategy

**Problem**: How to present the edit interface?
**Options**:
- **A. Inline Editing**: Turn the post card into a form. Smoothest flow but complex state management per card.
- **B. Modal Form**: Open a dialog with the form. Clean separation, standard pattern.
- **C. New Page**: `/edit/:id`. heavy routing overhead for simple edits.

**Decision**: **Option B (Modal Form)**.
**Rationale**:
- Keeps the feed stable.
- Can potentially reuse `PostForm` component inside the modal if refactored correctly, or just duplicate the simple form logic for MVP speed (Edit form is often slightly different than Create form, e.g., "Cancel" button, pre-filled data).

## 2. Image Viewing Strategy

**Decision**: **Custom React Portal Modal**.
- Lightweight, no external library needed.
- Just an overlay with `zIndex` and a centered `img`.

## 3. Reusability of PostForm

**Analysis**:
- `PostForm` currently handles creation.
- Edit requires pre-filling.
- Refactoring `PostForm` to accept `initialData` is the cleanest approach.
- **Plan**: Refactor `PostForm` to accept optional `initialValues` and `onCancel` props.

## 4. State Management for Modals

**Decision**: Lift state to `Feed` page.
- `viewingImage`: string | null (url)
- `editingPost`: Post | null (object)
- When these are non-null, render the respective Modals.
