#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# inkbase — GitHub Project + Issues setup
# Run AFTER you've pushed the repo to GitHub.
#
# Prerequisites:
#   brew install gh
#   gh auth login
#
# Usage:
#   chmod +x scripts/setup-github-project.sh
#   GITHUB_USER=your-username ./scripts/setup-github-project.sh
# ─────────────────────────────────────────────────────────────────────────────

REPO="${GITHUB_USER:-YOUR_USERNAME}/inkbase"
echo "🖋  Setting up inkbase GitHub Project for: $REPO"
echo ""

# ── Create labels ──────────────────────────────────────────────────────────

echo "Creating labels..."
gh label create "phase-1" --color "0075ca" --description "Phase 1: The Skeleton" --repo "$REPO" 2>/dev/null || true
gh label create "phase-2" --color "7057ff" --description "Phase 2: The Notion Glow-Up" --repo "$REPO" 2>/dev/null || true
gh label create "phase-3" --color "e4e669" --description "Phase 3: Databases" --repo "$REPO" 2>/dev/null || true
gh label create "phase-4" --color "0e8a16" --description "Phase 4: The Obsidian Brain" --repo "$REPO" 2>/dev/null || true
gh label create "phase-5" --color "d93f0b" --description "Phase 5: Go Native" --repo "$REPO" 2>/dev/null || true
gh label create "tech-debt" --color "ee0701" --description "Tech debt & cleanup" --repo "$REPO" 2>/dev/null || true

# ── Create GitHub Project (v2) ─────────────────────────────────────────────

echo "Creating GitHub Project board..."
PROJECT_URL=$(gh project create --owner "${GITHUB_USER:-YOUR_USERNAME}" --title "inkbase Roadmap" --format json | jq -r '.url')
echo "  ✅ Project: $PROJECT_URL"

# ── Phase 1 Issues ─────────────────────────────────────────────────────────

echo ""
echo "Creating Phase 1 issues..."

gh issue create --repo "$REPO" --label "phase-1" \
  --title "Inline title rename in sidebar" \
  --body "Double-click a page title in the sidebar to rename it inline, without opening the page."

gh issue create --repo "$REPO" --label "phase-1" \
  --title "Drag-and-drop page reordering in sidebar" \
  --body "Drag pages up/down in the sidebar to reorder them. Drag onto another page to nest as a child."

gh issue create --repo "$REPO" --label "phase-1" \
  --title "Welcome screen polish" \
  --body "Improve the welcome screen with a recent vaults list, keyboard shortcut hints, and a sample vault option."

# ── Phase 2 Issues ─────────────────────────────────────────────────────────

echo "Creating Phase 2 issues..."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Page cover: solid color picker" \
  --body "Allow users to pick a solid hex color as the page cover, shown as a full-width banner above the title."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Page cover: image URL input" \
  --body "Allow pasting an image URL as a page cover. Store the URL in frontmatter under the 'cover' key."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Page cover: Unsplash random image picker" \
  --body "Add a button to pull a random royalty-free cover from Unsplash, using their API (no key needed for small traffic)."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Emoji icon picker" \
  --body "Click the page icon to open an emoji picker. Selected emoji is stored in frontmatter as 'icon'."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Page header hover actions (change icon / change cover)" \
  --body "On hover over the page header area, show ghost buttons for 'Change icon' and 'Change cover', exactly like Notion."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Extra block types: callout, toggle, divider, columns" \
  --body "Extend BlockNote with custom block types: callout (colored box with icon), toggle (collapsible), horizontal divider, and 2-column layout."

gh issue create --repo "$REPO" --label "phase-2" \
  --title "Dark mode support" \
  --body "Add a dark mode toggle. Store preference in localStorage. Theme applied via CSS variables."

# ── Phase 3 Issues ─────────────────────────────────────────────────────────

