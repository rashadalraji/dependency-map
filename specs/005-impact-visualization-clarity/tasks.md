---
description: "Task list for feature implementation"
---

# Tasks: Impact Visualization Clarity

**Input**: Design documents from `/specs/005-impact-visualization-clarity/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no data-model.md or contracts/ —
this feature introduces no new entities or dependencies, per plan.md)

**Tests**: This feature touches no `src/core/` logic, so the constitution's Test-First mandate
does not apply to new core tests. New light tests cover the two genuinely new pieces of logic
(edge chain-membership in `graphLayout.ts`, the Impact Map's "no impact" banner) and the
Report/Map color-consistency guarantee, per the constitution's allowance for lighter UI testing.

**Organization**: Tasks are grouped by user story (from spec.md). This feature refines the
existing `003-requirement-impact-analysis` / `004-visual-design-polish` codebase in place — every
file below already exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path

## Path Conventions

Continues the single frontend project at the repository root: `src/components/`. No `src/core/`
or `src/state/` file is touched by this feature.

---

## Phase 1: Setup

No tasks — this feature introduces no new dependencies or configuration (plan.md: "None new").

---

## Phase 2: Foundational

No tasks — the one piece of shared logic this feature needs (edge relation computation) is small
enough to be delivered directly as part of User Story 1 rather than as a separate blocking phase.

---

## Phase 3: User Story 1 - See the Complete Ripple Path at a Glance (Priority: P1) 🎯 MVP

**Goal**: The Impact Map visually emphasizes the dependency connections that make up the affected
chain, and visibly de-emphasizes everything else, so the ripple reads as a connected path.

**Independent Test**: Analyze a change whose impact spans a multi-hop dependency chain and confirm
the connections linking the affected tasks are visibly emphasized while everything outside the
chain is visibly de-emphasized, not merely neutral.

### Implementation for User Story 1

- [X] T001 [P] [US1] Extend `RELATION_INFO` (or add an adjacent constant) in
      `src/components/graphLayout.ts` with edge-style metadata per research.md #2: a colored,
      full-opacity, heavier-stroke style for edges whose dependent (target) end is `'direct'` or
      `'indirect'` (reusing that category's color), and one shared muted/low-opacity/thin-stroke
      style for every other edge
- [X] T002 [US1] In `buildImpactGraphElements` (`src/components/graphLayout.ts`), compute each
      edge's chain membership per research.md #1 (both the prerequisite and dependent task IDs
      appear in `impactResult.affectedTasks`) and apply the T001 styles accordingly via each
      edge's `style`/`className` and marker `color` (depends on T001)
- [X] T003 [P] [US1] Unit tests in `src/components/graphLayout.test.ts` (new
      `describe('buildImpactGraphElements')` block): an edge between two affected tasks is
      emphasized and colored by the dependent task's category; an edge touching a task outside the
      affected set is de-emphasized; an edge directly connecting two directly affected tasks is
      still emphasized (spec edge case); every edge is de-emphasized when `impactResult` is `null`
      or has an empty `affectedTasks` (depends on T002)
- [X] T004 [US1] Verify in `src/components/ImpactMap.tsx` that the relation-aware edges from
      `buildImpactGraphElements` reach `<ReactFlow>` unmodified (no downstream filtering or
      overriding of edge styling), and confirm via `npm run dev` that emphasized vs. de-emphasized
      edges are visually distinct (depends on T002)

**Checkpoint**: User Story 1 is fully functional and independently testable — the affected chain
reads as a connected, emphasized path on the Impact Map.

---

## Phase 4: User Story 2 - Trust That the Report and the Map Agree (Priority: P2)

**Goal**: The Impact Report and the Impact Map draw their category colors from one shared
definition, so a color means the same thing in both places by construction, not by coincidence.

**Independent Test**: For a single analyzed change, compare how a directly affected task and an
indirectly affected task are each represented in the Impact Report versus the Impact Map, and
confirm the visual treatment matches in both places.

### Implementation for User Story 2

- [X] T005 [US2] In `src/components/ImpactReport.tsx`, remove the local hardcoded direct/indirect
      color mapping and import `RELATION_INFO` from `src/components/graphLayout.ts` instead,
      using its `swatchClassName` (adapted to a border/text utility) and `label` for both each
      affected task's border accent and its category badge text (per research.md #3) — leave the
      unrelated risk-level badge coloring as-is
- [X] T006 [P] [US2] Extend `src/components/ImpactReport.test.tsx`: the rendered badge for a
      directly affected task shows `RELATION_INFO.direct.label` and for an indirectly affected
      task shows `RELATION_INFO.indirect.label`, so a future change to `RELATION_INFO` is
      guaranteed to update the Report's wording too (depends on T005)

**Checkpoint**: User Stories 1 and 2 both work independently — the Report and Map are provably
drawing from one shared color/label definition.

---

## Phase 5: User Story 3 - Understand When Nothing Is Affected (Priority: P3)

**Goal**: When a change has no affected tasks, the Impact Map itself makes that unmistakable,
without requiring the user to also check the Impact Report.

**Independent Test**: Analyze a change with zero affected tasks and confirm the Impact Map alone
clearly communicates "no impact," not just an unremarkable, fully de-emphasized graph.

### Implementation for User Story 3

- [X] T007 [US3] Add an explicit banner ("No tasks are affected by this change.") to
      `src/components/ImpactMap.tsx`, shown whenever `result` is `null` or
      `result.affectedTasks.length === 0`, per research.md #4 (depends on T004)
- [X] T008 [P] [US3] Add `src/components/ImpactMap.test.tsx` (new, if not already created by an
      earlier task) asserting the banner renders when `result` is `null`/empty and does not render
      when the result has affected tasks (depends on T007)

**Checkpoint**: All three user stories are independently functional — the Impact Map and Report
together clearly communicate the complete ripple effect, including the "nothing is affected" case.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [X] T009 [P] Confirm zero changes to `src/core/` or `src/state/`, and zero new dependencies were
      introduced (constitution Principles I and VI)
- [X] T010 Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [X] T011 Run `npm run test` and confirm the full suite — every existing `001`–`004` assertion —
      passes unchanged (SC-005)
- [X] T012 Walk through every scenario in `specs/005-impact-visualization-clarity/quickstart.md`
      manually against `npm run dev` — dev server verified to boot with no runtime errors; the
      interactive visual walkthrough (confirming edge colors/opacity, Report/Map side-by-side
      comparison, no-impact banner) was not performed by the agent (no browser tool available in
      this environment) — the automated tests for each of these exact scenarios (T003, T006, T008)
      stand in for it, but a manual `npm run dev` pass is recommended before calling this shippable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** / **Foundational (Phase 2)**: No tasks.
- **User Story 1 (Phase 3)**: No dependencies beyond the existing codebase — start immediately.
- **User Story 2 (Phase 4)**: Independent of User Story 1's edge work; only depends on
  `RELATION_INFO` already existing (it does, from `004`).
- **User Story 3 (Phase 5)**: Depends on `ImpactMap.tsx` already existing (it does); T007 sits
  alongside T004's verification of the same file, so it is sequenced after T004 to avoid editing
  the file in two directions at once, though the two stories are otherwise independent.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- T001 (edge style metadata) lands before T002 (edge relation computation) uses it.
- T002 lands before its own tests (T003) and before `ImpactMap.tsx` verification (T004).
- T005 (Report color fix) lands before its test (T006).
- T007 (no-impact banner) lands before its test (T008).

### Parallel Opportunities

- T001 and T003 can be drafted in parallel with T005/T006 (US2) and T007/T008 (US3), since they
  touch different files — the only real serialization point is within `ImpactMap.tsx` (T004 then
  T007, both eventually touching the same file).
- T003, T006, and T008 (all test files) can run in parallel with each other once their respective
  implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
# These can all start immediately, in parallel, since they touch different files:
Task: "Extend RELATION_INFO with edge-style metadata in src/components/graphLayout.ts"
Task: "Replace ImpactReport.tsx's local color mapping with RELATION_INFO"

# Once each lands, its own test can run in parallel with the others:
Task: "Unit tests for buildImpactGraphElements edge relation in graphLayout.test.ts"
Task: "Extend ImpactReport.test.tsx for RELATION_INFO-sourced labels"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1.
2. **STOP and VALIDATE**: run `npm run test` and confirm the affected chain reads as a connected,
   emphasized path on the Impact Map for the seeded multi-hop change. This alone delivers the
   feature's headline promise.

### Incremental Delivery

1. Add User Story 1 → validate independently → demo (the ripple reads as a path).
2. Add User Story 2 → validate independently → demo (Report and Map provably agree).
3. Add User Story 3 → validate independently → demo ("no impact" is unmistakable).
4. Polish → final `npm run build` + full `npm run test` + `quickstart.md` walkthrough.

Each story adds value without breaking the previous ones, and — per SC-005 — none of them change
any computed impact-analysis result, only its presentation.
