---
description: "Task list for feature implementation"
---

# Tasks: Project Workspace

**Input**: Design documents from `/specs/001-project-workspace/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/core-api.md, quickstart.md

**Tests**: Included and mandatory for `src/core/*` — the project constitution (Principle V,
Test-First for Core Logic) requires every domain-core function to have unit tests written
alongside its implementation, independent of the UI. A small number of lighter component tests
are also included per Principle V's allowance for lighter UI-level coverage.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path

## Path Conventions

Single frontend project at the repository root (per plan.md Structure Decision):
`src/core/`, `src/state/`, `src/components/`, `App.tsx`. Tests for `src/core/*` are colocated as
`*.test.ts` next to the code they cover (Vitest default discovery) — no separate `tests/` tree.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the testing toolchain this feature's constitution-mandated tests require;
nothing story-specific yet.

- [ ] T001 [P] Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` as
      dev dependencies in `package.json` (per research.md #1)
- [ ] T002 Add a `test` environment block to `vite.config.ts` (`test: { environment: "jsdom",
      globals: true, setupFiles: ... }`) so Vitest can run component tests against a DOM (per
      research.md #1)
- [ ] T003 [P] Add a `"test": "vitest run"` script to `package.json`

**Checkpoint**: `npm run test` runs (with zero test files yet) without configuration errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The domain-core types, deterministic ID generation, seeded project, selectors, and
the React state adapter that every user story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Define `RequirementPriority`, `RequirementStatus`, `TaskStatus` enums and the
      `Project`, `Requirement`, `Task`, `Association` types in `src/core/types.ts`, matching
      data-model.md exactly (no React/DOM imports; no `any`)
- [ ] T005 [P] Implement a deterministic ID sequence generator in `src/core/ids.ts` (e.g.
      `nextRequirementId(project)` / `nextTaskId(project)` producing `req-1`, `task-1`, ...) per
      research.md #2 — no `crypto.randomUUID()`, no `Date.now()`
- [ ] T006 Implement `createSeedProject(): Project` in `src/core/seedData.ts` returning one
      realistic project (name, `targetDeadline`, `estimatedEffortDays`) with 5-8 requirements,
      15-25 tasks with mixed statuses, and existing associations between them, built using the
      generator from T005 (depends on T004, T005)
- [ ] T007 [P] Implement `getTasksForRequirement` and `getRequirementsForTask` in
      `src/core/selectors.ts` (depends on T004)
- [ ] T008 Implement `useProjectStore` in `src/state/useProjectStore.ts`: initializes React state
      from `createSeedProject()` once, and exposes `{ project }` plus a way for later tasks to add
      dispatchers around core operations without re-deriving or duplicating core logic (depends on
      T006)
- [ ] T009 [P] Unit tests for seed-data determinism and shape in `src/core/seedData.test.ts`:
      calling `createSeedProject()` twice yields structurally identical projects; the result has
      5-8 requirements and 15-25 tasks; at least one task exists in each `TaskStatus` (depends on
      T006)

**Checkpoint**: Foundation ready — `npm run test` passes for `src/core/seedData.test.ts`; all user
story work can now begin.

---

## Phase 3: User Story 1 - See the Project Workspace (Priority: P1) 🎯 MVP

**Goal**: A user opens the app and sees the seeded project's details, full requirement list, full
task list, and an overall progress figure — a read-only view, no editing yet.

**Independent Test**: Load the app and verify the project's name/target deadline/estimated effort
are shown, every seeded requirement and task is listed with its key attributes, and progress
reflects the seeded mix of task statuses (spec.md User Story 1 acceptance scenarios).

### Tests for User Story 1

> Write these tests FIRST; confirm they fail before the corresponding implementation exists.

- [ ] T010 [P] [US1] Unit tests for `computeProgress` in `src/core/progress.test.ts`: mixed
      statuses produce a percentage strictly between 0 and 100; all tasks `"Done"` produces 100;
      zero tasks produces the distinct "no tasks yet" shape, not `percentDone: 0` (per data-model
      Integrity Rule 4 and spec edge cases)
- [ ] T011 [P] [US1] Unit tests for the selectors in `src/core/selectors.test.ts`: a requirement
      with tasks returns them; a requirement with none returns `[]`, not an error; a task
      associated with multiple requirements is returned by all of them (depends on T007)

### Implementation for User Story 1

- [ ] T012 [US1] Implement `computeProgress(project): { totalTasks; doneTasks; percentDone } |
      { totalTasks: 0 }` in `src/core/progress.ts`, satisfying T010 (depends on T004, T010)
- [ ] T013 [US1] Build `ProjectHeader` in `src/components/ProjectHeader.tsx` rendering the
      project's name, target deadline, estimated effort, and the progress figure from
      `computeProgress` (depends on T008, T012)
- [ ] T014 [US1] [P] Build a read-only `RequirementList` in `src/components/RequirementList.tsx`
      listing every requirement's description/priority/status plus its tasks via
      `getTasksForRequirement` (depends on T007, T008)
- [ ] T015 [US1] [P] Build a read-only `TaskList` in `src/components/TaskList.tsx` listing every
      task's title/estimated effort/status plus its requirement(s) via `getRequirementsForTask`
      (depends on T007, T008)
- [ ] T016 [US1] Compose `Workspace` in `src/components/Workspace.tsx` from `ProjectHeader` +
      `RequirementList` + `TaskList`, reading from `useProjectStore` (depends on T013, T014, T015)
- [ ] T017 [US1] Replace the default Vite scaffold in `src/App.tsx` with `<Workspace />` (depends
      on T016)
- [ ] T018 [US1] Component smoke test in `src/components/Workspace.test.tsx` (React Testing
      Library) asserting the seeded project's name, at least one seeded requirement's description,
      at least one seeded task's title, and a progress value all render on initial load (depends
      on T017)

**Checkpoint**: User Story 1 is fully functional and independently testable — `npm run test` and
`npm run dev` both demonstrate a populated, read-only workspace.

---

## Phase 4: User Story 2 - Manage Requirements (Priority: P2)

**Goal**: A user can add, edit, and remove requirements, with the requirement list and any linked
tasks updating immediately.

**Independent Test**: Add a requirement, verify it appears immediately; edit its status, verify
the update shows everywhere; remove it, verify it disappears while its previously-linked tasks
remain in the task list (spec.md User Story 2 acceptance scenarios).

### Tests for User Story 2

- [ ] T019 [P] [US2] Unit tests in `src/core/requirementOperations.test.ts`: `addRequirement`
      appends a new requirement defaulting to `status: "Proposed"` and rejects an
      empty/whitespace-only description; `editRequirement` updates only the given fields;
      `removeRequirement` deletes the requirement AND every `Association` referencing it while
      leaving its tasks in `project.tasks` (data-model Integrity Rule 1); `removeRequirement` on an
      unknown id is a no-op

### Implementation for User Story 2

- [ ] T020 [US2] Implement `addRequirement`, `editRequirement`, `removeRequirement` in
      `src/core/requirementOperations.ts` per `contracts/core-api.md`, satisfying T019 (depends on
      T004, T005, T019)
- [ ] T021 [US2] Extend `useProjectStore` in `src/state/useProjectStore.ts` with
      `addRequirement`/`editRequirement`/`removeRequirement` dispatchers that call the T020
      operations and replace the stored `project` with their return value (depends on T020, T008)
- [ ] T022 [US2] Add an "add requirement" form (description + priority) to
      `src/components/RequirementList.tsx`, wired to the store's `addRequirement` (depends on
      T021, T014)
- [ ] T023 [US2] Add inline edit controls (description, priority, status) to
      `src/components/RequirementList.tsx`, wired to the store's `editRequirement` (depends on
      T021, T014)
- [ ] T024 [US2] Add a remove control to `src/components/RequirementList.tsx`, wired to the
      store's `removeRequirement`, and confirm in `src/components/TaskList.tsx` that a removed
      requirement's tasks remain listed, now without that requirement link (depends on T021, T014,
      T015)

**Checkpoint**: User Stories 1 and 2 both work independently — requirements are fully manageable
without touching task-management code.

---

## Phase 5: User Story 3 - Manage Tasks and Their Requirement Links (Priority: P3)

**Goal**: A user can create, edit, and remove tasks, and associate/unassociate them with
requirements, with progress recalculating immediately.

**Independent Test**: Create a task, associate it with a requirement, verify it appears under that
requirement and progress updates when its status changes to `"Done"`; remove it and verify it
disappears from the task list and from every requirement it was linked to (spec.md User Story 3
acceptance scenarios).

### Tests for User Story 3

- [ ] T025 [P] [US3] Unit tests in `src/core/taskOperations.test.ts`: `addTask` defaults `status`
      to `"NotStarted"` when omitted; `editTask` updates only the given fields; `removeTask`
      deletes the task AND every `Association` referencing it (data-model Integrity Rule 2);
      `associateTaskWithRequirement` on an already-linked pair does not create a duplicate
      `Association` (Integrity Rule 3); `unassociateTaskFromRequirement` on a non-linked pair is a
      no-op

### Implementation for User Story 3

- [ ] T026 [US3] Implement `addTask`, `editTask`, `removeTask`, `associateTaskWithRequirement`,
      `unassociateTaskFromRequirement` in `src/core/taskOperations.ts` per `contracts/core-api.md`,
      satisfying T025 (depends on T004, T005, T025)
- [ ] T027 [US3] Extend `useProjectStore` in `src/state/useProjectStore.ts` with
      `addTask`/`editTask`/`removeTask`/`associateTask`/`unassociateTask` dispatchers that call the
      T026 operations and replace the stored `project` with their return value (depends on T026,
      T021)
- [ ] T028 [US3] Add a "create task" form (title, estimated effort, status) to
      `src/components/TaskList.tsx`, wired to the store's `addTask` (depends on T027, T015)
- [ ] T029 [US3] Add inline edit controls (title, estimated effort, status) to
      `src/components/TaskList.tsx`, wired to the store's `editTask`, and confirm the
      `ProjectHeader` progress figure updates immediately when a task's status changes (depends on
      T027, T015, T013)
- [ ] T030 [US3] Add associate/unassociate controls (linking an existing task to an existing
      requirement and removing that link) to `src/components/TaskList.tsx`, wired to the store's
      `associateTask`/`unassociateTask` (depends on T027, T014, T015)
- [ ] T031 [US3] Add a remove control to `src/components/TaskList.tsx`, wired to the store's
      `removeTask`, and confirm in `src/components/RequirementList.tsx` that the removed task no
      longer appears under any requirement (depends on T027, T014, T015)

**Checkpoint**: All three user stories are independently functional — the workspace supports full
view + requirement management + task management and linking.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [ ] T032 [P] Add validation-error feedback (empty description/title, non-positive estimated
      effort) to the forms in `src/components/RequirementList.tsx` and
      `src/components/TaskList.tsx`
- [ ] T033 [P] Review `src/core/*` for constitution compliance: no `react`/`react-dom`/DOM imports,
      no `any` in domain types (Principle I and Technology & Architecture Constraints)
- [ ] T034 Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [ ] T035 Walk through every scenario in `specs/001-project-workspace/quickstart.md` manually
      against `npm run dev` and confirm each still holds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only (does not require US1's components to
  exist, but in practice extends the `RequirementList` built in US1 — see note below).
- **User Story 3 (Phase 5)**: Depends on Foundational, and extends `useProjectStore` from Phase 4
  (T021) plus the `TaskList`/`RequirementList` components from Phase 3/4.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

**Note on independence vs. reuse**: US2 and US3 are independently *testable* (each has its own
acceptance scenarios and can be demoed on its own once its phase is complete), but they extend the
same `RequirementList.tsx` / `TaskList.tsx` / `useProjectStore.ts` files created in US1/US2 rather
than duplicating them — per the constitution's Simplicity principle, there is exactly one
requirement list, one task list, and one store, each grown incrementally.

### Within Each User Story

- Tests are written first and MUST fail before their corresponding implementation task.
- Core operations (`src/core/*Operations.ts`) before the store dispatchers that call them.
- Store dispatchers before the UI controls that invoke them.

### Parallel Opportunities

- T001 and T003 (Setup) can run in parallel.
- T004, T005, T007 (Foundational) can run in parallel; T006 and T008 are sequential after their
  dependencies.
- T010 and T011 (US1 tests) can run in parallel; T014 and T015 (US1 implementation) can run in
  parallel once T007/T008 are done.
- T019 (US2 tests) and T025 (US3 tests) can be written in parallel by different people once
  Foundational is done, even though the *implementation* tasks that follow each have their own
  sequential chain.

---

## Parallel Example: User Story 1

```bash
# Tests first, in parallel:
Task: "Unit tests for computeProgress in src/core/progress.test.ts"
Task: "Unit tests for selectors in src/core/selectors.test.ts"

# Then, once T012 (progress.ts) and T007/T008 are done, these two in parallel:
Task: "Build read-only RequirementList in src/components/RequirementList.tsx"
Task: "Build read-only TaskList in src/components/TaskList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything else).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `npm run test` and walk the User Story 1 section of
   `quickstart.md`. This alone is a demoable MVP — a populated, explainable project workspace.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate independently → demo (MVP).
3. Add User Story 2 → validate independently → demo (requirements are now fully manageable).
4. Add User Story 3 → validate independently → demo (tasks + links complete the workspace).
5. Polish → final `npm run build` + full `quickstart.md` walkthrough.

Each story adds value without breaking the previous ones — no story requires undoing or
restructuring the work of an earlier one.
