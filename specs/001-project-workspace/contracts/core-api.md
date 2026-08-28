# Contract: Domain Core Public API

This project has no external API, CLI, or service boundary — it is a frontend-only, in-memory
application. The interface contract that actually matters here, per the constitution's Domain
Core Independence principle, is the boundary between `src/core/` (pure TypeScript) and everything
that calls it (`src/state/useProjectStore.ts`, and transitively the React components). This
document is that contract: the exported functions React is allowed to depend on, and nothing
about *how* they are implemented.

All functions are pure: given the same `Project` input (and same other arguments), they always
return the same output, and none of them mutate their input in place (constitution Principle II).

## Requirement operations (`src/core/requirementOperations.ts`)

```text
addRequirement(project: Project, input: { description: string; priority: RequirementPriority }): Project
editRequirement(project: Project, requirementId: string, changes: Partial<{ description: string; priority: RequirementPriority; status: RequirementStatus }>): Project
removeRequirement(project: Project, requirementId: string): Project
```

- `addRequirement` MUST reject (throw or return an explicit error result — implementation detail
  for `/speckit-tasks`) an empty/whitespace-only `description`; new requirements default to
  `status: "Proposed"`.
- `removeRequirement` MUST also remove every `Association` referencing that requirement (data
  model Integrity Rule 1); it MUST be a no-op-safe operation if the ID does not exist.

## Task operations (`src/core/taskOperations.ts`)

```text
addTask(project: Project, input: { title: string; estimatedEffortDays: number; status?: TaskStatus }): Project
editTask(project: Project, taskId: string, changes: Partial<{ title: string; estimatedEffortDays: number; status: TaskStatus }>): Project
removeTask(project: Project, taskId: string): Project
associateTaskWithRequirement(project: Project, taskId: string, requirementId: string): Project
unassociateTaskFromRequirement(project: Project, taskId: string, requirementId: string): Project
```

- `addTask` defaults `status` to `"NotStarted"` when not provided.
- `removeTask` MUST also remove every `Association` referencing that task (data model Integrity
  Rule 2).
- `associateTaskWithRequirement` MUST be idempotent (data model Integrity Rule 3).
- `unassociateTaskFromRequirement` MUST be a no-op-safe operation if the pair is not currently
  associated.

## Selectors (`src/core/selectors.ts`, `src/core/progress.ts`)

```text
getTasksForRequirement(project: Project, requirementId: string): Task[]
getRequirementsForTask(project: Project, taskId: string): Requirement[]
computeProgress(project: Project): { totalTasks: number; doneTasks: number; percentDone: number } | { totalTasks: 0 }
```

- Selectors never mutate `Project` and never throw for a valid-but-empty result (e.g., a
  requirement with no tasks yields `[]`, not an error) — spec edge cases.

## Seed data (`src/core/seedData.ts`)

```text
createSeedProject(): Project
```

- Returns a freshly constructed, fully-populated `Project` (one realistic project, 5-8
  requirements, 15-25 tasks, mixed statuses, existing associations — spec FR-016 and Assumptions).
- MUST be deterministic: calling it twice produces two structurally-identical `Project` values
  (same IDs, same field values), since it is built from static seed definitions plus the
  deterministic ID sequence, not from `Date.now()` or randomness.

## Consumer contract (`src/state/useProjectStore.ts`)

React's only obligations toward this boundary:

- Initialize state once from `createSeedProject()`.
- On every user action, call exactly one of the operations above with the current state and store
  its return value as the new state — never mutate the previous `Project` object, never
  re-implement any of the above logic inline in a component.
- Read progress/derived lists only through `computeProgress` / the selectors — never recompute
  them ad hoc in a component.
