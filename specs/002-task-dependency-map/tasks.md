---
description: "Task list for feature implementation"
---

# Tasks: Task Dependency Map

**Input**: Design documents from `/specs/002-task-dependency-map/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/dependency-api.md, quickstart.md

**Tests**: Included and mandatory for `src/core/*` — the project constitution (Principle V,
Test-First for Core Logic) requires every domain-core function to have unit tests written
alongside its implementation, independent of the UI. Lighter tests cover the new UI-layer graph
layout helper and the `DependencyMap` component, per Principle V's allowance for lighter UI-level
coverage.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story. This feature extends the existing
`001-project-workspace` codebase in place — file paths marked "(modified)" already exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path

## Path Conventions

Continues the single frontend project at the repository root (per plan.md Structure Decision):
`src/core/`, `src/state/`, `src/components/`. Tests for `src/core/*` are colocated as `*.test.ts`
next to the code they cover, matching `001-project-workspace`'s established convention.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the two new dependencies this feature's Dependency Map requires (research.md #1-#2).

- [X] T001 [P] Add `@xyflow/react` and `@dagrejs/dagre` as dependencies in `package.json`, then
      `npm install`
- [X] T002 Run `npm run build` and `npm run test` to confirm the existing app and test suite still
      pass unchanged with the new dependencies present (no functional change yet)

**Checkpoint**: New dependencies installed; existing app unaffected.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `TaskDependency` type, dependency-graph queries, cycle-safe create/remove
operations, seeded dependency data, and store wiring that every user story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Add the `TaskDependency` type and a `taskDependencies: TaskDependency[]` field to
      `Project` in `src/core/types.ts`, per data-model.md (no React/DOM imports; no `any`)
- [X] T004 Implement `getDirectDependencies`, `getDirectDependents`, and `wouldCreateCycle` in
      `src/core/dependencyGraph.ts` per data-model.md and contracts/dependency-api.md (depends on
      T003)
- [X] T005 [P] Unit tests in `src/core/dependencyGraph.test.ts`: an unconnected task returns `[]`
      from both list queries; a task with multiple dependencies/dependents returns the correct
      sets; `wouldCreateCycle` is true for a task depending on itself; `wouldCreateCycle` is true
      across an indirect 3-hop chain (A→B→C, checking C→A); `wouldCreateCycle` is false for an
      unrelated pair (depends on T004)
- [X] T006 Implement `addTaskDependency` and `removeTaskDependency` in
      `src/core/taskDependencyOperations.ts` per contracts/dependency-api.md, using T004's
      `wouldCreateCycle` (depends on T003, T004)
- [X] T007 [P] Unit tests in `src/core/taskDependencyOperations.test.ts`: `addTaskDependency`
      rejects a self-dependency; rejects a dependency that would form a cycle; is a no-op (no
      duplicate) when the pair already exists; a valid new pair is added; `removeTaskDependency`
      removes an existing pair; is a no-op for a pair that isn't currently a dependency (depends
      on T006)
- [X] T008 Modify `removeTask` in `src/core/taskOperations.ts` so it also removes every
      `TaskDependency` referencing the removed task as either `dependentTaskId` or
      `prerequisiteTaskId` (spec FR-011; data-model Integrity Rule 5) (depends on T003)
- [X] T009 [P] Extend `src/core/taskOperations.test.ts` with a case: removing a task that is both
      a dependent in one dependency and a prerequisite in another removes both `TaskDependency`
      entries (depends on T008)
- [X] T010 Extend `createSeedProject` in `src/core/seedData.ts` to populate
      `Project.taskDependencies` with a realistic set of dependencies over the existing seeded
      tasks, including at least one chain three-or-more tasks deep, while keeping the function
      fully deterministic (depends on T003)
- [X] T011 [P] Extend `src/core/seedData.test.ts`: the seeded project's `taskDependencies` is
      non-empty and includes a chain of at least 3 tasks; re-checking every seeded edge with
      `wouldCreateCycle` (after removing that edge) confirms the seeded graph itself contains no
      cycle (depends on T010, T004)
- [X] T012 Extend `useProjectStore` in `src/state/useProjectStore.ts` with
      `addTaskDependency`/`removeTaskDependency` dispatchers that call the T006 operations and
      replace the stored `project` with their return value, following the existing dispatcher
      pattern (depends on T006)

**Checkpoint**: Foundation ready — `npm run test` passes for all new Foundational test files; all
user story work can now begin.

---

## Phase 3: User Story 1 - Explore the Dependency Map (Priority: P1) 🎯 MVP

**Goal**: A user opens the Dependency Map and sees every task as a node and every dependency as a
directed connection; selecting a task shows its direct dependencies and dependents — read-only,
no creating or removing yet.

**Independent Test**: Load the app with its seeded task dependencies and verify every task appears
as a node, every seeded dependency appears as a correct directed connection, an unconnected task
still appears, and selecting a task shows exactly its direct (not transitive) dependencies and
dependents (spec.md User Story 1 acceptance scenarios).

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement `buildDependencyGraphElements(project, selectedTaskId)` in
      `src/components/graphLayout.ts`: converts `project.tasks`/`project.taskDependencies` into
      React Flow `nodes`/`edges`, computing node positions with `@dagrejs/dagre`, and tagging each
      node with its task status (research.md #5 default) and its relationship to
      `selectedTaskId` (selected / direct dependency / direct dependent / unrelated) for
      highlighting
- [X] T014 [P] [US1] Light unit test in `src/components/graphLayout.test.ts`: calling
      `buildDependencyGraphElements` twice with the same input produces the same node positions
      (determinism, research.md #2); the result has exactly one node per task and one edge per
      dependency (depends on T013)
- [X] T015 [US1] Build a custom node component `TaskNode` in `src/components/TaskNode.tsx`
      rendering a task's title, a status-colored badge, and a visual highlight state, registered
      as a React Flow custom node type (depends on T013)
- [X] T016 [US1] Build `DependencyMap` in `src/components/DependencyMap.tsx`: renders `<ReactFlow>`
      with nodes/edges from `buildDependencyGraphElements`, `nodesDraggable={false}` and pan/zoom
      controls enabled (research.md #4 default), tracks the selected task in local state, and
      renders a detail panel listing the selected task's direct dependencies and direct
      dependents as plain text (spec FR-003) (depends on T013, T015)
- [X] T017 [P] [US1] Add `src/components/DependencyMap.css` for the map container, detail panel,
      and a small status-color legend
- [X] T018 [US1] Add a view toggle ("Workspace" / "Dependency Map") to
      `src/components/Workspace.tsx` that renders `<DependencyMap project={store.project} />`
      when selected, using local component state (no routing library, research.md #7) (depends on
      T016)
- [X] T019 [US1] Component test in `src/components/DependencyMap.test.tsx` (React Testing
      Library): every seeded task's title renders as a node label; an unconnected seeded task
      still renders; selecting a task with known dependencies/dependents renders the correct
      plain-text lists (depends on T018)

**Checkpoint**: User Story 1 is fully functional and independently testable — the Dependency Map
view demonstrates the complete seeded graph and task-level detail with no editing.

---

## Phase 4: User Story 2 - Create a Dependency Between Tasks (Priority: P2)

**Goal**: A user picks two existing tasks and records that one depends on the other; self-
dependency and cycle-forming attempts are rejected with an explanation, and duplicates are safe
no-ops.

**Independent Test**: Pick two unrelated seeded tasks, create a dependency between them, and
verify the new connection appears in the Dependency Map immediately; attempt a self-dependency and
a cycle-forming dependency (using the seeded multi-hop chain) and verify both are rejected with an
explanation; attempt to recreate an existing dependency and verify no duplicate appears (spec.md
User Story 2 acceptance scenarios).

### Implementation for User Story 2

- [X] T020 [US2] Add a "create dependency" form to `src/components/DependencyMap.tsx` (a
      "dependent task" select and a "prerequisite task" select plus an "Add dependency" button),
      wired to the store's `addTaskDependency`, catching and displaying the error thrown for a
      self-dependency or cycle-forming attempt (depends on T012, T016)
- [X] T021 [US2] In the same form, use `wouldCreateCycle` (from `src/core/dependencyGraph.ts`) to
      filter out "prerequisite task" options that would form a cycle with the currently-selected
      "dependent task", so invalid choices are visibly excluded before submission (depends on
      T020)
- [X] T022 [P] [US2] Extend `src/components/DependencyMap.test.tsx`: creating a valid dependency
      updates the rendered map/detail panel immediately; attempting a self-dependency shows an
      error message and does not change the graph; attempting to recreate an existing dependency
      does not add a duplicate connection (depends on T020, T021)

**Checkpoint**: User Stories 1 and 2 both work independently — the map can be explored and grown
with new, validated dependencies.

---

## Phase 5: User Story 3 - Remove a Dependency (Priority: P3)

**Goal**: A user removes an existing dependency; the map and the affected tasks' detail lists
update immediately.

**Independent Test**: Starting from an existing seeded dependency, remove it and verify the
connection disappears from the Dependency Map immediately, and that selecting either of the two
tasks no longer lists the other as a dependency/dependent (spec.md User Story 3 acceptance
scenarios).

### Implementation for User Story 3

- [X] T023 [US3] Add a "remove" control next to each entry in the selected task's direct
      dependencies/dependents lists in `src/components/DependencyMap.tsx`, wired to the store's
      `removeTaskDependency` (depends on T016, T012)
- [X] T024 [P] [US3] Extend `src/components/DependencyMap.test.tsx`: removing an existing
      dependency updates the rendered map/detail panel immediately, and neither task lists the
      other afterward (depends on T023)

**Checkpoint**: All three user stories are independently functional — the Dependency Map supports
full view, creation with validation, and removal.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [X] T025 [P] Review `src/core/*` for continued constitution compliance: still zero
      `react`/`react-dom`/`@xyflow/react`/`dagre` imports and no `any` in domain types (Principle I)
- [X] T026 Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [X] T027 Run `npm run test` and confirm the full suite — both `001-project-workspace`'s existing
      tests and this feature's new tests — passes together
- [X] T028 Walk through every scenario in `specs/002-task-dependency-map/quickstart.md` manually
      against `npm run dev`, and confirm or override the three open defaults from research.md
      (#4 interactivity scope, #5 status encoding, #6 status-based creation restriction) with the
      user — all three confirmed as-is (2026-08-28); dev server verified to boot with no runtime
      errors, but the interactive browser click-through itself was not performed by the agent (no
      browser tool available in this environment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational, and extends the `DependencyMap` component
  and `useProjectStore` dispatchers built in Phase 3/2.
- **User Story 3 (Phase 5)**: Depends on Foundational, and extends the same `DependencyMap`
  component and store dispatchers.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

**Note on independence vs. reuse**: As with `001-project-workspace`, US2 and US3 are independently
*testable* (each has its own acceptance scenarios) but extend the same `DependencyMap.tsx` and
`useProjectStore.ts` files created in earlier phases rather than duplicating them — there is
exactly one Dependency Map view and one store, grown incrementally.

### Within Each User Story

- Core logic (`src/core/*`) is written with its unit tests, per the constitution's Test-First
  requirement.
- Graph layout/rendering (`buildDependencyGraphElements`, `TaskNode`) before the `DependencyMap`
  component that composes them.
- Store dispatchers (Foundational) before the UI controls that invoke them.

### Parallel Opportunities

- T001 (Setup) has no sibling to parallelize with in this phase.
- T003 (Foundational) can start immediately; T005 and T007 and T009 and T011 (all test files) can
  each run in parallel with the others once their respective implementation task is done.
- T013 and T017 (US1) can run in parallel; T014 can run once T013 is done, in parallel with T015.
- T022 (US2 tests) and T024 (US3 tests) touch the same file (`DependencyMap.test.tsx`) as each
  other and as T019 — write them additively rather than truly in parallel if done by more than one
  person.

---

## Parallel Example: Foundational Phase

```bash
# Once T003 (types.ts) is done, these can proceed in parallel:
Task: "Implement dependency-graph queries in src/core/dependencyGraph.ts"
Task: "Modify removeTask in src/core/taskOperations.ts to purge referencing dependencies"
Task: "Extend createSeedProject in src/core/seedData.ts with seeded task dependencies"

# Each implementation's test file can then run in parallel with the others:
Task: "Unit tests in src/core/dependencyGraph.test.ts"
Task: "Extend src/core/taskOperations.test.ts for the cascade-removal case"
Task: "Extend src/core/seedData.test.ts for the seeded dependency chain"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything else).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `npm run test` and walk the User Story 1 section of
   `quickstart.md`. This alone is a demoable increment — a fully explorable, explained Dependency
   Map over the existing seeded project.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate independently → demo (MVP for this feature).
3. Add User Story 2 → validate independently → demo (dependencies can now be created safely).
4. Add User Story 3 → validate independently → demo (dependencies can be corrected/removed).
5. Polish → final `npm run build` + full `quickstart.md` walkthrough + confirm the three open
   research.md defaults with the user.

Each story adds value without breaking the previous ones, and none of them touch
`001-project-workspace`'s existing requirement/task-management UI.
