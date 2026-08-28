---
description: "Task list for feature implementation"
---

# Tasks: Requirement Impact Analysis

**Input**: Design documents from `/specs/003-requirement-impact-analysis/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/impact-api.md, quickstart.md

**Tests**: Included and mandatory for `src/core/*` — the project constitution (Principle V,
Test-First for Core Logic) requires every domain-core function to have unit tests written
alongside its implementation, independent of the UI. Lighter tests cover the new UI components,
per Principle V's allowance for lighter UI-level coverage.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story. This feature extends the existing
`001-project-workspace` / `002-task-dependency-map` codebase in place — file paths marked
"(modified)" already exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path

## Path Conventions

Continues the single frontend project at the repository root: `src/core/`, `src/components/`.
Tests for `src/core/*` are colocated as `*.test.ts` next to the code they cover, matching
established convention.

---

## Phase 1: Setup

Per plan.md/research.md, this feature introduces **no new dependencies and no new configuration**
— it reuses the existing React/Vite/Vitest/`@xyflow/react`/`@dagrejs/dagre` stack as-is. There is
nothing to install or configure; implementation begins directly at Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `RequirementChange`/`ImpactResult` types, automatic change-recording wired into
the existing requirement operations, and seeded change history that every user story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add `RequirementChangeType`, `RequirementChange`, `ImpactRiskLevel`,
      `AffectedTask`, `ImpactResult` types and `Project.requirementChanges` /
      `Project.nextChangeSeq` fields in `src/core/types.ts`, per data-model.md (no React/DOM
      imports; no `any`)
- [X] T002 [P] Add `nextChangeId(project)` in `src/core/ids.ts`, following the existing
      `nextRequirementId`/`nextTaskId` pattern
- [X] T003 Implement `recordRequirementChange(project, requirementId, changeType,
      requirementDescriptionSnapshot)` in `src/core/requirementChangeLog.ts` per
      contracts/impact-api.md: appends one `RequirementChange` whose
      `directlyAssociatedTaskIds` is the current `project.associations` for `requirementId`
      (depends on T001, T002)
- [X] T004 [P] Unit tests in `src/core/requirementChangeLog.test.ts`: the appended change has a
      deterministic `id`; `directlyAssociatedTaskIds` correctly reflects the associations present
      in the given `project` at call time; calling it twice with the same input produces
      structurally identical results except for the sequence-derived `id` (depends on T003)
- [X] T005 Modify `addRequirement`, `editRequirement`, and `removeRequirement` in
      `src/core/requirementOperations.ts` so each also calls `recordRequirementChange` with
      `changeType` `'Added'`, `'Modified'`, and `'Removed'` respectively; `removeRequirement` MUST
      compute the snapshot from the pre-removal project state, before its existing association
      cleanup runs (depends on T003)
- [X] T006 [P] Extend `src/core/requirementOperations.test.ts`: `addRequirement` appends an
      `'Added'` change with an empty `directlyAssociatedTaskIds`; `editRequirement` appends a
      `'Modified'` change whose `directlyAssociatedTaskIds` matches the requirement's current
      associations; `removeRequirement` appends a `'Removed'` change whose
      `directlyAssociatedTaskIds` reflects the associations that existed immediately before
      removal (depends on T005)
- [X] T007 Extend `createSeedProject` in `src/core/seedData.ts` to populate
      `Project.requirementChanges` with a realistic history: at least one `'Added'` entry, one
      `'Modified'` entry whose associated tasks include a multi-hop dependency chain (so its
      analysis will show both direct and indirect impact), and one `'Removed'` entry for a
      requirement that does not appear in `Project.requirements` (depends on T001)
- [X] T008 [P] Extend `src/core/seedData.test.ts`: `requirementChanges` is non-empty and includes
      at least one entry of each `RequirementChangeType`; the `'Removed'` entry's `requirementId`
      does not match any id in `project.requirements`; remains deterministic across two calls
      (depends on T007)

**Checkpoint**: Foundation ready — every requirement add/edit/remove now produces change history,
and seed data demonstrates all three change types.

---

## Phase 3: User Story 1 - Trigger an Impact Analysis for a Requirement Change (Priority: P1) 🎯 MVP

**Goal**: A user picks a recorded requirement change from its history and runs its analysis,
seeing the full set of directly and indirectly affected tasks, total effort impact, total
schedule impact, and one overall risk level.

**Independent Test**: Starting from the seeded requirement change history, select the seeded
change whose requirement has associated tasks and downstream dependencies, trigger its analysis,
and verify the result includes the correct affected-task set, effort impact, schedule impact, and
risk level — and that re-running it produces an identical result (spec.md User Story 1 acceptance
scenarios).

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement `analyzeRequirementChange(project, changeId)` in
      `src/core/impactAnalysis.ts` per data-model.md and research.md #3: filter the change's
      `directlyAssociatedTaskIds` snapshot to currently-existing tasks; breadth-first traverse
      `getDirectDependents` (from `src/core/dependencyGraph.ts`) forward from every directly
      affected task, tracking a `causedBy` parent per newly-discovered task and a `visited` set
      for cycle/dedup safety; build each affected task's `reason` string; sum
      `estimatedEffortDays` for `effortImpactDays`; compute the longest dependency-connected chain
      by summed effort for `scheduleImpactDays`; assign `riskLevel` via the two-tier
      count/schedule rule (depends on T001)
- [X] T010 [P] [US1] Unit tests in `src/core/impactAnalysis.test.ts`: a change with no associated
      tasks yields zero affected tasks and `'Low'` risk; direct and indirect tasks are correctly
      identified across a multi-hop chain; a snapshotted task id with no matching current task is
      silently dropped; a task reachable via two different dependency chains appears exactly once;
      a cyclic dependency graph (constructed directly as a fixture) does not loop infinitely; the
      effort/schedule sums and resulting risk tier match the documented rule for constructed
      fixtures at each risk boundary (depends on T009)
- [X] T011 [US1] Build `ChangeHistory` in `src/components/ChangeHistory.tsx`: lists
      `project.requirementChanges` in recorded order, each showing its requirement description
      snapshot and change type, with an "Analyze" control that reports the selected change id to
      its parent (depends on T001)
- [X] T012 [US1] Refactor `src/components/graphLayout.ts` per research.md #4: extract the shared
      dagre-based node/edge layout computation from the node-category-assignment logic currently
      specific to selection-based highlighting, so a second consumer can supply its own
      category-assignment function against the same positions/edges. Verify `DependencyMap.tsx`
      and its existing tests still pass unchanged after the refactor (depends on none; touches
      shared code from `002-task-dependency-map`)
- [X] T013 [US1] Build `ImpactReport` in `src/components/ImpactReport.tsx`: given an
      `ImpactResult`, shows the analyzed change's requirement description and change type, the
      counts and titles of directly and indirectly affected tasks, the total effort impact, the
      total schedule impact, and the overall risk level (per-task reason text is added in User
      Story 2) (depends on T009)
- [X] T014 [US1] Build `ImpactMap` in `src/components/ImpactMap.tsx` using the refactored
      `src/components/graphLayout.ts` (T012): renders the full task graph with nodes colored by
      impact category (direct / indirect / unaffected) for the current `ImpactResult` (depends on
      T009, T012)
- [X] T015 [US1] Add a third view, "Requirement Impact," to `src/components/Workspace.tsx`
      composing `ChangeHistory` + `ImpactReport` + `ImpactMap`, holding the selected change id in
      local component state (no routing library) and calling `analyzeRequirementChange` via
      `useMemo` when a change is selected (depends on T011, T013, T014)
- [X] T016 [US1] Component test in `src/components/ImpactReport.test.tsx`: analyzing a fixture
      change with known direct and indirect tasks renders the correct affected-task counts, effort
      impact, schedule impact, and risk level; analyzing it twice in a row renders an identical
      result (depends on T013)

**Checkpoint**: User Story 1 is fully functional and independently testable — the complete
analysis pipeline (recording → selection → analysis → report/map) is demonstrable end-to-end.

---

## Phase 4: User Story 2 - Understand Why Each Affected Task Is Affected (Priority: P2)

**Goal**: Every affected task shown in an analysis result carries a specific, plain-language
reason for its inclusion.

**Independent Test**: From an analysis result containing a directly affected task and an
indirectly affected task reached through a second indirectly affected task, verify each renders
its own specific explanation naming the requirement or the actual parent task involved, not a
generic or shared message (spec.md User Story 2 acceptance scenarios).

### Implementation for User Story 2

- [X] T017 [US2] Extend `ImpactReport` in `src/components/ImpactReport.tsx` to render each
      affected task's `reason` text next to its title, visually distinguishing directly affected
      from indirectly affected entries (depends on T013)
- [X] T018 [P] [US2] Extend `src/components/ImpactReport.test.tsx`: a directly affected task's
      rendered reason states it implements the changed requirement; an indirectly affected task
      reached through two or more dependency hops renders a reason naming its actual, direct
      parent task in the chain, not the original requirement's directly affected tasks (depends
      on T017)

**Checkpoint**: User Stories 1 and 2 both work independently — every affected task's inclusion is
explained on screen, not just listed.

---

## Phase 5: User Story 3 - Review the Requirement Change History (Priority: P3)

**Goal**: Users can browse every recorded requirement change, including ones whose requirement no
longer exists, without relying on memory.

**Independent Test**: Add a requirement, edit an existing one, and remove another via the existing
Workspace requirement controls; verify all three appear in the change history with the correct
requirement identity, change type, and order, and that the removed one remains selectable for
analysis (spec.md User Story 3 acceptance scenarios).

### Implementation for User Story 3

- [X] T019 [US3] Verify and, if needed, adjust `ChangeHistory.tsx` so a `'Removed'` entry (whose
      `requirementId` no longer appears in `project.requirements`) renders using its
      `requirementDescriptionSnapshot` and remains selectable for analysis exactly like any other
      entry (depends on T011)
- [X] T020 [P] [US3] Component test in `src/components/ChangeHistory.test.tsx`: adding, editing,
      and removing requirements (via the existing requirement-management actions) each produce a
      new visible history entry with the correct requirement identity and change type; the entry
      for a removed requirement remains present and selectable after removal (depends on T019)

**Checkpoint**: All three user stories are independently functional — the full requirement-change
management and impact-analysis workflow is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [X] T021 [P] Review `src/core/*` for continued constitution compliance: still zero
      `react`/`react-dom`/`@xyflow/react`/`dagre` imports and no `any` in domain types (Principle I)
- [X] T022 Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [X] T023 Run `npm run test` and confirm the full suite — `001-project-workspace`,
      `002-task-dependency-map`, and this feature's tests — passes together
- [X] T024 Walk through every scenario in `specs/003-requirement-impact-analysis/quickstart.md`
      manually against `npm run dev` — dev server verified to boot with no runtime errors; the
      interactive browser click-through itself was not performed by the agent (no browser tool
      available in this environment), covered instead by the full automated test suite (T009,
      T010, T016, T018, T020)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks — nothing to install or configure.
- **Foundational (Phase 2)**: BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational, and extends the `ImpactReport` component
  built in Phase 3.
- **User Story 3 (Phase 5)**: Depends on Foundational, and extends the `ChangeHistory` component
  built in Phase 3.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

**Note on independence vs. reuse**: As with the prior features, US2 and US3 extend the same
`ImpactReport.tsx` / `ChangeHistory.tsx` files built in US1 rather than duplicating them — each
still has its own acceptance scenarios and can be validated on its own once its phase lands.

### Within Each User Story

- Core logic (`src/core/*`) is written with its unit tests, per the constitution's Test-First
  requirement.
- The `graphLayout.ts` refactor (T012) happens before `ImpactMap` is built on top of it, and its
  own verification step (existing `DependencyMap` tests still passing) happens before it is relied
  upon by anything new.
- The `ChangeHistory` / `ImpactReport` / `ImpactMap` components exist before `Workspace.tsx`
  composes them into the third view.

### Parallel Opportunities

- T001 and T002 (Foundational) can run in parallel; T004, T006, T008 (test files) can each run in
  parallel with the others once their respective implementation task is done.
- T009 and T011 and T012 (US1) can start in parallel once Foundational is complete; T013 and T014
  both depend on T009 (and T012 for T014) but can then proceed in parallel with each other.
- T018 (US2 tests) and T020 (US3 tests) touch different files and can run in parallel.

---

## Parallel Example: Foundational Phase

```bash
# T001 and T002 first, in parallel:
Task: "Add RequirementChange/ImpactResult types in src/core/types.ts"
Task: "Add nextChangeId in src/core/ids.ts"

# Once T003 (requirementChangeLog.ts) and T005 (requirementOperations.ts) are each done,
# their test files can run in parallel with each other and with T007's seed-data extension:
Task: "Unit tests in src/core/requirementChangeLog.test.ts"
Task: "Extend src/core/requirementOperations.test.ts for change-logging cases"
Task: "Extend createSeedProject with a realistic requirement-change history"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (blocks everything else — no Setup phase needed).
2. Complete Phase 3: User Story 1.
3. **STOP and VALIDATE**: run `npm run test` and walk the User Story 1 section of
   `quickstart.md`. This alone is a demoable MVP — the complete "record a change → analyze it"
   pipeline, without per-task explanations yet.

### Incremental Delivery

1. Foundational → change history exists and is seeded.
2. Add User Story 1 → validate independently → demo (MVP: full analysis pipeline).
3. Add User Story 2 → validate independently → demo (every affected task is now explained).
4. Add User Story 3 → validate independently → demo (change history is fully browsable, including
   removed requirements).
5. Polish → final `npm run build` + full `quickstart.md` walkthrough.

Each story adds value without breaking the previous ones, and none of them touch
`001-project-workspace`'s or `002-task-dependency-map`'s existing behavior beyond the
additive `requirementOperations.ts` change documented in Foundational.
