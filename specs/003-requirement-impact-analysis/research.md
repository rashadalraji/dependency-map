# Phase 0 Research: Requirement Impact Analysis

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature reuses the
existing stack entirely. The items below are the concrete algorithmic and structural decisions
needed to implement the spec's deterministic-rules requirement precisely.

## 1. Where and how a `RequirementChange` is recorded

**Decision**: `addRequirement`, `editRequirement`, and `removeRequirement` (in
`src/core/requirementOperations.ts`) each call a new `recordRequirementChange` helper as the last
step of their existing pipeline, appending one `RequirementChange` to `project.requirementChanges`.
For `removeRequirement`, the association snapshot MUST be captured *before* the requirement and
its associations are deleted from the returned project.

**Rationale**: Matches the spec's Assumption that recording is automatic, not a separate manual
action. Folding it into the existing three functions means no new store action or UI step is
needed (constitution Principle VI) — every existing call site that already performs these edits
gets change history for free.

**Alternatives considered**: A separate `logRequirementChange` action the UI calls explicitly
after an edit — rejected because it requires every call site to remember two calls instead of one,
and risks a change being edited without ever being logged.

## 2. Direct-impact snapshot vs. live association lookup

**Decision**: `RequirementChange.directlyAssociatedTaskIds` is a snapshot captured at record time.
`analyzeRequirementChange` filters this snapshot against tasks that currently exist in
`project.tasks` (spec edge case: a snapshotted task may have since been deleted).

**Rationale**: A snapshot is the only way to analyze a "Removed" change at all, since
`removeRequirement` deletes the live `Association` records (spec User Story 3, acceptance scenario
3). Filtering against current tasks keeps the analysis from referencing a task that no longer
exists, without needing a separate "task still exists" flag on the snapshot itself.

**Alternatives considered**: Re-deriving direct impact live from current associations for
`Added`/`Modified` changes and only snapshotting for `Removed` — rejected for consistency: one
snapshot rule for all three change types is simpler to implement, test, and explain than a rule
that behaves differently per change type.

## 3. Indirect-impact traversal, explanation, effort, schedule, and risk calculation

**Decision**:
- **Indirect propagation**: breadth-first traversal from every directly affected task using the
  existing `getDirectDependents` (from `002-task-dependency-map`'s `dependencyGraph.ts`), moving
  only "downstream" (spec Assumption: never to a task's own prerequisites). A `causedBy` map
  records, for each newly-discovered task, the specific task whose inclusion led to it — used
  verbatim for that task's explanation (spec User Story 2, acceptance scenario 3: name the actual
  parent, not the original change). A `visited` set prevents re-processing and handles any cycle
  safely (FR-013) and dedups a task reached via two different chains (edge case).
- **Explanations**: a directly affected task's reason is `Implements the changed requirement:
  "<description>".` An indirectly affected task's reason is `Depends on "<parent task title>",
  which <is directly affected by this change | is also affected by this change>.`, using the
  `causedBy` parent and whether that parent is itself direct or indirect.
- **Effort impact**: sum of `estimatedEffortDays` over the union of directly and indirectly
  affected tasks.
- **Schedule impact**: the longest path, by summed `estimatedEffortDays`, through the subgraph
  induced by the affected tasks and the `taskDependencies` edges connecting them (a standard
  longest-path-in-a-DAG calculation, safe because `002-task-dependency-map` already prevents
  cycles from being created). Unconnected affected tasks do not add to this figure, per spec
  FR-008.
- **Risk level**: two independent tiers are computed and the higher one wins —
  - by affected-task count: 0 → Low, 1-2 → Medium, 3-5 → High, 6+ → Critical
  - by schedule impact (days): 0 → Low, 1-3 → Medium, 4-9 → High, 10+ → Critical

**Rationale**: Every rule above is a small, well-understood, deterministic graph or arithmetic
computation — no calendars, resource contention, or business-day logic (constitution Principle
VI: no unjustified complexity). The two-tier "take the higher" risk rule means either a wide
change (many tasks, short chains) or a deep one (few tasks, one long chain) is correctly flagged
as serious, which a single count-only or schedule-only rule would miss.

**Alternatives considered**:
- *Sum of all affected tasks' effort as the schedule impact too*: rejected — it overstates
  schedule impact when affected tasks can proceed in parallel, which is exactly what FR-008 asks
  to avoid.
- *A single combined risk score (e.g., weighted sum)*: rejected as harder to explain to a
  non-technical user than "the higher of two plain-language tiers," and no requirement calls for
  a continuous score.

## 4. Reusing the Dependency Map's layout for the Impact Map

**Decision**: Refactor `src/components/graphLayout.ts` to separate the dagre-based node/edge
layout computation (task positions, dependency edges) from the *visual category* assigned to each
node. `DependencyMap` continues to categorize nodes by selection relation
(selected/dependency/dependent/unrelated, from `002-task-dependency-map`); the new `ImpactMap`
categorizes nodes by impact role (direct/indirect/unaffected) using the same underlying layout.

**Rationale**: The two views need the same graph, the same deterministic positions, and the same
"tasks as nodes, dependencies as directed edges" rendering — duplicating that would violate
constitution Principle VI (no unjustified duplication) and risk the two views drifting apart
visually. The only genuinely different thing between them is what determines a node's color.

**Alternatives considered**: A second, independent layout module for the Impact Map — rejected as
needless duplication of already-correct, already-tested layout logic.
