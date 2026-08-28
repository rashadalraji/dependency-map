# Implementation Plan: Task Dependency Map

**Branch**: `002-task-dependency-map` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-task-dependency-map/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

> **Clarification note**: `/speckit-clarify` was started but not completed for this spec — only
> one of three identified questions was asked, and it was left unanswered before `/speckit-plan`
> was invoked. Per the constitution's spirit of documented assumptions over silent guesses, this
> plan makes an explicit, reasoned default for each open question (interactivity scope, status
> encoding on nodes, and whether dependency creation is status-restricted) and flags all three in
> `research.md` as assumptions pending confirmation, rather than blocking on them.

## Summary

Extend the existing project workspace with explicit, typed task-to-task dependencies and an
interactive Dependency Map: every task renders as a node, every dependency as a directed edge,
selecting a task shows its direct dependencies/dependents, and creating a dependency is validated
against self-dependency and transitive cycles before being accepted. Dependency storage and graph
queries (direct deps/dependents, cycle detection) live in `src/core/` as plain TypeScript,
extending the existing `Project`/`Task` domain core; the map itself is rendered by a focused
graph-visualization library in the UI layer only, keeping the constitution's Domain Core
Independence boundary intact.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`), targeting ES2023, on React 19.2 — unchanged from `001-project-workspace`.

**Primary Dependencies**: React 19 + Vite 8 (existing). New: `@xyflow/react` (React Flow) for the
interactive node-link Dependency Map (built-in pan/zoom, click-to-select), and `@dagrejs/dagre` for
deterministic automatic graph layout — see research.md #1-#2 for why these are justified additions
under the constitution's Simplicity principle.

**Storage**: N/A — task dependencies live in the same in-memory `Project` state as the rest of the
app (extends the existing `useProjectStore`); no persistence of any kind.

**Testing**: Vitest for the new `src/core/taskDependencyOperations.ts` and
`src/core/dependencyGraph.ts` unit tests (cycle/self/duplicate-edge cases named in the spec);
React Testing Library for light interaction tests on the map's plain-list/select/create/remove
controls (not asserting on the visualization library's internal SVG rendering).

**Target Platform**: Modern desktop web browsers, single-page application — unchanged.

**Project Type**: Web — frontend-only single project, extending the existing `001-project-workspace` codebase in place (no new project/package).

**Performance Goals**: Creating/removing a dependency, selecting a task, and re-laying-out the map
must all feel instantaneous at the seeded scale (~20 tasks, on the order of dozens of
dependencies); cycle detection (a graph traversal over the full existing dependency set) must run
synchronously with no visible delay at that scale.

**Constraints**: Frontend-only, no backend/database/authentication (per spec and constitution);
dependencies are directed and binary; cycle prevention must consider the full transitive closure,
not just the two tasks in the attempted new dependency.

**Scale/Scope**: Single project (existing seeded seed from `001-project-workspace`, ~20 tasks);
seeded dependencies extended to include at least one chain three-or-more tasks deep, per FR-013.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain Core Independence | PASS | `taskDependencyOperations.ts` and `dependencyGraph.ts` are plain TypeScript in `src/core/`, no `react`/`react-dom`/DOM imports. The graph-visualization library is used exclusively in `src/components/DependencyMap.tsx`; Core never imports it. |
| II. Determinism & Reproducibility | PASS | Cycle detection is a pure reachability computation over explicit input state (no randomness/time). Dagre layout is deterministic for a given graph (same nodes/edges in, same positions out), so the rendered map is stable across reloads for the same data. |
| III. Explicit Dependency Representation | PASS | This feature is the first to fully realize this principle for the app: `TaskDependency` is exactly the explicit, typed, directed-edge structure the constitution calls for — never inferred from naming or position. |
| IV. Explainable Impact Output | N/A for this slice | This feature manages and visualizes structural dependencies only; it computes no requirement-change "impact result." Deferred to a later feature. |
| V. Test-First for Core Logic | PASS (planned) | `addTaskDependency`, `removeTaskDependency`, `wouldCreateCycle`, `getDirectDependencies`, `getDirectDependents` all get unit tests covering the spec's named edge cases (self-dependency, indirect cycle, duplicate, no-op removal, orphan node). |
| VI. Simplicity & Minimal Infrastructure | CONDITIONAL PASS — justified below | Two new dependencies are added (`@xyflow/react`, `@dagrejs/dagre`). No state-management library, backend, or router is introduced; the map is added as an in-page view (no routing) per the existing `001-project-workspace` decision. |

Two additions require justification under Principle VI — see Complexity Tracking below. No other
violations.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Add `@xyflow/react` dependency | FR-001/002/003 require an interactive node-link map (directed edges, click-to-select, pan/zoom) | Hand-rolled SVG pan/zoom, hit-testing, and edge routing would itself be a larger, bespoke abstraction — more code to keep correct and tested than adopting one focused, widely-used library for exactly this problem |
| Add `@dagrejs/dagre` dependency | The map needs a deterministic automatic layout so both seeded and user-created graphs stay readable without manual positioning (SC-006) | Hand-writing a layered/topological graph-layout algorithm duplicates well-solved, non-trivial logic that is not this app's actual purpose |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── core/                            # Domain Core — extends the existing 001-project-workspace core
│   ├── types.ts                     # (modified) adds TaskDependency + Project.taskDependencies
│   ├── seedData.ts                  # (modified) adds seeded task dependencies, incl. a 3+ deep chain
│   ├── taskOperations.ts            # (modified) removeTask also purges referencing dependencies
│   ├── taskDependencyOperations.ts  # (new) addTaskDependency, removeTaskDependency
│   ├── dependencyGraph.ts           # (new) getDirectDependencies, getDirectDependents, wouldCreateCycle
│   ├── taskDependencyOperations.test.ts
│   └── dependencyGraph.test.ts
├── state/
│   └── useProjectStore.ts           # (modified) adds addTaskDependency/removeTaskDependency actions
├── components/
│   ├── Workspace.tsx                # (modified) adds a view toggle: Workspace | Dependency Map
│   ├── DependencyMap.tsx            # (new) React Flow graph + selected-task detail panel + create/remove controls
│   ├── DependencyMap.css            # (new)
│   └── DependencyMap.test.tsx       # (new) light interaction tests (selection, create, remove)
└── App.tsx                          # unchanged (still renders <Workspace />)

(tests for src/core/* remain colocated as *.test.ts next to the code they cover, per
001-project-workspace's established convention)
```

**Structure Decision**: Continues the single frontend project from `001-project-workspace` — no
new package, no backend, no router. The Dependency Map is added as a second in-page view inside
the existing `Workspace`, toggled with local component state, consistent with that feature's
"no routing library" decision (research.md #7). All new domain logic extends the existing
`src/core/` boundary; the only new UI-facing surface is `DependencyMap.tsx` and its stylesheet.
