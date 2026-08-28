# Phase 0 Research: Task Dependency Map

Items #4-#6 originally resolved open product-scope questions that `/speckit-clarify` started but
did not finish for this spec (only one of three planned questions was asked, and it went
unanswered before `/speckit-plan` was invoked), recorded at the time as explicit, reasoned
defaults pending user confirmation. All three were confirmed as-is by the user during Phase 6
polish (`/speckit-implement`, 2026-08-28) — no changes were needed. Items #1-#3 and #7 are ordinary
technical-decision research with no open question behind them.

## 1. Graph visualization library

**Decision**: Use `@xyflow/react` (React Flow) to render the Dependency Map — tasks as nodes,
dependencies as directed edges, with built-in pan/zoom and click-to-select interaction.

**Rationale**: FR-001/002/003 require a genuinely interactive node-link diagram: directed edges
that are visually distinguishable by direction, click-to-select with highlighting, and (per
research.md #4) pan/zoom. React Flow is a focused, widely-used React library solving exactly this
problem, with first-class support for custom node rendering (needed for status color-coding, see
#5) and disabling drag when a scope calls for it (see #4).

**Alternatives considered**:
- *Hand-rolled SVG*: Would require building pan/zoom, hit-testing, and edge-arrow rendering from
  scratch — a larger, bespoke abstraction than adopting one purpose-built library, and a worse fit
  for the constitution's Simplicity principle than the library itself once panning/zooming and
  selection are both in scope.
- *Cytoscape.js / vis-network*: Capable but more imperative, less React-idiomatic integration for
  a React app already built around hooks and component composition; heavier feature surface than
  this MVP needs.
- *Raw D3*: Very low-level; would still require hand-building interaction and rendering on top of
  it, incurring the same rejection rationale as hand-rolled SVG.

## 2. Graph layout algorithm

**Decision**: Use `@dagrejs/dagre` to compute a deterministic layered layout (node positions) from
the task/dependency graph before handing nodes and edges to React Flow.

**Rationale**: The map needs a readable, automatic layout (SC-006) without asking users to
manually position nodes. Dagre is synchronous, lightweight, and — for a fixed graph — produces the
same layout every time, which keeps the map's appearance stable across reloads for the same data,
consistent with the app's general preference for determinism.

**Alternatives considered**:
- *elkjs*: More powerful layout engine, but heavier and commonly used asynchronously — unjustified
  complexity at this app's scale (~20 tasks).
- *Force-directed simulation (e.g., d3-force)*: Iterative and physics-based; layout can vary
  between runs or settle differently depending on simulation ticks, which fights the goal of a
  stable, predictable map for the same underlying data.
- *Manual/fixed grid layout*: Would not scale visually once dependency chains and branching exist;
  rejected as insufficient for SC-006's readability bar.

## 3. Cycle detection algorithm

**Decision**: Before accepting a new dependency (`dependentTaskId` depends on `prerequisiteTaskId`),
run a graph traversal (BFS/DFS) starting from `prerequisiteTaskId` following existing "depends on"
edges forward; if `dependentTaskId` is reachable, the new dependency would close a cycle and is
rejected. Self-dependency (`dependentTaskId === prerequisiteTaskId`) is checked first as a trivial
case of the same rule.

**Rationale**: This directly matches the spec's requirement to detect cycles across "the full
chain of existing dependencies, not just direct pairs" (edge cases) at O(V+E) cost per attempted
create — trivial at the seeded scale (~20 tasks, dozens of edges).

**Alternatives considered**:
- *Maintaining an incrementally-updated transitive-closure matrix*: Would make detection O(1) per
  check but adds real bookkeeping complexity (updating the matrix on every add/remove) with no
  measurable benefit at this scale — premature optimization the constitution's Simplicity
  principle argues against.

## 4. Interactivity scope (confirmed)

**Decision**: The map supports click-to-select (to highlight a task's direct
dependencies/dependents) plus pan/zoom. Manual node dragging/repositioning is disabled
(`nodesDraggable={false}` in React Flow).

**Rationale**: This was the recommended option presented mid-`/speckit-clarify` before the session
was interrupted. Pan/zoom gives headroom for SC-006's "readable at dozens of tasks" bar without
committing to the much larger scope of a persisted, user-editable layout — which would have no
lasting benefit anyway, since the app's state (per FR-012) resets on every reload. **Confirmed by
the user during Phase 6 polish** (2026-08-28) — no change needed.

**Alternatives considered**: Click-to-select only (risks poor readability at scale, no
mitigation); fully draggable layout (materially larger scope for a benefit that can't persist in
an in-memory-only app).

## 5. Status encoding on map nodes (confirmed)

**Decision**: Each task node is color/style-coded by the task's existing `status` field
(`NotStarted` / `InProgress` / `Done`), reusing data the app already has.

**Rationale**: Low implementation cost (a custom React Flow node component reading `task.status`),
and directly supports the spec's stated goal of helping users "understand how work is connected"
by showing connection structure and progress state together, without requiring any new Core logic
or data. **Confirmed by the user during Phase 6 polish** (2026-08-28) — no change needed.

**Alternatives considered**: Structure-only map (no status color) — simpler, but a plausible
usability regression given the information is already available and free to show.

## 6. Status-based restriction on creating dependencies (confirmed)

**Decision**: Dependency creation is **not** restricted by either task's status — a dependency is
a structural fact independent of whether either task is `NotStarted`, `InProgress`, or `Done`.

**Rationale**: The spec does not request such a rule, and the constitution's Simplicity principle
argues against adding unrequested business logic. Cycle/self-dependency prevention (explicitly
required) remains the only validation on creation. **Confirmed by the user during Phase 6 polish**
(2026-08-28) — no change needed.

**Alternatives considered**: Blocking new dependencies that involve an already-`Done` task —
plausible in a real PM tool, but out of scope unless requested; would add a second validation path
with its own edge cases (e.g., what if the `Done` task is later reopened?) for no requirement in
this spec.

**Flag**: Confirm with the user; if a restriction is wanted, it is an additional check inside
`addTaskDependency` with its own unit tests — no data-model impact.

## 7. Where the map lives in the UI

**Decision**: Add the Dependency Map as a second in-page view inside the existing `Workspace`
component, switched via a simple local-state toggle (e.g., two buttons: "Workspace" / "Dependency
Map"). No routing library is introduced.

**Rationale**: `001-project-workspace`'s plan already decided against a routing library absent a
demonstrated multi-page need (its research.md #5). This feature doesn't demonstrate one either —
a single additional view, toggled locally, satisfies every functional requirement here.

**Alternatives considered**: `react-router` with a `/dependencies` route — rejected as
infrastructure not justified by any requirement in this spec, per constitution Principle VI.
