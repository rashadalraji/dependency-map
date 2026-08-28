# Implementation Plan: Requirement Impact Analysis

**Branch**: `003-requirement-impact-analysis` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-requirement-impact-analysis/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver Ripple's headline capability: automatically log every requirement Add/Modify/Remove as a
`RequirementChange` (with a snapshot of that requirement's task associations at the moment of
change), let a user pick any recorded change and run a read-only, deterministic impact analysis
over it, and show the result as an explained list of directly and indirectly affected tasks plus
effort impact, schedule impact, and an overall risk level. Analysis is pure `src/core/`
TypeScript — no mutation, no new state-management wiring — reusing `002-task-dependency-map`'s
task dependency graph and layout machinery for a new Impact Map view. No new runtime dependencies
are introduced.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`), React 19.2 — unchanged.

**Primary Dependencies**: None new. Reuses React 19 + Vite 8, and `002-task-dependency-map`'s
`@xyflow/react` + `@dagrejs/dagre` for the Impact Map (via a shared, refactored layout helper —
see research.md #4).

**Storage**: N/A — `RequirementChange` records and analysis results live in the same in-memory
`Project` state; analysis results themselves are never stored, only computed on demand (FR-014).

**Testing**: Vitest for the new `src/core/requirementChangeLog.ts` and `src/core/impactAnalysis.ts`
unit tests (snapshot-on-change correctness, direct/indirect propagation, cycle safety,
explanation content, effort/schedule/risk calculation); React Testing Library for light tests on
the new `ChangeHistory` and `ImpactReport`/`ImpactMap` components.

**Target Platform**: Modern desktop web browsers, single-page application — unchanged.

**Project Type**: Web — frontend-only, extending the existing `001-project-workspace` /
`002-task-dependency-map` codebase in place.

**Performance Goals**: Recording a change (on every requirement add/edit/remove) and running an
analysis must both feel instantaneous at the existing seeded scale (~7 requirements, ~20 tasks,
dozens of dependencies).

**Constraints**: Analysis MUST be read-only (FR-014) and deterministic (FR-009, SC-003) — same
recorded change against an unchanged project always yields the same result.

**Scale/Scope**: Reuses the existing seeded project; adds a handful of seeded `RequirementChange`
entries, including at least one whose analysis produces both direct and indirect impact (FR-016).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain Core Independence | PASS | `requirementChangeLog.ts` and `impactAnalysis.ts` are plain TypeScript in `src/core/`, no React/DOM/graph-library imports. The Impact Map's use of `@xyflow/react`/`dagre` stays entirely in `src/components/`. |
| II. Determinism & Reproducibility | PASS | `analyzeRequirementChange` is a pure function of `(project, changeId)`; change IDs and ordering use a deterministic sequence counter (matching the existing `ids.ts` pattern), never `Date.now()` or randomness. |
| III. Explicit Dependency Representation | PASS | Reuses the existing explicit `Association` and `TaskDependency` structures; introduces no implicit relationships. |
| IV. Explainable Impact Output | PASS — first feature where this is fully binding | Every affected task in an `ImpactResult` carries a specific, traceable reason (which requirement it implements, or which specific parent task in the propagation chain it depends on), per FR-006 and data-model.md. |
| V. Test-First for Core Logic | PASS (planned) | `requirementChangeLog.ts` and `impactAnalysis.ts` get unit tests covering every edge case named in the spec (deleted-task snapshot filtering, removed-requirement analysis, cycle safety, dedup of multi-path indirect tasks, zero-association changes). |
| VI. Simplicity & Minimal Infrastructure | PASS | Zero new dependencies. No new store actions are needed — recording is folded into the existing `addRequirement`/`editRequirement`/`removeRequirement` operations, and analysis is a pure, on-demand computation the UI calls directly, not routed through `useProjectStore`'s mutation path. |

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
src/
├── core/                              # Domain Core — extends the existing 001/002 core
│   ├── types.ts                       # (modified) RequirementChange, ImpactResult types + Project fields
│   ├── ids.ts                         # (modified) adds nextChangeId
│   ├── seedData.ts                    # (modified) seeds a realistic requirementChanges history
│   ├── requirementChangeLog.ts        # (new) recordRequirementChange(project, requirementId, changeType)
│   ├── requirementOperations.ts       # (modified) add/edit/removeRequirement now log a change too
│   ├── impactAnalysis.ts              # (new) analyzeRequirementChange(project, changeId)
│   ├── requirementChangeLog.test.ts
│   └── impactAnalysis.test.ts
├── components/
│   ├── graphLayout.ts                 # (modified) shared layout extracted for reuse (research.md #4)
│   ├── Workspace.tsx                  # (modified) adds a third view: "Requirement Impact"
│   ├── ChangeHistory.tsx              # (new) lists recorded changes, "Analyze" per entry
│   ├── ImpactReport.tsx               # (new) summary: affected counts, effort/schedule impact, risk level
│   ├── ImpactMap.tsx                  # (new) reuses graphLayout, colors nodes by impact category
│   ├── ImpactMap.css                  # (new)
│   ├── ChangeHistory.test.tsx         # (new)
│   └── ImpactReport.test.tsx          # (new)
└── App.tsx                            # unchanged

(tests for src/core/* remain colocated as *.test.ts, per established convention)
```

**Structure Decision**: Continues the single frontend project — no new package, no backend, no new
dependency, no router. `useProjectStore.ts` is **not modified**: change recording rides along
inside the existing `addRequirement`/`editRequirement`/`removeRequirement` operations already
wired to the store, and analysis is a pure function the new UI calls directly (via `useMemo`),
never mutating store state. `graphLayout.ts` is refactored to share its dagre-layout core between
`DependencyMap` (relation-based highlighting) and the new `ImpactMap` (impact-category
highlighting), avoiding a second, duplicate layout implementation.
