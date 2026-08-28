# Implementation Plan: Impact Visualization Clarity

**Branch**: `005-impact-visualization-clarity` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-impact-visualization-clarity/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Close two concrete gaps found by auditing the existing Impact Map/Report against this spec: (1)
dependency *edges* in the Impact Map are not yet relation-aware — every edge renders identically
regardless of whether it connects two affected tasks, so a multi-hop "chain" doesn't visually read
as a connected path — and (2) `ImpactReport.tsx` hardcodes its own direct/indirect colors instead
of drawing from the same `RELATION_INFO` constant `TaskNode`/`GraphLegend` already use, so nothing
guarantees the Report and Map stay visually consistent. Both are presentation-only fixes over
`003-requirement-impact-analysis`'s existing analysis and `004-visual-design-polish`'s existing
visual language — no new dependency, no `src/core/` change, no change to any computed result.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`), React 19.2 — unchanged.

**Primary Dependencies**: None new. Uses `@xyflow/react`'s existing per-edge `className`/`style`
and marker-color support (already a dependency since `002-task-dependency-map`) and the Tailwind
CSS utilities already integrated in `004-visual-design-polish`.

**Storage**: N/A — no data model or state shape change.

**Testing**: Vitest + React Testing Library — unchanged tooling. `graphLayout.test.ts` gains
coverage for `buildImpactGraphElements`'s edge-relation logic (currently untested — only
`buildDependencyGraphElements` has tests today); `ImpactReport.test.tsx` gains a case asserting
its category colors come from the shared constant, not a local duplicate.

**Target Platform**: Modern desktop web browsers, single-page application — unchanged.

**Project Type**: Web — frontend-only, refining the existing `003`/`004` codebase in place.

**Performance Goals**: No perceptible change; computing an edge's chain membership is an O(1)
set-membership check per edge at the existing seeded scale (dozens of edges).

**Constraints**: Presentation-only (spec FR-009) — the set of affected tasks, effort impact,
schedule impact, and risk level MUST remain byte-for-byte identical to before this feature
(SC-005); zero change to `src/core/`.

**Scale/Scope**: Two components (`graphLayout.ts`'s `buildImpactGraphElements`, `ImpactReport.tsx`)
plus a small addition to `ImpactMap.tsx` for the explicit "no impact" message (spec FR-008); no
new views, no new dependencies, no new entities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain Core Independence | PASS | Touches only `src/components/*`. Zero changes to `src/core/`. |
| II. Determinism & Reproducibility | PASS | Edge chain-membership is a pure function of the already-deterministic `ImpactResult`; same result always produces the same emphasized/de-emphasized edge set. |
| III. Explicit Dependency Representation | N/A | No change to how dependencies are stored or queried — only to how already-explicit `TaskDependency` edges are displayed. |
| IV. Explainable Impact Output | PASS — directly reinforced | This feature exists specifically to make the already-explainable `ImpactResult` (FR-006 explanations from `003`) visually legible as a connected path, which is the spirit of this principle carried into the UI layer. |
| V. Test-First for Core Logic | N/A | No `src/core/` logic changes. New coverage is added for `buildImpactGraphElements` (a UI-layer function) per the constitution's allowance for lighter UI-level testing, closing a pre-existing test gap. |
| VI. Simplicity & Minimal Infrastructure | PASS | Zero new dependencies; reuses existing `@xyflow/react` edge-styling capability and the existing `RELATION_INFO` constant rather than introducing a new styling mechanism. |

No violations — Complexity Tracking table is not applicable.

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
src/components/
├── graphLayout.ts                # (modified) buildImpactGraphElements computes per-edge chain
│                                  #   membership; RELATION_INFO gains edge-style metadata
├── graphLayout.test.ts           # (modified) new describe block for buildImpactGraphElements
├── ImpactMap.tsx                 # (modified) renders emphasized/de-emphasized edges; shows an
│                                  #   explicit "no impact" message when the result is empty
├── ImpactReport.tsx               # (modified) reads its category colors from RELATION_INFO
│                                  #   instead of a local, duplicated color mapping
└── ImpactReport.test.tsx         # (modified) asserts the Report's colors match RELATION_INFO
```

**Structure Decision**: Continues the single frontend project — no new package, no new dependency,
no `src/core/` change. Everything is additive-or-corrective within the existing `graphLayout.ts` /
`ImpactMap.tsx` / `ImpactReport.tsx` trio that already implements the Impact Map and Impact
Report from `003-requirement-impact-analysis`.
