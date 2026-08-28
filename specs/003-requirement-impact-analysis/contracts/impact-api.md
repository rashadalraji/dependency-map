# Contract: Requirement Impact Analysis Domain Core API

Same nature as the `001`/`002` contracts: this app has no external API, so the contract that
matters is the boundary between `src/core/` (pure TypeScript) and its callers
(`src/state/useProjectStore.ts` and the UI). This document adds this feature's exports and the one
modified existing surface; the `001`/`002` contracts are otherwise unchanged.

All functions are pure: same input always produces the same output, and none mutate their input
in place (constitution Principle II).

## Change logging (`src/core/requirementChangeLog.ts`)

```text
recordRequirementChange(
  project: Project,
  requirementId: string,
  changeType: RequirementChangeType,
  requirementDescriptionSnapshot: string,
): Project
```

- Appends one `RequirementChange` with a fresh, deterministic `id` (`nextChangeId`), the given
  `requirementId`/`changeType`/`requirementDescriptionSnapshot`, and
  `directlyAssociatedTaskIds` set to the task IDs currently associated with `requirementId` in
  `project.associations` at the moment this function is called.
- MUST be called with the *pre-removal* project state when used from `removeRequirement`, so the
  snapshot captures the associations that are about to be deleted (data-model Integrity Rule 2).

## Modified existing exports (`src/core/requirementOperations.ts`, from `001-project-workspace`)

```text
addRequirement(project: Project, input: AddRequirementInput): Project
editRequirement(project: Project, requirementId: string, changes: EditRequirementChanges): Project
removeRequirement(project: Project, requirementId: string): Project
```

- **Behavior change**: each now also calls `recordRequirementChange` as described above, so the
  returned `Project` includes one new `RequirementChange` in addition to each function's existing
  effect. Signatures are unchanged; existing callers need no changes.

## Impact analysis (`src/core/impactAnalysis.ts`)

```text
analyzeRequirementChange(project: Project, changeId: string): ImpactResult
```

- Looks up the `RequirementChange` by `changeId` (throws if not found — this is a programming
  error, not a user-facing validation case, since the UI only ever passes an ID it read from
  `project.requirementChanges`).
- Computes `affectedTasks`, `effortImpactDays`, `scheduleImpactDays`, and `riskLevel` exactly as
  specified in `data-model.md` and `research.md` #3.
- Never mutates `project`; safe to call repeatedly and to call speculatively (e.g., from a
  `useMemo`) without any store interaction.

## Seed data (`src/core/seedData.ts`, from `001-project-workspace`)

```text
createSeedProject(): Project
```

- **Extended, not replaced**: the returned `Project.requirementChanges` MUST contain a realistic
  set of change entries, including at least one whose `analyzeRequirementChange` result has a
  non-empty `affectedTasks` with at least one `'direct'` and one `'indirect'` entry (spec FR-016).
  Remains deterministic (two calls produce structurally identical results).

## Consumer contract (UI layer)

- The UI reads `project.requirementChanges` directly (no new store action needed) to render the
  change history.
- The UI calls `analyzeRequirementChange(project, changeId)` directly — typically memoized — to
  get an `ImpactResult` for display; this call is never passed through `useProjectStore`'s
  `setProject` path, since it does not change project state (data-model Integrity Rule 5).
