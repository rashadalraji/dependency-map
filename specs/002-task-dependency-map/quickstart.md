# Quickstart: Task Dependency Map

Validation guide for the `002-task-dependency-map` feature once implemented. See `data-model.md`
for entity shapes and `contracts/dependency-api.md` for the domain-core functions involved. This
builds on the already-implemented `001-project-workspace` — no separate setup is needed beyond
what that feature already requires.

## Prerequisites

- Repository dependencies installed: `npm install` (after implementation adds `@xyflow/react` and
  `@dagrejs/dagre` as dependencies per `research.md` #1-#2, a plain `npm install` picks them up).

## Run the automated checks

```sh
npm run test      # Vitest: unit tests for src/core/taskDependencyOperations.ts and dependencyGraph.ts
```

Expected: all new `src/core/*.test.ts` files pass, covering at minimum — per the spec's edge
cases — a task with no dependencies/dependents, a self-dependency attempt (rejected), an indirect
cycle attempt across a 3-hop chain (rejected), creating a duplicate dependency (no-op), removing a
non-existent dependency (no-op), and removing a task that cascades to remove its dependencies.
Existing `001-project-workspace` tests must continue to pass unchanged (`removeTask`'s extended
behavior is additive, not a breaking change to its existing tests' assertions).

## Run the app and validate manually

```sh
npm run dev
```

Open the printed local URL and switch to the "Dependency Map" view. Walk through the acceptance
scenarios from `spec.md`:

1. **Explore the map (User Story 1)** — Confirm every seeded task appears as a node and every
   seeded dependency appears as a directed connection. Confirm at least one task with no
   dependencies or dependents still appears, unconnected. Select a task with both dependencies and
   dependents and confirm both sets are correctly identified. Select a task in the middle of the
   seeded multi-hop chain and confirm only its *direct* dependency is shown, not the full chain.

2. **Create a dependency (User Story 2)** — Pick two unrelated tasks and create a dependency;
   confirm the new connection appears immediately. Attempt to make a task depend on itself and
   confirm it is rejected with an explanation. Attempt to recreate the chain-closing dependency
   that would form a cycle (using the seeded multi-hop chain) and confirm it is rejected with an
   explanation. Attempt to create a dependency that already exists and confirm no duplicate
   appears.

3. **Remove a dependency (User Story 3)** — Remove an existing dependency and confirm the
   connection disappears immediately, and that neither task lists the other as a direct
   dependency/dependent anymore.

4. **No page reload required** — Repeat any one action above and confirm no manual refresh was
   needed to see its effect (FR-009).

## Definition of done for this slice

- All items in `checklists/requirements.md` remain checked.
- `npm run test` passes, including both this feature's new tests and the full existing
  `001-project-workspace` suite.
- `npm run build` succeeds with no type errors.
- All Constitution Check rows in `plan.md` still read PASS (or justified) after implementation.
- The three open defaults from `research.md` (#4 interactivity scope, #5 status encoding, #6
  status-based creation restriction) have been confirmed with the user, or explicitly accepted as
  shipped.
