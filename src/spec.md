# StoryMesh

## Overview

StoryMesh is a networked writing workspace for worldbuilders, fiction writers, and knowledge workers who need to organize interconnected ideas. Built on the Internet Computer with Internet Identity authentication, it combines a markdown editor with wiki-style linking, tag-based organization, version history, and an interactive 3D knowledge graph. Each user's documents are fully isolated and stored on-chain.

## Authentication

- Users authenticate via Internet Identity
- Anonymous principals are rejected on all endpoints
- All data is isolated per user principal — users can only access their own documents, tags, and versions
- Users must set a display name (profile) on first login before accessing the workspace
- Profile name is required (max 100 characters, cannot be empty)

## Core Features

### Documents

Users can create, edit, and delete markdown documents:

- **Title**: Required, max 200 characters
- **Content**: Markdown text, max 100,000 characters
- **Tags**: Up to 20 tags per document
- **Timestamps**: Created-at and updated-at (nanosecond precision)
- **Limit**: 500 documents per user

Creating a document initializes it with an empty title ("Untitled") and empty content.

### Wiki-Links

Documents can reference each other using `[[Document Title]]` syntax:

- The backend parses content for `[[...]]` patterns to build a link graph
- Link targets are matched case-insensitively against document titles
- Individual link text is capped at 200 characters
- In the editor, typing `[[` triggers an autocomplete dropdown showing matching documents (max 8 results, case-insensitive filtering)
- Autocomplete supports keyboard navigation (arrow keys, Enter/Tab to select, Escape to dismiss)
- In preview mode, wiki-links render as clickable anchors that navigate to the target document

### Backlinks

- Any document can query which other documents link to it
- Backlinks are resolved at query time via case-insensitive title matching
- Displayed in a collapsible panel at the bottom of the editor
- Each backlink shows the source document's ID and title

### Autosave

- Content is autosaved 2 seconds after the user stops typing
- Manual save via Ctrl/Cmd+S or the toolbar save button
- Save status indicator shows "Saving...", "Saved", or "Edited X ago"

### Version History

- Users can manually save a named version snapshot of any document
- Each document retains up to 10 versions (oldest are trimmed automatically)
- Versions capture the document's title and content at save time
- Users can restore any version, which overwrites the current document state
- Restore requires confirmation via dialog
- Versions are displayed in reverse chronological order with format "Title — MMM d, yyyy h:mm a"

### Tags

Users can create and manage tags to categorize documents:

- **Name**: Required, max 50 characters
- **Color**: Required, max 20 characters (one of 10 preset colors: gray, red, orange, amber, green, teal, blue, indigo, purple, pink)
- **Limit**: 50 tags per user

Tag operations:

- Create tag with name and color
- Edit tag name and color inline
- Delete tag — removes the tag from all documents that reference it
- Assign/remove tags on documents via checkbox popover

### Search and Filtering

- **Text search**: Case-insensitive search across document titles and content, debounced at 300ms
- **Tag filtering**: AND logic — documents must have all selected filter tags
- **Sort options**: Last updated (default), Title A–Z, Title Z–A, Oldest first
- Search, sort, and filter preferences (sort order, sidebar state) are persisted locally via Zustand

### Knowledge Graph

An interactive visualization of the document network:

- Nodes represent documents; edges represent wiki-link connections between them
- Built with D3.js force simulation
- Force-directed layout:
  - Charge force (node repulsion)
  - Link force (spring attraction)
  - Collision detection
  - Center gravity
- Interactions: pan, zoom (mouse wheel), click node to open document
- Hover highlights the hovered node plus all connected nodes and edges
- Empty state message when no documents exist
- Edges are deduplicated (only one edge per pair of linked documents)

### Export

- **Single document**: Download as `.md` file with the document title as filename
- **All documents**: Export all documents as a `storymesh-export.zip` file (uses JSZip via CDN)
- Bulk export requires confirmation via AlertDialog

## Backend Data Storage

- **Profiles**: Store user display names keyed by Internet Identity principal
- **Documents**: Store per-user documents with title, markdown content, tag associations, and created/updated timestamps
- **Document Versions**: Store version snapshots per document capturing title and content at save time, capped at 10 versions per document
- **Tags**: Store per-user tags with name and color
- All state persists automatically across canister upgrades

## Backend Operations

### Authentication

Every endpoint calls `requireAuth(caller)` which traps if the caller is anonymous.

### Input Validation

