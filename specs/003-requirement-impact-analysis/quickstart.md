# Quickstart: Requirement Impact Analysis

Validation guide for `003-requirement-impact-analysis` once implemented. See `data-model.md` for
entity shapes and `contracts/impact-api.md` for the domain-core functions involved. Builds on the
already-implemented `001-project-workspace` and `002-task-dependency-map` — no new setup beyond
what those already require (no new dependencies are introduced by this feature).

## Run the automated checks

```sh
npm run test      # Vitest: unit tests for requirementChangeLog.ts and impactAnalysis.ts
```

Expected: all new `src/core/*.test.ts` files pass, covering — per the spec's edge cases — a change
whose snapshot references a since-deleted task, analyzing a `'Removed'` change whose requirement no
longer exists, a task reached via two different indirect chains (counted once), a change with zero
associated tasks (zero affected, `Low` risk), and a cyclic dependency graph (should one ever exist)
not looping infinitely. Existing `001`/`002` tests must continue to pass — `addRequirement` /
`editRequirement` / `removeRequirement`'s existing behavior is unchanged, only extended.

## Run the app and validate manually

```sh
npm run dev
```

Switch to the "Requirement Impact" view. Walk through the acceptance scenarios from `spec.md`:

1. **Trigger an analysis (User Story 1)** — Pick the seeded change whose requirement has both
   associated tasks and downstream dependencies; run its analysis; confirm the result shows the
   correct directly and indirectly affected tasks, a total effort impact, a total schedule impact,
   and one overall risk level. Run it again and confirm the result is identical (SC-003). Pick a
   change with no associated tasks and confirm zero affected tasks and the lowest risk level, with
   no error.

2. **Understand why each task is affected (User Story 2)** — For a directly affected task, confirm
   its explanation states it implements the changed requirement. For an indirectly affected task
   reached through two or more dependency hops, confirm its explanation names its actual, direct
   parent task in the chain — not the original requirement's tasks.

3. **Review the change history (User Story 3)** — Add a requirement, edit an existing one, and
   remove another (via the existing Workspace requirement controls); confirm all three appear in
   the change history with the correct type and requirement identity, and that the removed one
   remains selectable and analyzable even though it no longer appears in the live requirement list.

4. **No page reload required** — Confirm triggering an analysis and returning to the change
   history both happen without a manual refresh (FR-017).

## Definition of done for this slice

- All items in `checklists/requirements.md` remain checked.
- `npm run test` passes, including the full `001`/`002`/`003` suite together.
- `npm run build` succeeds with no type errors.
- All Constitution Check rows in `plan.md` still read PASS after implementation.
