---
description: "Task list for feature implementation"
---

# Tasks: Visual Design Polish

**Input**: Design documents from `/specs/004-visual-design-polish/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no data-model.md or contracts/ —
this feature is presentation-only, per plan.md)

**Tests**: This feature touches no `src/core/` logic, so the constitution's Test-First mandate
does not apply to new core tests. Existing tests must keep passing per SC-005; a small number are
updated where their *scoping* depends on a CSS class this feature removes (research.md #4), and a
few new light component tests cover the two genuinely new UI pieces (`GraphLegend`, empty states).

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story. This feature restyles the existing
`001-project-workspace` / `002-task-dependency-map` / `003-requirement-impact-analysis` codebase
in place — every file below already exists unless marked "(new)".

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path

## Path Conventions

Continues the single frontend project at the repository root: `src/components/`, `src/index.css`,
`vite.config.ts`. No `src/core/` or `src/state/` file is touched by this feature.

---

## Phase 1: Setup

**Purpose**: Bring in Tailwind and make its utilities available across the app, per the
clarification decision and research.md #1-#3. Nothing visual changes yet.

- [X] T001 Add `tailwindcss` and `@tailwindcss/vite` as dev dependencies (`package.json`), then
      `npm install`; add the `tailwindcss()` plugin to `vite.config.ts`
- [X] T002 In `src/index.css`, add `@import "tailwindcss";` and a `@theme` block defining the
      design tokens from research.md #2: a `brand` color mapped from the existing accent hue, a
      `slate` neutral scale for the corporate/structured backgrounds and borders, and the
      semantic scales already in use for task status (`emerald`/`amber`/`slate`) and graph-node
      relations (`rose`/`orange`/`sky`/`pink`); keep only the global, non-component-specific rules
      (e.g., `body` margin, `#root` sizing) alongside it for now
- [X] T003 Run `npm run build` and `npm run test` to confirm Tailwind is wired up correctly with
      zero visual or functional change yet (utilities available but not yet used anywhere)

**Checkpoint**: Tailwind utilities are available; the app looks and behaves exactly as before.

---

## Phase 2: Foundational

No tasks — Phase 1 already covers this feature's only cross-cutting blocking prerequisite
(Tailwind being installed and configured). Story work begins directly at Phase 3.

---

## Phase 3: User Story 1 - Find Your Way Around at a Glance (Priority: P1) 🎯 MVP

**Goal**: The three-view navigation is visually unmistakable — a first-time user can always tell
which view is active and how to switch to another.

**Independent Test**: Show the app to someone unfamiliar with it and confirm they can name all
three views and switch to any one within a few seconds, always able to tell which is active (even
while the rest of the app still uses its pre-existing styling).

### Implementation for User Story 1

- [X] T004 [US1] Restyle the view-toggle `<nav>` in `src/components/Workspace.tsx` with Tailwind
      utilities: a clearly distinct active-tab appearance (background/border/font-weight), and
      visible hover/focus states on every button; remove the corresponding
      `.workspace__view-toggle*` rules from `src/components/Workspace.css`
- [X] T005 [P] [US1] Verify (and extend if not already covered) `src/components/Workspace.test.tsx`
      to assert that exactly one nav button has `aria-pressed="true"` at a time and that clicking
      a different button moves that state to it — confirming FR-001's "always obvious which view
      is active" holds after the restyle (depends on T004)

**Checkpoint**: Navigation is unmistakable and independently demoable — the rest of the app may
still be on its previous styling at this point, which is expected mid-migration.

---

## Phase 4: User Story 2 - Understand Information at a Glance (Priority: P2)

**Goal**: Every panel, list, form, and graph presents its content with clear hierarchy; every
color-coded status/priority/risk/relation indicator has a visible text label or legend; every
empty list shows a friendly message.

**Independent Test**: Show a screen with color-coded items (task statuses, risk levels, or a
graph view) to someone unfamiliar with the system and confirm they can correctly state what each
color/label means using only what's on screen; confirm an empty list shows a clear message rather
than a blank area.

### Implementation for User Story 2

- [X] T006 [P] [US2] Create `src/components/GraphLegend.tsx` (new): a small reusable component
      taking a list of `{ swatchClassName: string; label: string }` entries and rendering a
      labeled color-key, styled with Tailwind
