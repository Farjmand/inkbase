# inkbase Roadmap 🖋

> Local-first workspace. Notion's soul, Obsidian's freedom.

---

## Phase 1 — The Skeleton *(done)*

Core app infrastructure. The baby learns to walk.

- [x] Vite + React + TypeScript scaffold
- [x] Tailwind CSS + BlockNote editor
- [x] File System Access API integration (open folder as vault)
- [x] Page tree in sidebar (nested, collapsible)
- [x] Create / delete pages
- [x] BlockNote block editor per page
- [x] Debounced auto-save (title + content → .md files)
- [x] Frontmatter-based metadata (id, title, icon, cover, parentId)
- [x] Inline title rename in sidebar (double-click)
- [ ] Drag-and-drop page reordering in sidebar
- [ ] Welcome screen polish

---

## Phase 2 — The Notion Glow-Up *(done)*

Visual identity. The baby gets a wardrobe.

- [x] Page cover: solid color picker
- [x] Page cover: image URL input
- [x] Page cover: random image picker (picsum.photos gallery)
- [x] Emoji icon picker (category grid, 9 categories)
- [x] Cover color dot shown in sidebar item
- [x] Page header: change icon / change cover buttons (Notion-style hover)
- [x] Dark mode support (toggle in sidebar, persisted to localStorage)
- [ ] Extra block types: callout, toggle, divider, columns (deferred — needs markdown persistence)

---

## Phase 3 — Databases *(done)*

The crown jewel. Notion's most-missed feature, now local.

- [x] Database page type (special frontmatter, `type: database`)
- [x] Define database schema (property columns: text, select, date, checkbox, number)
- [x] Table view — inline editing cells
- [x] Add / delete rows
- [x] Add / rename / delete / retype columns
- [x] Select property: create options on the fly
- [x] Rows persisted as individual `.md` files (`row_*.md`)
- [ ] Kanban view — drag cards between status columns
- [ ] Calendar view — date property drives placement
- [ ] Filter rows by property value
- [ ] Sort by property

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