- Profile name: must be non-empty and at most 100 characters
- Document title: must be at most 200 characters
- Document content: must be at most 100,000 characters
- Tag name: must be non-empty and at most 50 characters
- Tag color: must be non-empty and at most 20 characters
- Document count: traps if user already has 500 documents
- Tag count: traps if user already has 50 tags
- Tags per document: traps if more than 20 tag IDs are provided

### Error Handling

All errors use `Runtime.trap()` with descriptive messages:

- `"Not authenticated"` — anonymous caller
- `"Name cannot be empty"` / `"Name must be 100 characters or fewer"` — profile validation
- `"Title must be 200 characters or fewer"` — document title limit
- `"Content must be 100000 characters or fewer"` — content limit
- `"Maximum of 500 documents reached"` — document limit
- `"Document not found"` — invalid document ID
- `"Tag name cannot be empty"` / `"Tag name must be 50 characters or fewer"` — tag validation
- `"Maximum of 50 tags reached"` — tag limit
- `"Tag not found"` — invalid tag ID
- `"Version index out of range"` — invalid version restore index
- `"No versions saved for this document"` — restore with no versions

### Delete Behavior

- **Delete document**: Removes the document and all its saved versions
- **Delete tag**: Removes the tag and strips it from the `tagIds` array of every document belonging to that user

## User Interface

### Layout

- **Sidebar** (left): Document list with search, sort/filter, quick actions
  - Desktop: Collapsible between 60px (icon-only) and 240px (full). State is persisted
  - Mobile: Opens as a Sheet overlay
- **Main panel** (right): Document editor or graph view

### Sidebar Components

- **Brand header**: App name and tagline
- **Quick actions toolbar**: New document, Search, Filter, Graph view, Export all
- **Sort/filter bar**: Collapsible panel with sort dropdown and tag filter checkboxes
- **Document list**: Shows title, truncated content preview, relative time, and tag badges
- **Profile footer**: User name display with edit option, logout button

### Editor Panel

- **Toolbar**: Title input, view mode toggle (edit/preview/split), tag assignment, version history, export, delete
- **Editor area**: Plain textarea with wiki-link autocomplete
- **Preview area**: Rendered markdown with clickable wiki-links
- **Backlinks panel**: Collapsible section at the bottom listing documents that link to the current one
- **Character limit enforcement**: Toast notification when title or content exceeds limits

### Dialogs and Modals

- **Profile setup**: Required on first login, optional edit later. Cannot be dismissed on first setup
- **Tag management**: Full CRUD for tags with color picker (10 preset colors)
- **Version history**: Right-side Sheet with version list and restore confirmation
- **Delete document**: AlertDialog with loading state
- **Export all**: AlertDialog confirmation before ZIP generation
- **Restore version**: AlertDialog confirmation

### Empty States

- No documents: Centered message with "Create your first document" button
- Graph view with no documents: "Create some documents to see your knowledge graph"

## Design System

### Visual Approach

- Warm, literary aesthetic suited for writers and worldbuilders
- Light theme: Off-white background (`#faf9f6`), blue-purple primary (`#5b6abf`)
- Dark theme: Near-black background (`#1c1c1c`), lighter primary (`#7b8ad9`)
- Subtle shadows and rounded corners throughout

### Typography

- **Sans-serif**: Inter (body text, UI elements)
- **Serif**: Noto Serif Georgian (editor content)
- **Monospace**: JetBrains Mono (code blocks)
- **Display**: Bricolage Grotesque (logo, headings)

### Custom Animations

- `page-fade-in`: Fade-in on page load
- `search-expand` / `search-collapse`: Search input open/close
- `filter-slide-down` / `filter-slide-up`: Filter panel expand/collapse

### Responsive Behavior

- Mobile breakpoint uses Sheet overlay for sidebar
- Desktop uses collapsible sidebar with persistent state
- Editor/preview split view collapses to single pane on narrow screens

## CDN Dependencies

- **D3.js** — Force-directed graph simulation and rendering for the knowledge graph
- **marked.js** — Markdown parsing for document preview rendering
- **JSZip** — ZIP file generation for bulk document export

## Error Handling

### Authentication Errors

- Anonymous users are trapped at the backend level
- Frontend shows landing page for unauthenticated users

### Validation Errors

- Character limits enforced on both frontend (toast warnings, input constraints) and backend (traps)
- Document and tag count limits enforced at the backend

### Mutation Errors

- All mutations show error state via toast notifications or inline error messages
- Delete and restore operations require confirmation dialogs with loading states
- AlertDialog buttons are disabled during pending mutations

### Not Found Errors

- Document not found: Backend traps with descriptive message
- Wiki-link target not found: Preview shows "Document not found" toast on click
