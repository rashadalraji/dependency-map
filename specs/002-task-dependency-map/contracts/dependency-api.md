# Contract: Task Dependency Domain Core API

Same nature as `001-project-workspace/contracts/core-api.md`: this app is frontend-only with no
external API, so the contract that matters is the boundary between `src/core/` (pure TypeScript)
and its callers (`src/state/useProjectStore.ts`, and transitively the UI). This document adds the
new exports this feature introduces to that boundary; the existing contract from
`001-project-workspace` is otherwise unchanged.

All functions are pure: same `Project` input (and other arguments) always produces the same
output, and none mutate their input in place (constitution Principle II).

## Dependency operations (`src/core/taskDependencyOperations.ts`)

```text
addTaskDependency(project: Project, dependentTaskId: string, prerequisiteTaskId: string): Project
removeTaskDependency(project: Project, dependentTaskId: string, prerequisiteTaskId: string): Project
```

- `addTaskDependency` MUST reject (throw) when `dependentTaskId === prerequisiteTaskId` (data
  model Integrity Rule 1) or when `wouldCreateCycle` returns true for the pair (Integrity Rule 2),
  with an error message the UI can surface to the user (spec FR-005).
- `addTaskDependency` on an already-existing pair MUST be a no-op returning an equivalent `Project`
  (Integrity Rule 3), not an error and not a duplicate.
- `removeTaskDependency` on a pair that is not currently a dependency MUST be a no-op-safe
  operation (Integrity Rule 4).

## Graph queries (`src/core/dependencyGraph.ts`)

```text
getDirectDependencies(project: Project, taskId: string): Task[]
getDirectDependents(project: Project, taskId: string): Task[]
wouldCreateCycle(project: Project, dependentTaskId: string, prerequisiteTaskId: string): boolean
```

- Never mutate `Project`; never throw for a valid-but-empty result (an unconnected task yields
  `[]` from both list queries, not an error — spec edge case).
- `wouldCreateCycle` is safe to call independently of `addTaskDependency` (e.g., by the UI, to
  disable an invalid option in a "prerequisite task" selector before the user submits).

## Modified existing export (`src/core/taskOperations.ts`, from `001-project-workspace`)

```text
removeTask(project: Project, taskId: string): Project
```

- **Behavior change**: in addition to its existing effect (removing the task and its
  `Association` records), `removeTask` MUST now also remove every `TaskDependency` referencing
  `taskId` as either `dependentTaskId` or `prerequisiteTaskId` (spec FR-011). Callers outside
  `src/core/` do not need to change — the function signature is unchanged.

## Seed data (`src/core/seedData.ts`, from `001-project-workspace`)

```text
createSeedProject(): Project
```

- **Extended, not replaced**: the returned `Project.taskDependencies` MUST contain a realistic set
  of dependencies over the existing seeded tasks, including at least one chain three-or-more tasks
  deep (spec FR-013), while remaining deterministic (two calls produce structurally identical
  results — unchanged guarantee from `001-project-workspace`).

## Consumer contract (`src/state/useProjectStore.ts`)

Adds two dispatchers alongside the existing ones from `001-project-workspace`, following the same
pattern: call exactly one core operation with current state, store its return value as the new
state, never mutate the previous `Project`, never re-implement cycle detection or graph traversal
inline in a component.

```text
addTaskDependency(dependentTaskId: string, prerequisiteTaskId: string): void
removeTaskDependency(dependentTaskId: string, prerequisiteTaskId: string): void
```
