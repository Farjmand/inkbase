# 🖋 inkbase

> **Local-first workspace — Notion's soul, Obsidian's freedom.**

inkbase is an open-source note-taking and database app that runs entirely in your browser with zero backend. Your notes live as plain `.md` files on your own machine — no subscription, no sync fees, no vendor lock-in.

---

## The Problem

Notion is powerful but your data lives on their servers. Obsidian keeps files local but lacks databases and structured views. inkbase bridges the gap: block editing, per-page covers and icons, and full relational databases — all stored as markdown files you own.

---

## Key Features

### Rich Block Editor
- Notion-style block editing powered by [BlockNote](https://www.blocknotejs.org/)
- Nested pages with collapsible sidebar tree
- Auto-save with debounce (no manual Ctrl+S)
- Per-page emoji icons and cover images (solid colors, image URLs, random gallery)
- Dark / light mode, persisted across sessions

### Local-First Databases *(Phase 3 — just shipped)*
- Create structured databases alongside regular pages
- Define custom column schemas: **Text · Number · Select · Date · Checkbox**
- Inline cell editing — click any cell to edit, blur to save
- Select columns with on-the-fly option creation
- Add, rename, retype, or delete columns at any time
- Each row persisted as its own `.md` file — survives forever in plain text

### Zero Backend Architecture
- Uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) (Chrome/Edge)
- "Open a folder as vault" — pick any directory, files stay there
- No server, no database, no auth — just files

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 19 + TypeScript | Type-safe, component-driven UI |
| Build | Vite 8 | Sub-second HMR, fast production builds |
| Editor | BlockNote 0.48 | Extensible block editor with Notion UX |
| Styling | Tailwind CSS v4 | Utility-first, dark mode via CSS vars |
| State | Zustand 5 | Minimal, composable stores — no boilerplate |
| Persistence | File System Access API | True local files, no sync needed |
| Serialization | gray-matter | Frontmatter + markdown body per page |

---

## Architecture

```
src/
├── lib/
│   └── fs.ts               # All disk I/O — File System Access API wrapper
│                           # Swap to Node fs here for Electron later
├── store/
│   ├── vaultStore.ts       # Vault state: pages, active page, CRUD
│   └── databaseStore.ts    # Database state: rows, columns, inline edits
├── types/
│   └── index.ts            # Page, DatabaseRow, PropertyDef — shared contracts
└── components/
    ├── sidebar/            # Sidebar nav, nested page tree, rename
    ├── editor/             # BlockNote integration, page header, cover/icon pickers
    └── database/           # TableView, PropertyCell (5 types), ColumnMenu, AddColumnModal
```

**Storage model:**
- Pages and databases → `{id}.md` (frontmatter + markdown body)
- Database rows → `row_{id}.md` (frontmatter only, `properties` key holds cell values)
- Database schema → stored in the parent database page's frontmatter as a `schema` array

---

## Getting Started

Requires Chrome or Edge (File System Access API).

```bash
git clone https://github.com/your-username/inkbase
cd inkbase
npm install
npm run dev
```

Open `http://localhost:5173`, click **"Open a folder as vault"**, and pick any folder on your machine.

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — Skeleton | ✅ Done | Vite scaffold, block editor, file CRUD, page tree |
| 2 — Glow-Up | ✅ Done | Covers, icons, dark mode, Notion-style header |
| 3 — Databases | ✅ Done | Table view, 5 property types, inline editing, row files |
| 4 — Obsidian Brain | 🔜 Next | Wikilinks, backlinks, tags, full-text search, graph view |
| 5 — Native | 🔜 Planned | Electron wrapper, native fs, auto-update, tray |

Full details in [ROADMAP.md](./ROADMAP.md).

---

## License

MIT — do whatever you want with it.
