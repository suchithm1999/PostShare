# Feature Specification: View & Edit Feed Posts

**Feature Branch**: `005-view-edit-feed`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "add functionality to view the image of the feed, also add option to edit the feed, like replace image delete image or rephrase the text"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Post Image (Priority: P2)

As a user, I want to click on a post's image to view it in a larger size so that I can see the details clearly.

**Why this priority**: Improves the consumption experience where image details might need closer inspection.

**Independent Test**: Click viewing; image expands to a modal/lightbox; close modal; return to feed.

**Acceptance Scenarios**:

1.  **Given** a post with an image, **When** I click the image, **Then** it opens in a centered modal/lightbox overlay.
2.  **Given** the image modal is open, **When** I click "Close" or outside the image, **Then** the modal closes.
3.  **Given** a post (with or without image), **When** browsing the feed, **Then** the layout remains stable.

---

### User Story 2 - Edit Post Content (Priority: P1)

As a user, I want to edit the text or image of an existing post so that I can correct mistakes or update information.

**Why this priority**: Core content management requirement ("rephrase the text", "replace image").

**Independent Test**: Create post -> Edit -> Change Text & Remove Image -> Save -> Verify Feed updates without reload.

**Acceptance Scenarios**:

1.  **Given** a post in the feed, **When** I click the "Edit" button, **Then** an edit form appears (modal or inline) pre-filled with the current content and image.
2.  **Given** the edit form, **When** I modify the text and click "Save", **Then** the post updates in the feed immediately and persists to storage.
3.  **Given** the edit form, **When** I choose to "Remove Image", **Then** the image is removed from the post upon saving.
4.  **Given** the edit form, **When** I choose to "Replace Image" (upload new), **Then** the new image replaces the old one (applying existing compression rules) upon saving.
5.  **Given** the edit form, **When** I click "Cancel", **Then** no changes are saved and the view returns to normal.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: System MUST allow users to trigger an "Edit" mode for any single post.
-   **FR-002**: The Edit interface MUST pre-populate with the existing post's text and image (if any).
-   **FR-003**: System MUST allow text content modification.
-   **FR-004**: System MUST allow image modifications: Remove existing image, Replace with new image (upload), or Keep existing.
-   **FR-005**: System MUST apply existing image compression rules (from feature 004) to any replaced images during edit.
-   **FR-006**: System MUST persist edits to LocalStorage.
-   **FR-007**: System MUST provide a full-screen or modal view for images when clicked in the feed.

### Key Entities

-   **Post**: No schema changes. Updates occur on existing fields (`content`, `image`, `updatedAt` might be useful but optional).

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: User can open an edit form, make a change, and save it in under 5 seconds (excluding typing time).
-   **SC-002**: Image viewer opens instantly (< 100ms response).
-   **SC-003**: 100% of edits persist to LocalStorage and survive a page reload.
