# Quickstart: Impact Visualization Clarity

Validation guide for `005-impact-visualization-clarity` once implemented. This feature introduces
no new data model and no new dependency, so there is no `data-model.md` or `contracts/` for this
feature — see `research.md` for the technical decisions instead.

## Run the automated checks

```sh
npm run test      # Vitest: full existing suite, plus new buildImpactGraphElements edge coverage
npm run build     # tsc -b && vite build
```

Expected: every existing test continues to pass unchanged (spec FR-009/SC-005 — no computed
result changes); new tests cover edge chain-membership (research.md #1) and confirm
`ImpactReport`'s colors are sourced from `RELATION_INFO` rather than a local duplicate
(research.md #3).

## Run the app and validate manually

```sh
npm run dev
```

Switch to the "Requirement Impact" view and walk through the acceptance scenarios from `spec.md`:

1. **See the ripple path (User Story 1)** — Analyze the seeded change with the deepest impact
   chain (per `003`'s seed data: the change touching task-3/task-11/task-12, which reaches
   indirectly into task-10). Confirm the dependency connections between the affected tasks are
   visibly emphasized (heavier, colored), and every other task and connection is visibly
   de-emphasized (muted), not just neutral.

2. **Report and Map agree (User Story 2)** — For the same analyzed change, confirm a directly
   affected task's color in the Impact Report's task list matches its node color in the Impact
   Map, and likewise for an indirectly affected task. Confirm the Impact Map's legend accurately
   describes what's shown.

3. **No-impact clarity (User Story 3)** — Analyze the seeded "Added, empty snapshot" change (or
   any change with zero affected tasks). Confirm the Impact Map itself displays an explicit
   message that nothing is affected, not just a map with no highlighting.

4. **No functional regression** — Confirm the affected-task counts, effort impact, schedule
   impact, and risk level shown for any analyzed change are identical to before this feature —
   only the visual treatment changed.

## Definition of done for this slice

- All items in `checklists/requirements.md` remain checked.
- `npm run test` passes with the full existing suite plus new coverage; `npm run build` succeeds.
- All Constitution Check rows in `plan.md` still read PASS (or N/A) after implementation.
- `ImpactReport.tsx` no longer defines its own direct/indirect color mapping — it imports
  `RELATION_INFO` from `graphLayout.ts`.
