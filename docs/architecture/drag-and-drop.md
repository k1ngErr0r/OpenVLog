# Drag & Drop Enhancements Plan

## Goals
Improve UX for vulnerability management and file attachments via intuitive drag-and-drop interactions.

## Libraries
- `@dnd-kit/core` (modern, sensors, good accessibility) for reordering lists.
- `react-dropzone` for file uploads.

## Use Cases
1. Reorder columns or saved report definitions (future).
2. Drag files into Add/Edit Vulnerability form for attachment upload.
3. (Optional) Drag vulnerabilities between status lanes (kanban view future feature).

## File Attachment Flow
- Dropzone component wraps attachment area.
- On drop: validate size/type, show preview list, upload sequentially or in parallel with progress.
- Backend: Add endpoint `POST /api/vulnerabilities/:id/attachments` (multipart/form-data).

## DnD Kit Integration Sketch
```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
    {ids.map(id => <Row key={id} id={id} />)}
  </SortableContext>
</DndContext>
```

## Accessibility
- Provide keyboard drag: space to pick, arrows to move, space to drop.

## Data Persistence
- On reorder, PATCH order indices to backend (batch) or store preference per user.

## Edge Cases
- Large file rejection (show message).
- Concurrent uploads: limit concurrency (e.g., 3 at a time).
- Drag leaving window cancels highlight.

## Future Enhancements
- Kanban board with swimlanes by status.
- Bulk drag selection (shift select then drag group).
