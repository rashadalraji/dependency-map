# Phase 0 Research: Impact Visualization Clarity

No `NEEDS CLARIFICATION` markers remain — this feature closes two concrete, already-diagnosed gaps
rather than opening new design questions. The items below are the technical decisions needed to
close them precisely.

## 1. Determining which edges are "in the chain"

**Decision**: An edge (a `TaskDependency` between a prerequisite and a dependent task) is part of
the affected chain if and only if *both* its prerequisite and dependent task IDs appear in the
`ImpactResult.affectedTasks` set (direct or indirect, either one), computed as a simple set-lookup
against the same `affectedTasks` list `ImpactReport` already renders.

**Rationale**: Matches the spec's Assumption exactly: "every dependency connection where both
connected tasks are part of that result" — the natural, complete path a user would trace by eye,
not a narrower definition tied to the specific parent pointer the underlying BFS happened to
record first (which only matters for wording one task's *reason*, not for whether a given edge
looks like part of the picture).

**Alternatives considered**: Restricting "in-chain" to only the exact `causedBy` parent-edges
recorded during `analyzeRequirementChange`'s traversal (`003`'s `impactAnalysis.ts`) — rejected as
visually incomplete: if two directly affected tasks also happen to be directly connected, spec
edge case #1 explicitly calls for that connection to be shown as part of the chain too, which the
narrower definition would miss.

## 2. Rendering emphasized vs. de-emphasized edges

**Decision**: Extend `buildImpactGraphElements` to tag each edge with the same relation vocabulary
already used for nodes, collapsed to two visual buckets: edges where the *dependent* (target) end
is `'direct'` or `'indirect'` render with that category's color (reusing `RELATION_INFO`) at full
opacity and a heavier stroke; all other edges render muted (a low-contrast gray, low opacity, thin
stroke). Applied via each edge's `style`/`className` and the arrowhead marker's `color` field
(`@xyflow/react`'s existing per-edge customization — no new dependency).

**Rationale**: Coloring an edge by the category of the task impact is flowing *into* (the
dependent end) turns the chain into a readable little narrative — the arrows visually "hand off"
direct-affected-red into indirect-affected-orange as the ripple travels outward — while still
reusing the one color definition (`RELATION_INFO`) US2 requires the Report to match.

**Alternatives considered**: A single flat "emphasized" color for every in-chain edge regardless
of what it leads to — simpler, but loses the direct-vs-indirect distinction the Report itself
draws, weakening the Report/Map correspondence FR-005 asks for.

## 3. Enforcing Report/Map color consistency

**Decision**: Remove `ImpactReport.tsx`'s local `RISK_BADGE_CLASS`-style hardcoded
direct/indirect color mapping for affected-task entries and import `RELATION_INFO` from
`graphLayout.ts` instead, using its `swatchClassName` (adapted to a border/text utility) and
`label` for both the category badge and the border accent. (The risk-level badge coloring is
unrelated — it stays local, since risk level is not one of the Map's node/edge categories.)

**Rationale**: This is the direct, minimal fix for the duplication found in the audit — one
constant, two consumers, enforced by import rather than by convention or a comment asking future
edits to "remember to keep these in sync."

**Alternatives considered**: Adding a test that compares the two color mappings for equality
without removing the duplication — rejected as treating the symptom; the duplication itself is the
defect research.md is meant to close, and a passing "colors happen to match" test doesn't prevent
future drift the way importing one shared constant does.

## 4. Communicating "no impact" on the map itself

**Decision**: When `ImpactMap` receives a `result` with an empty `affectedTasks` array (or
`null`), render a small, explicit banner ("No tasks are affected by this change.") above or over
the graph, in addition to the existing `ImpactReport` empty-state text — rather than relying on
the user to infer "no impact" from a graph where every node happens to be in the de-emphasized
"unaffected" state.

**Rationale**: Directly satisfies spec FR-008/User Story 3: a fully de-emphasized graph is
visually indistinguishable from "the highlighting feature isn't working," so an explicit statement
is needed on the map, not just in the adjacent Report panel.

**Alternatives considered**: Relying solely on the Impact Report's existing empty-state text since
the two panels are shown side by side — rejected because spec Independent Test for User Story 3
explicitly requires the Map alone (without consulting the Report) to communicate "no impact."
