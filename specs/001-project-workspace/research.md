# Phase 0 Research: Project Workspace

All items below were resolvable from the spec, the existing repository scaffold, and the project
constitution — no outstanding `NEEDS CLARIFICATION` markers remain in the Technical Context.

## 1. Testing framework

**Decision**: Add Vitest as the unit-test runner for `src/core/`, plus `@testing-library/react`
and `jsdom` for a small number of workspace interaction smoke tests.

**Rationale**: The project constitution's Test-First principle requires domain-core functions to
have unit tests independent of the UI, but the repository currently has no test runner installed.
Vitest is Vite-native (shares `vite.config.ts`, no separate bundler config), fast, and has a
Jest-compatible API, making it the lowest-friction choice for a Vite + TypeScript + ESM project.
React Testing Library is the standard companion for the few UI-level checks called for by the
constitution ("UI components MAY be covered by lighter interaction/rendering tests").

**Alternatives considered**:
- *Jest*: Requires extra transform/ESM configuration to work with Vite's native ESM and
  `verbatimModuleSyntax`; no benefit over Vitest for this project.
- *Playwright/Cypress (e2e)*: Overkill for an in-memory, no-backend MVP slice; adds a browser
  automation dependency for value already covered by fast unit + light component tests.
- *No tests*: Rejected outright — violates constitution Principle V (Test-First for Core Logic).

## 2. Deterministic ID generation

**Decision**: Entity IDs (`Requirement.id`, `Task.id`) are produced by a small in-core sequence
generator (e.g., `req-1`, `req-2`, `task-1`, ...) seeded fresh per `Project` instance, not by
`crypto.randomUUID()` or `Date.now()`.

**Rationale**: Constitution Principle II (Determinism & Reproducibility) requires Core functions
to avoid randomness and time-based values. A sequence generator lets unit tests assert exact IDs
and exact resulting state after an operation, and keeps the seeded dataset's IDs stable and
human-readable for debugging.

**Alternatives considered**:
- *`crypto.randomUUID()`*: Non-deterministic; would force tests to assert on structure rather than
  exact values and makes seeded-data snapshots less readable.
- *`Date.now()`-based IDs*: Non-deterministic and collision-prone if two entities are created in
  the same tick.

## 3. Progress calculation rule

**Decision**: Overall project progress = (count of tasks with status `"Done"`) / (total task
count), expressed as a rounded whole-number percentage; when there are zero tasks, progress is
reported as a distinct "no tasks yet" state rather than `0%`.

**Rationale**: FR-004/FR-005 and the spec's edge cases only require that progress "reflects the
mix" of task statuses and updates immediately on task changes — a simple task-count ratio is the
smallest rule that satisfies this, is trivially deterministic, and is easy to explain to a
non-technical user ("6 of 10 tasks done").

**Alternatives considered**:
- *Effort-weighted progress* (proportion of estimated-effort-days marked Done rather than task
  count): more "accurate" in principle, but the spec explicitly does not require the project's
  top-level estimated effort to be derived from task sums (see spec Assumptions), and adding a
  second weighting scheme is not needed to satisfy any FR or SC in this slice. Left as a possible
  later enhancement, not part of this plan.

## 4. State management approach

**Decision**: A single custom hook, `useProjectStore`, wraps one `useReducer` (or equivalent
`useState` + dispatcher) whose state shape is the `Project` entity from `src/core/types.ts`, and
whose actions delegate to the pure functions in `src/core/*Operations.ts`.

**Rationale**: Constitution Principle VI forbids introducing a state-management library without
direct justification. A single project's worth of requirements/tasks/associations, mutated only
by explicit user actions, is well within what React's built-in state primitives handle cleanly.

**Alternatives considered**:
- *Redux / Zustand / Jotai*: No demonstrated need — single in-memory project, no cross-cutting or
  deeply nested state-sharing problem exists yet.
- *Context API sprawl (many small contexts)*: Unnecessary indirection for a single-view MVP; one
  hook composed in `Workspace.tsx` and passed down as props is simpler and easier to trace.

## 5. Navigation / routing

**Decision**: No routing library. The workspace is a single view (`Workspace.tsx`) composed of a
header, a requirement panel, and a task panel, all visible at once (or toggled with plain local
component state for any modal/inline-edit affordances).

**Rationale**: The spec describes one workspace, not multiple pages or routes. Introducing
`react-router` (or similar) would be infrastructure not justified by any requirement, violating
Principle VI.

**Alternatives considered**:
- *React Router*: Deferred — no multi-page navigation exists in this slice's scope. Revisit only
  if a later feature (e.g., the separate Dependency Map / Impact Map views) needs distinct routes.
