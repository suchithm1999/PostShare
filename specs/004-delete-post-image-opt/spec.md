# Feature Specification: Delete Post & Image Optimization

**Feature Branch**: `004-delete-post-image-opt`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Add functionality to delete single feed, also if the image is of larger size convert it to small size as possible and if that doesn't work show error else use the converted image"

## Clarifications
### Session 2025-12-25
- Q: "convert it to small size as possible" - what is the target? → A: Attempt to compress the image to retain maximum quality while ensuring it stays just under the 300KB limit (e.g., target ~250-290KB).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Single Post (Priority: P1)

As a user, I want to delete my individual posts from the feed so that I can remove content I no longer want to share.

**Why this priority**: Core content management functionality requested explicitly.

**Independent Test**: Create a post, see it in the feed, click delete, confirm, and verify it disappears without affecting other posts.

**Acceptance Scenarios**:

1. **Given** a post in the feed, **When** I click the delete button, **Then** a confirmation dialog appears.
2. **Given** the confirmation dialog, **When** I confirm, **Then** the post is removed from the view and storage immediately.
3. **Given** the confirmation dialog, **When** I cancel, **Then** the post remains in the feed.

---

### User Story 2 - Image Optimization & Resizing (Priority: P1)

As a user, I want the system to automatically compress or resize my large images so that I can upload photos without worrying about exact file size limits.

**Why this priority**: Improves usability by handling the "300KB limit" friction point automatically, fulfilling the request to "convert it".

**Independent Test**: Upload a file > 300KB (e.g., 2MB high-res photo) and verify it is accepted and displayed, or an error is shown if compression fails.

**Acceptance Scenarios**:

1. **Given** an image file larger than the limit (300KB), **When** I select it for upload, **Then** the system attempts to resize/compress it to below the limit.
2. **Given** successful compression, **When** the process finishes, **Then** the resized image is attached to the post draft.
3. **Given** compression fails or remains > 300KB, **When** the process finishes, **Then** an error message is displayed (as per existing behavior).
4. **Given** an image processing action, **When** it is running, **Then** a loading indicator or "Compressing..." state is visible.

### Edge Cases

- **Compression Quality**: Ensure resizing doesn't make the image illegible.
- **File Types**: Only attempt to resize supported image types (JPEG, PNG, WEBP).
- **Zero/Deleted Posts**: Deleting the last post should show the "empty feed" state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Delete" button on every post card in the feed.
- **FR-002**: System MUST require user confirmation (native dialog or custom modal) before deleting a post.
- **FR-003**: System MUST identify image uploads exceeding the defined size limit (currently 300KB).
- **FR-004**: System MUST attempt to compress/resize oversized images to fit within the 300KB limit while maintaining maximum possible visual quality (not aggressively shrinking to smallest size).
- **FR-005**: System MUST fallback to showing an error if the image cannot be compressed below the limit.
- **FR-006**: System MUST persist the specific post deletion to LocalStorage (updating the `static_blog_posts` array).

### Key Entities

- **Post**: Existing entity, no changes to schema, but items will be removed from the collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Deleting a post completes (updates UI) in under 200ms.
- **SC-002**: Users can successfully upload a typical smartphone photo (e.g., 2-4MB jpeg) without manual resizing (success rate > 90% for standard photos).
- **SC-003**: Application storage usage is optimized by storing only compressed images.