- [X] T007 [US2] Add a `data-testid="dependency-map-graph"` attribute to the graph pane container
      in `src/components/DependencyMap.tsx`, and update `src/components/DependencyMap.test.tsx` to
      scope its graph-node queries via that `data-testid` instead of the `.dependency-map__graph`
      class (research.md #4) — do this before T009 removes that class's styling role
- [X] T008 [US2] Restyle `src/components/TaskNode.tsx` with Tailwind: keep the existing status
      label and add a clearly distinct look (border/background) for each `TaskNodeRelation`
      value; remove `src/components/TaskNode.css`
- [X] T009 [US2] Restyle `src/components/DependencyMap.tsx` with Tailwind (graph pane, detail
      panel, create-dependency form, error message) and render `<GraphLegend>` describing the
      selected/dependency/dependent/unrelated relations; remove
      `src/components/DependencyMap.css` (depends on T006, T007, T008)
- [X] T010 [US2] Restyle `src/components/ImpactMap.tsx` with Tailwind and render `<GraphLegend>`
      describing the direct/indirect/unaffected relations; remove
      `src/components/ImpactMap.css` (depends on T006, T008)
- [X] T011 [US2] Restyle `src/components/ImpactReport.tsx` with Tailwind: summary stats, a
      colored-and-labeled risk-level badge, and the per-task reason list with a clear visual
      distinction between direct and indirect entries
- [X] T012 [US2] Restyle `src/components/RequirementList.tsx` with Tailwind (panel, add-form,
      rows, priority/status badges) and add an empty-state message ("No requirements yet.") shown
      when `project.requirements` is empty
- [X] T013 [US2] Restyle `src/components/TaskList.tsx` with Tailwind (panel, create-form, rows,
      status badge, association controls) and add an empty-state message ("No tasks yet.") shown
      when `project.tasks` is empty
- [X] T014 [US2] Restyle `src/components/ChangeHistory.tsx` with Tailwind (panel, rows,
      change-type badge) and add an empty-state message ("No requirement changes recorded yet.")
      shown when `project.requirementChanges` is empty
- [X] T015 [US2] [P] Restyle `src/components/ProjectHeader.tsx` with Tailwind (heading, fact
      list, progress figure)
- [X] T016 [US2] Restyle the remaining structural markup in `src/components/Workspace.tsx` (panel
      grid, impact-column layout) with Tailwind; delete `src/components/Workspace.css` once
      nothing in the file tree references it (depends on T004, T012, T013, T014)
- [X] T017 [P] [US2] Add `src/components/GraphLegend.test.tsx` (new) asserting every entry passed
      in renders its label; extend `RequirementList.test.tsx`, `TaskList.test.tsx` (if present —
      create if not), and `ChangeHistory.test.tsx` with a case asserting the empty-state message
      renders when the respective list is empty (depends on T006, T012, T013, T014)

**Checkpoint**: Every panel/list/graph is restyled with clear hierarchy, legends, text-labeled
indicators, and empty states; all four hand-written stylesheet files are gone.

---

## Phase 5: User Story 3 - Use the Application Comfortably at Different Window Sizes (Priority: P3)

**Goal**: All three views remain fully readable and operable at narrower window widths, reflowing
rather than clipping or requiring horizontal scrolling.

**Independent Test**: Narrow the browser window to a typical smaller-laptop width and confirm all
three views remain fully readable and operable, with layouts reflowing to a single column and
graphs resizing to fit.

### Implementation for User Story 3

- [X] T018 [US3] Adjust the panel grid in `src/components/Workspace.tsx` (both the
      Workspace-view and Requirement-Impact-view layouts) to use Tailwind responsive utilities so
      it reflows to a single column at narrow widths and multiple columns at wider ones (depends
      on T016) — done as part of T016 itself (`grid-cols-1 lg:grid-cols-2` on both panel grids),
      confirmed here rather than redone
- [X] T019 [US3] Adjust the graph/panel layout in `src/components/DependencyMap.tsx` and
      `src/components/ImpactMap.tsx` to reflow similarly at narrow widths, ensuring the graph pane
      resizes to fit its container instead of overflowing (depends on T009, T010) — done as part
      of T009 (`grid-cols-1 lg:grid-cols-[1fr_320px]`); `ImpactMap` is already single-column with
      a viewport-relative height (`h-[55vh]`), so it needed no grid change
- [X] T020 [P] [US3] Manually verify, at a narrow window width, that no element in any of the
      three views causes horizontal scrolling; adjust the responsible component(s) directly if any
      is found (depends on T018, T019) — verified by code audit: grepped `src/components/` for
      any fixed-pixel width or hardcoded large `w-` utility and found none; all sizing uses
      relative/Tailwind responsive units. The literal visual resize check was not performed (no
      browser tool available in this environment) — see quickstart.md's manual walkthrough

**Checkpoint**: All three user stories are complete — the application is navigable, legible, and
comfortable to use across common window widths.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [X] T021 [P] Confirm zero hand-written stylesheet files remain (`Workspace.css`,
      `DependencyMap.css`, `ImpactMap.css`, `TaskNode.css` all deleted) and that `src/core/*` and
      `src/state/*` remain completely untouched (constitution Principle I)
- [X] T022 Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [X] T023 Run `npm run test` and confirm the full suite — every existing `001`/`002`/`003`
      assertion — passes unchanged (SC-005)
- [X] T024 Walk through every scenario in `specs/004-visual-design-polish/quickstart.md` manually
      against `npm run dev`, including the responsive-width check and the functional-regression
      spot-check across all three prior features — dev server verified to boot with no runtime
      errors; the interactive click-through and visual/responsive review were not performed by the
      agent (no browser tool available in this environment) — automated coverage (83/83 tests,
      including a full Workspace-level add/edit/remove integration test) and the code-audit in
      T020 stand in for it, but a manual `npm run dev` pass is recommended before calling this
      shippable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. BLOCKS all user stories (Tailwind
  must be installed before any component can be restyled with it).
- **Foundational (Phase 2)**: No tasks.
- **User Story 1 (Phase 3)**: Depends on Setup only.
- **User Story 2 (Phase 4)**: Depends on Setup only; does not require US1 to be done first, but
  both eventually touch `Workspace.tsx` (US1's nav, US2's panel grid) and `Workspace.css` (fully
  removed only once both have landed — see T016).
- **User Story 3 (Phase 5)**: Depends on the specific components it adjusts already being
  migrated to Tailwind — `Workspace.tsx`'s panel grid (US2's T016) and the two map components
  (US2's T009/T010). This is a genuine ordering dependency, not just a suggestion: there is
  nothing to add responsive breakpoints to until the base Tailwind migration exists.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- `GraphLegend` (T006) and the `data-testid` decoupling (T007) land before the two map components
  that consume them (T009, T010).
- Each component's Tailwind restyle happens before its old CSS file is deleted; a stylesheet is
  only deleted once nothing in the tree imports it (T009, T010, T008, T016 each note this).
- Component tests are updated/added in the same task or immediately after the component change
  they cover.

### Parallel Opportunities

- T005 (US1 test) can proceed as soon as T004 lands.
- T006, T007, T008, T015 (US2) can all run in parallel — different files, no dependencies on each
  other. T009 and T010 can then run in parallel once their shared prerequisites (T006, T007/T008)
  are done. T012, T013, T014 can all run in parallel with each other and with T009/T010.
- T020 (US3) can run in parallel with a final read-through once T018/T019 land, since it's a
  verification-and-touch-up pass across both.

---

## Parallel Example: User Story 2

```bash
# Once Setup (Phase 1) is done, these can start in parallel:
Task: "Create shared GraphLegend component in src/components/GraphLegend.tsx"
Task: "Add data-testid to DependencyMap's graph pane and update its test"
Task: "Restyle TaskNode.tsx with Tailwind, remove TaskNode.css"
Task: "Restyle ProjectHeader.tsx with Tailwind"

# Once the above are done, these can run in parallel:
Task: "Restyle DependencyMap.tsx, render GraphLegend, remove DependencyMap.css"
Task: "Restyle ImpactMap.tsx, render GraphLegend, remove ImpactMap.css"
Task: "Restyle RequirementList.tsx, add empty state"
Task: "Restyle TaskList.tsx, add empty state"
Task: "Restyle ChangeHistory.tsx, add empty state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Tailwind installed and configured).
2. Complete Phase 3: User Story 1.
3. **STOP and VALIDATE**: confirm the navigation is unmistakable, even though the rest of the
   app still looks as it did before. This alone is a demoable improvement.

### Incremental Delivery

1. Setup → Tailwind ready, nothing looks different yet.
2. Add User Story 1 → validate independently → demo (navigation is now unmistakable).
3. Add User Story 2 → validate independently → demo (every view is legible, legended, and has
   empty states; all old CSS files are gone).
4. Add User Story 3 → validate independently → demo (comfortable at narrower window widths too).
5. Polish → final `npm run build` + full `npm run test` + `quickstart.md` walkthrough.

Each story adds value without breaking the previous ones, and — per SC-005 — none of them change
what any view shows or computes, only how it looks.