echo "Creating Phase 3 issues..."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Database page type + schema definition" \
  --body "New page type 'database' with a schema stored in frontmatter. Schema defines columns: name, type (text | select | date | checkbox | number)."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Database: Table view" \
  --body "Render database entries as an editable table. Clicking a cell edits inline. Clicking the row title opens the page."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Database: Kanban view" \
  --body "Render database entries as a kanban board grouped by a 'select' property. Drag cards between columns to update the property."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Database: Calendar view" \
  --body "Render database entries on a monthly calendar grid, positioned by a chosen 'date' property."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Database: Filter + sort" \
  --body "Add filter (property = value) and sort (by property, asc/desc) controls above database views."

gh issue create --repo "$REPO" --label "phase-3" \
  --title "Inline database reference in a page" \
  --body "Allow embedding a database view inside a regular page using a /database block command."

# ── Phase 4 Issues ─────────────────────────────────────────────────────────

echo "Creating Phase 4 issues..."

gh issue create --repo "$REPO" --label "phase-4" \
  --title "[[wikilink]] support in editor" \
  --body "Parse [[PageTitle]] syntax in the BlockNote editor and render as clickable links to pages in the vault."

gh issue create --repo "$REPO" --label "phase-4" \
  --title "Backlinks panel" \
  --body "Show a panel at the bottom of each page listing all other pages that link to the current one via [[wikilinks]]."

gh issue create --repo "$REPO" --label "phase-4" \
  --title "Tag system (#tag in frontmatter + tag sidebar)" \
  --body "Support tags in frontmatter. Show a Tags section in the sidebar listing all unique tags with page counts."

gh issue create --repo "$REPO" --label "phase-4" \
  --title "Full-text search" \
  --body "Cmd+K search palette that searches across all .md file titles and content in the vault. Fast, local, no index server."

gh issue create --repo "$REPO" --label "phase-4" \
  --title "Graph view" \
  --body "Force-directed graph showing pages as nodes and [[wikilinks]] as edges. Clickable nodes navigate to pages."

# ── Phase 5 Issues ─────────────────────────────────────────────────────────

echo "Creating Phase 5 issues..."

gh issue create --repo "$REPO" --label "phase-5" \
  --title "Electron wrapper" \
  --body "Wrap the Vite web app in Electron. Replace File System Access API with Node.js fs module."

gh issue create --repo "$REPO" --label "phase-5" \
  --title "Native file watcher" \
  --body "Watch the vault directory for external changes (edits in other editors) and auto-reload affected pages."

gh issue create --repo "$REPO" --label "phase-5" \
  --title "System tray + global shortcut" \
  --body "Add a system tray icon and a configurable global shortcut (e.g. Cmd+Shift+I) to open inkbase from anywhere."

gh issue create --repo "$REPO" --label "phase-5" \
  --title "GitHub Actions release pipeline (Win + Mac + Linux)" \
  --body "CI/CD workflow that builds Electron distributable for all 3 platforms on every tagged release."

# ── Tech Debt Issues ────────────────────────────────────────────────────────

echo "Creating tech debt issues..."

gh issue create --repo "$REPO" --label "tech-debt" \
  --title "Replace gray-matter with browser-native YAML parser" \
  --body "gray-matter uses eval() internally and bundles Node.js builtins. Replace with a minimal browser-safe YAML parser (e.g. yaml package) to clean up build warnings."

gh issue create --repo "$REPO" --label "tech-debt" \
  --title "Code-split BlockNote for faster initial load" \
  --body "BlockNote adds ~1MB to the bundle. Use dynamic import() to lazy-load it only when a page is opened."

gh issue create --repo "$REPO" --label "tech-debt" \
  --title "Unit tests for lib/fs.ts" \
  --body "Test pageToMarkdown/markdownToPage roundtrip, buildPageTree nesting logic, and createNewPage defaults using Vitest."

gh issue create --repo "$REPO" --label "tech-debt" \
  --title "E2E tests with Playwright" \
  --body "Playwright tests covering: open vault, create page, type content, verify .md file written to disk, delete page."

echo ""
echo "🎉 All done! Visit your project board at: $PROJECT_URL"
echo "   Don't forget to add issues to the project board from the UI."
