# Phase 1 Data Model: Requirement Impact Analysis

Extends the existing domain core (`src/core/types.ts`) from `001-project-workspace` and
`002-task-dependency-map`. `Requirement`, `Task`, `Association`, and `TaskDependency` are
unchanged. All additions are listed in full below; modifications to existing functions are called
out explicitly.

## New Types

### RequirementChangeType

```
'Added' | 'Modified' | 'Removed'
```

### RequirementChange

A recorded event; the input to an impact analysis.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Deterministically generated (e.g., `change-4`); immutable. |
| `requirementId` | `string` | The requirement this change concerns. May no longer exist in `Project.requirements` if `changeType` is `'Removed'`. |
| `changeType` | `RequirementChangeType` | What kind of change occurred. |
| `requirementDescriptionSnapshot` | `string` | The requirement's description at the moment of the change, so it can still be displayed after a later removal or edit. |
| `directlyAssociatedTaskIds` | `string[]` | Snapshot of `Association` task IDs for this requirement at the moment of the change (research.md #1-#2). May reference a task later deleted; `analyzeRequirementChange` filters these against currently-existing tasks. |

### ImpactRiskLevel

```
'Low' | 'Medium' | 'High' | 'Critical'
```

### AffectedTask

One entry in an `ImpactResult`'s affected-task list.

| Field | Type | Notes |
|---|---|---|
| `taskId` | `string` | |
| `relation` | `'direct' \| 'indirect'` | |
| `reason` | `string` | Human-readable explanation (research.md #3). |

### ImpactResult

The computed, non-persisted outcome of `analyzeRequirementChange`.

| Field | Type | Notes |
|---|---|---|
| `changeId` | `string` | The `RequirementChange` analyzed. |
| `affectedTasks` | `AffectedTask[]` | Directly affected tasks first, then indirectly affected, each exactly once (data-model Integrity Rule 3). |
| `effortImpactDays` | `number` | Sum of affected tasks' `estimatedEffortDays` (research.md #3). |
| `scheduleImpactDays` | `number` | Longest dependency-connected chain among affected tasks, by summed effort (research.md #3). |
| `riskLevel` | `ImpactRiskLevel` | research.md #3's two-tier rule. |

## Modified Type

### Project

Adds two fields, appended after `nextTaskSeq` to match the existing field-addition style:

| Field | Type | Notes |
|---|---|---|
| `requirementChanges` | `RequirementChange[]` | Every recorded change, in the order recorded. |
| `nextChangeSeq` | `number` | Feeds `nextChangeId`, following the existing `ids.ts` pattern. |

## Integrity Rules

1. `addRequirement`, `editRequirement`, and `removeRequirement` (`src/core/requirementOperations.ts`)
   each append exactly one `RequirementChange` to the returned `Project`, with `changeType` set to
   `'Added'`, `'Modified'`, and `'Removed'` respectively.
2. `removeRequirement`'s appended change's `directlyAssociatedTaskIds` MUST reflect the
   associations that existed immediately before removal, not the (now-empty) post-removal state.
3. `analyzeRequirementChange` MUST include a given task in `ImpactResult.affectedTasks` at most
   once, even if reachable both directly and via multiple indirect dependency chains — direct
   status takes precedence if a task is both directly associated and reachable indirectly.
4. `analyzeRequirementChange` MUST terminate and produce a well-defined result even if
   `project.taskDependencies` contains a cycle (FR-013), and MUST silently drop any
   `directlyAssociatedTaskIds` entry that no longer has a matching `Task` in `project.tasks`
   (spec edge case).
5. `analyzeRequirementChange` MUST NOT mutate `project` in any way (FR-014) — it is a pure query,
   never routed through `useProjectStore`'s state-setting path.

## Function Signatures (see `contracts/impact-api.md` for the full contract)

```text
recordRequirementChange(project: Project, requirementId: string, changeType: RequirementChangeType, requirementDescriptionSnapshot: string): Project
analyzeRequirementChange(project: Project, changeId: string): ImpactResult
```
