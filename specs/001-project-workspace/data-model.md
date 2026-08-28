# Phase 1 Data Model: Project Workspace

All types below live in `src/core/types.ts` (plain TypeScript, no React/DOM imports), per the
constitution's Domain Core Independence principle. Field names are illustrative of shape and
intent, not a final API contract — see `contracts/core-api.md` for the operations that produce
and consume this data.

## Enumerations

- **RequirementPriority**: `"Low" | "Medium" | "High"`
- **RequirementStatus**: `"Proposed" | "Approved" | "Done"`
- **TaskStatus**: `"NotStarted" | "InProgress" | "Done"`

No ordering/workflow transitions are enforced between these values (FR-007/FR-010 allow setting
any status directly); they exist purely to classify state for display and progress calculation.

## Entities

### Project

The single top-level container for this MVP slice.

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Non-empty. |
| `targetDeadline` | `string` (ISO date, `YYYY-MM-DD`) | Display-only in this slice; no calendar math performed. |
| `estimatedEffortDays` | `number` | Top-level figure; positive number. Not derived from task sums (spec Assumption). |
| `requirements` | `Requirement[]` | All requirements currently in the project. |
| `tasks` | `Task[]` | All tasks currently in the project. |
| `associations` | `Association[]` | All current requirement↔task links. |
| `nextRequirementSeq` / `nextTaskSeq` | `number` | Internal counters feeding deterministic ID generation (research.md #2); not user-facing. |

### Requirement

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Deterministically generated (e.g., `req-3`); immutable once created. |
| `description` | `string` | Non-empty (trimmed). |
| `priority` | `RequirementPriority` | Required. |
| `status` | `RequirementStatus` | Required; defaults to `"Proposed"` on creation. |

**Relationships**: zero or more `Task`s, via `Association` records — never a direct array of task
IDs on the `Requirement` itself, to keep the link's ownership in one place (see Association,
below).

### Task

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Deterministically generated (e.g., `task-7`); immutable once created. |
| `title` | `string` | Non-empty (trimmed). |
| `estimatedEffortDays` | `number` | Positive number. |
| `status` | `TaskStatus` | Required; defaults to `"NotStarted"` on creation. |

**Relationships**: zero or more `Requirement`s, via `Association` records.

### Association

A join record — the explicit representation of a requirement↔task link (constitution Principle
III: explicit, inspectable relationships, never inferred).

| Field | Type | Notes |
|---|---|---|
| `requirementId` | `string` | Must reference an existing `Requirement.id`. |
| `taskId` | `string` | Must reference an existing `Task.id`. |

A given `(requirementId, taskId)` pair MUST be unique within `Project.associations` — associating
an already-linked pair again is a no-op, not a duplicate record.

## Derived Views (selectors, not stored state)

Computed on demand from `Project` state by `src/core/selectors.ts` and `src/core/progress.ts` —
never duplicated into the entities above, so there is exactly one source of truth per fact:

- `getTasksForRequirement(project, requirementId) → Task[]`
- `getRequirementsForTask(project, taskId) → Requirement[]`
- `computeProgress(project) → { totalTasks: number; doneTasks: number; percentDone: number } | { totalTasks: 0 }`
  (the zero-task shape is the distinct "no tasks yet" state from spec edge cases, not `percentDone: 0`)

## Integrity Rules (enforced by `src/core/*Operations.ts`, not by ad-hoc UI checks)

1. Removing a `Requirement` removes every `Association` referencing it; the `Task`s it pointed to
   remain in `Project.tasks` untouched (spec FR-014, edge case: remove requirement with tasks).
2. Removing a `Task` removes every `Association` referencing it; any other `Requirement`s remain
   untouched (spec FR-015, edge case: task associated with multiple requirements).
3. Associating a `Requirement` and `Task` that are already linked is idempotent (no duplicate
   `Association`).
4. `computeProgress` is a pure function of `Project.tasks` only — it does not read
   `estimatedEffortDays` at the project level and is unaffected by `associations` or
   `requirements` (keeps the "reflects the mix of task statuses" rule in research.md #3 exact and
   easy to unit-test in isolation).
