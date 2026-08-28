# Phase 1 Data Model: Task Dependency Map

This feature extends the `001-project-workspace` domain core (`src/core/types.ts`) rather than
replacing it. `Task`, `Requirement`, and `Association` are unchanged; only additions are listed
below in full, and modifications to existing types/functions are called out explicitly.

## New Type

### TaskDependency

A directed, explicit edge between exactly two existing tasks (constitution Principle III).

| Field | Type | Notes |
|---|---|---|
| `dependentTaskId` | `string` | The task that depends on another; must reference an existing `Task.id`. |
| `prerequisiteTaskId` | `string` | The task being depended on; must reference an existing `Task.id`. |

"Task A depends on Task B" is represented as `{ dependentTaskId: 'A', prerequisiteTaskId: 'B' }`.

## Modified Type

### Project

Adds one field, appended after `associations` to match the existing field-addition style from
`001-project-workspace`:

| Field | Type | Notes |
|---|---|---|
| `taskDependencies` | `TaskDependency[]` | All current task-to-task dependencies in the project. |

No other `Project` fields change.

## Integrity Rules (enforced by `src/core/taskDependencyOperations.ts`)

1. A dependency MUST NOT have `dependentTaskId === prerequisiteTaskId` (no self-dependency).
2. A dependency MUST NOT be created if `prerequisiteTaskId` can already reach `dependentTaskId`
   via the existing `taskDependencies` graph (would close a cycle) — see research.md #3.
3. A given `(dependentTaskId, prerequisiteTaskId)` pair MUST be unique within
   `Project.taskDependencies`; attempting to add an existing pair is a no-op, not a duplicate
   (mirrors the existing `Association` uniqueness rule from `001-project-workspace`).
4. Removing a dependency for a pair that does not exist is a safe no-op.
5. **Modifies existing behavior**: `removeTask` (in `src/core/taskOperations.ts`, from
   `001-project-workspace`) MUST also remove every `TaskDependency` where the removed task is
   either the `dependentTaskId` or the `prerequisiteTaskId` (FR-011) — the same pattern already
   used there for `Association` cleanup.

## Derived Views (selectors, not stored state)

New file `src/core/dependencyGraph.ts`:

- `getDirectDependencies(project, taskId) → Task[]` — tasks that `taskId` depends on
  (`prerequisiteTaskId` of every `TaskDependency` where `dependentTaskId === taskId`).
- `getDirectDependents(project, taskId) → Task[]` — tasks that depend on `taskId`
  (`dependentTaskId` of every `TaskDependency` where `prerequisiteTaskId === taskId`).
- `wouldCreateCycle(project, dependentTaskId, prerequisiteTaskId) → boolean` — true if
  `dependentTaskId === prerequisiteTaskId`, or if `dependentTaskId` is reachable from
  `prerequisiteTaskId` by following existing `taskDependencies` edges forward (see research.md
  #3). Pure, no mutation, no side effects — consulted by `addTaskDependency` before committing a
  change, and usable standalone by the UI to disable/explain an invalid choice before submission.

Both dependency lists are derived in the order tasks appear in `Project.tasks`, matching the
ordering convention already established by `getTasksForRequirement` / `getRequirementsForTask` in
`001-project-workspace` (Principle II: deterministic, input-order-derived output).
