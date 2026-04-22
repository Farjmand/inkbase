# inkbase Roadmap 🖋

> Local-first workspace. Notion's soul, Obsidian's freedom.

---

## Phase 1 — The Skeleton *(current)*

Core app infrastructure. The baby learns to walk.

- [x] Vite + React + TypeScript scaffold
- [x] Tailwind CSS + BlockNote editor
- [x] File System Access API integration (open folder as vault)
- [x] Page tree in sidebar (nested, collapsible)
- [x] Create / delete pages
- [x] BlockNote block editor per page
- [x] Debounced auto-save (title + content → .md files)
- [x] Frontmatter-based metadata (id, title, icon, cover, parentId)
- [ ] Inline title rename in sidebar
- [ ] Drag-and-drop page reordering in sidebar
- [ ] Welcome screen polish

---

## Phase 2 — The Notion Glow-Up

Visual identity. The baby gets a wardrobe.

- [ ] Page cover: solid color picker
- [ ] Page cover: image URL input
- [ ] Page cover: unsplash random image picker
- [ ] Emoji icon picker (twemoji-based)
- [ ] Cover + icon shown in sidebar item
- [ ] Page header: change icon / change cover buttons (Notion-style hover)
- [ ] Extra block types: callout, toggle, divider, columns
- [ ] Dark mode support

---

## Phase 3 — Databases

The crown jewel. Notion's most-missed feature, now local.

- [ ] Database page type (special frontmatter)
- [ ] Define database schema (property columns: text, select, date, checkbox, number)
- [ ] Table view — inline editing cells
- [ ] Kanban view — drag cards between status columns
- [ ] Calendar view — date property drives placement
- [ ] Filter rows/cards by property
- [ ] Sort by property
- [ ] Inline database reference in a regular page

---

## Phase 4 — The Obsidian Brain

Knowledge graph. The baby becomes a philosopher.

- [ ] `[[wikilink]]` support in editor
- [ ] Backlinks panel (which pages link to this one)
- [ ] Tag system (`#tag` in frontmatter + tag sidebar)
- [ ] Full-text search (across all .md files in vault)
- [ ] Graph view (force-directed, page connections)

---

## Phase 5 — Go Native

Ship it to the desktop. The baby leaves the nest.

- [ ] Electron wrapper (web app embedded)
- [ ] Native file system (replace File System Access API with Node fs)
- [ ] Native file watcher (auto-reload on external edits)
- [ ] System tray + global shortcut to open
- [ ] Auto-update via GitHub releases
- [ ] Windows + macOS + Linux builds via GitHub Actions

---

## Tech Debt / Ongoing

- [ ] Replace `gray-matter` with browser-native YAML parser (remove eval warning)
- [ ] Code-split BlockNote for faster initial load
- [ ] Unit tests for `lib/fs.ts` (serialize/deserialize roundtrip)
- [ ] E2E tests for page CRUD (Playwright)
