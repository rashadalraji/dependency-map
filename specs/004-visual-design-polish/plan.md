# Implementation Plan: Visual Design Polish

**Branch**: `004-visual-design-polish` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-visual-design-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Restyle the entire application — Workspace, Dependency Map, and Requirement Impact views — with
Tailwind CSS (per clarification), replacing all hand-written component stylesheets with utility
classes under a shared, corporate/structured design-token set (dense layout, visible
borders/dividers, muted neutral palette with the existing accent hue preserved). Add the two
small structural gaps this exposes against the spec's requirements — a shared graph legend
(FR-003) and empty-state messaging on lists that don't yet have it (FR-007) — as additive,
presentation-only UI, with zero changes to `src/core/` and zero change in what any view shows or
computes (SC-005).

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`), React 19.2 — unchanged.

**Primary Dependencies**: New: `tailwindcss` v4 + `@tailwindcss/vite` (per clarification —
research.md #1). Existing: React 19 + Vite 8 + `@xyflow/react` + `@dagrejs/dagre`, all unchanged.
All existing hand-written stylesheets (`Workspace.css`, `DependencyMap.css`, `ImpactMap.css`,
`TaskNode.css`) are removed once their components are migrated to Tailwind utilities, per
clarification (no parallel styling approaches).

**Storage**: N/A — unchanged; this feature touches no data model or state shape.

**Testing**: Vitest + React Testing Library — unchanged tooling. Existing component tests that
scope queries by a hand-written CSS class (found: `DependencyMap.test.tsx`) are updated to scope
by `data-testid` instead, decoupling test structure from styling (research.md #3), while every
test's functional assertions (what data/behavior is verified) are preserved unchanged (SC-005).
No new `src/core/` tests are needed, since `src/core/` is not touched by this feature.

**Target Platform**: Modern desktop web browsers, single-page application — unchanged.

**Project Type**: Web — frontend-only, restyling the existing `001`/`002`/`003` codebase in place.

**Performance Goals**: No perceptible change to load or interaction performance; Tailwind v4 is
JIT-only (ships only the utility classes actually used), so bundle size should not regress
meaningfully versus the hand-written CSS it replaces.

**Constraints**: Presentation-only (FR-009) — zero change to data, calculations, or navigation
destinations; zero regression across any prior feature's acceptance scenarios (SC-005); existing
light/dark theme-awareness must be preserved (spec Assumptions).

**Scale/Scope**: All existing components across all three views (~11 components, 4 stylesheet
files) are restyled; two small new pieces of UI are added (a shared graph legend, and empty-state
messages on lists that lack them); no new views, routes, or pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain Core Independence | PASS | This feature touches only `src/components/*`, `src/App.tsx`, `src/index.css`, and build config. Zero changes to `src/core/`. |
| II. Determinism & Reproducibility | N/A | No computation logic changes; every view renders the same, already-deterministic data exactly as before — only its appearance changes. |
| III. Explicit Dependency Representation | N/A | No dependency-graph or data-relationship changes. |
| IV. Explainable Impact Output | PASS — reinforced | FR-003/FR-008 (legends, text labels alongside every color) make the existing Impact Map's explainability more legible, not less. |
| V. Test-First for Core Logic | N/A | No `src/core/` logic changes. Per SC-005, every existing test's functional assertions must keep passing; where a test's *scoping* depends on styling structure, it is updated in the same change that restructures that markup (research.md #3). |
| VI. Simplicity & Minimal Infrastructure | CONDITIONAL PASS — justified below | Adds `tailwindcss` + `@tailwindcss/vite` as new dependencies — a deviation from the project's default of avoiding new infrastructure, justified explicitly by the user's informed choice during `/speckit-clarify` (Q1), not a silent addition. |

One addition requires justification under Principle VI — see Complexity Tracking below. No other
violations.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Add `tailwindcss` + `@tailwindcss/vite` dependencies | The user explicitly chose a utility-first CSS framework during `/speckit-clarify` (spec Clarifications, Q1) for restyling the entire application consistently | The simpler default — continuing with hand-written CSS, which was presented as the recommended option — was explicitly declined by the user in favor of Tailwind for this full-app restyle |

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
├── index.css                        # (modified) `@import "tailwindcss"` + `@theme` design tokens
├── vite.config.ts                   # (modified) adds the `@tailwindcss/vite` plugin
├── App.tsx                          # unchanged
└── components/
    ├── Workspace.tsx                # (modified) Tailwind classes, denser corporate layout
    ├── ProjectHeader.tsx            # (modified)
    ├── RequirementList.tsx          # (modified) + empty-state message when no requirements
    ├── TaskList.tsx                 # (modified) + empty-state message when no tasks
    ├── ChangeHistory.tsx            # (modified) + empty-state message when no changes recorded
    ├── DependencyMap.tsx            # (modified) + renders the new GraphLegend
    ├── ImpactMap.tsx                # (modified) + renders the new GraphLegend
    ├── ImpactReport.tsx             # (modified) — already has an empty-state message
    ├── TaskNode.tsx                 # (modified) Tailwind classes for status/relation styling
    ├── GraphLegend.tsx              # (new) shared color-key component, used by both map views
    └── *.test.tsx                   # (modified only where scoping depended on a removed class)

(removed) Workspace.css, DependencyMap.css, ImpactMap.css, TaskNode.css — fully migrated to
Tailwind utility classes, per clarification (no parallel styling approaches).
```

**Structure Decision**: Continues the single frontend project — no new package, no backend. Every
change is additive-or-replacing within `src/components/` and the two build-config files
(`vite.config.ts`, `src/index.css`); `src/core/` and `src/state/` are untouched. `GraphLegend.tsx`
is the only genuinely new component, needed because no legend currently exists for either graph
view (spec FR-003) — it is shared rather than duplicated between `DependencyMap` and `ImpactMap`.
