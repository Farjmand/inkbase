# Inkbase — Project Guidelines

## Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Editor**: BlockNote (rich-text block editor)
- **UI**: Mantine + Tailwind CSS
- **State**: Zustand stores (`src/store/`)
- **Storage**: File System Access API (`src/lib/fs.ts`)
- **Types**: Central definitions in `src/types/index.ts`

## Architecture — Hexagonal (Ports & Adapters)

Structure code around a clear boundary between domain logic and infrastructure:

```
Domain (core)          Ports (interfaces)       Adapters (implementations)
─────────────          ──────────────────       ─────────────────────────
src/store/             src/types/index.ts       src/lib/fs.ts  (FS API)
src/hooks/             (IVaultStore, etc.)      components/    (UI layer)
```

- **Domain logic** lives in stores and hooks — no direct DOM or FS calls
- **Ports** are TypeScript interfaces in `src/types/index.ts`
- **Adapters** are the concrete implementations (FS, UI components)
- Components must NOT reach into other components' stores directly; go through the port interface

## Clean Code Rules

- Functions do one thing; if it needs a comment to explain *what* it does, split it
- Names are full words that express intent (`openVault`, not `doOpen`)
- No functions longer than 40 lines — extract named helpers instead
- No files longer than 300 lines — split by responsibility
- Delete dead code; don't comment it out
- No magic numbers or strings — name constants at the top of the file
- Avoid deep nesting (>3 levels) — use early returns and guard clauses

## Code Smell Checklist

Before every commit, check for:
- [ ] God components (>300 lines, multiple responsibilities) → split
- [ ] Prop drilling >2 levels → lift to store or context
- [ ] Duplicate logic across components → extract hook or utility
- [ ] Circular store dependencies → use event bus or restructure
- [ ] Shared mutable timers/refs across store slices → scope them locally
- [ ] `any` types → replace with proper interfaces
- [ ] Inline styles mixed with Tailwind → pick one system per component
- [ ] Missing error boundaries around async/FS operations

## TDD Principles

- Write the test first, then the minimal implementation to pass it
- Unit tests cover pure functions in `src/lib/` and store actions
- Integration tests cover hook + store interactions
- Component tests use React Testing Library — test behavior, not implementation
- No snapshot tests for logic-heavy components
- Test file lives next to the source file: `foo.ts` → `foo.test.ts`
- A failing test is a feature request; a passing test is a contract

## Commit & PR Conventions

Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`

- One logical change per commit
- PR title ≤ 70 chars
- Every PR must include a test for new behavior

## What NOT to Do

- Don't add features beyond what the task requires
- Don't add error handling for impossible cases
- Don't mock the File System API in unit tests — use integration tests with a real origin private FS or a test harness
- Don't bypass TypeScript with `as any` or `@ts-ignore` without a documented reason
- Don't import from sibling store files — go through the shared type interfaces
