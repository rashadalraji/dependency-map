# Quickstart: Project Workspace

Validation guide for the `001-project-workspace` feature once implemented. This does not contain
implementation code — see `data-model.md` for entity shapes and `contracts/core-api.md` for the
domain-core functions involved.

## Prerequisites

- Node.js (version matching this repo's existing tooling) and npm installed.
- Repository dependencies installed: `npm install` (after implementation adds Vitest and
  `@testing-library/react` as dev dependencies per `research.md` #1, a plain `npm install` picks
  them up from `package.json`).

## Run the automated checks

```sh
npm run test      # Vitest: unit tests for src/core/* (requirement ops, task ops, progress)
```

Expected: all `src/core/*.test.ts` files pass, covering at minimum — per the spec's edge cases —
a requirement/task with no associations, removing a requirement that has associated tasks,
removing a task associated with multiple requirements, associating an already-associated pair,
and the zero-task "no tasks yet" progress state.

## Run the app and validate manually

```sh
npm run dev
```

Open the printed local URL. Walk through the acceptance scenarios from `spec.md`:

1. **View the workspace (User Story 1)** — On load, confirm the project's name, target deadline,
   and total estimated effort are visible; confirm every seeded requirement is listed with
   description/priority/status; confirm every seeded task is listed with title/effort/status and
   its associated requirement(s); confirm the progress indicator shows a value that is neither 0%
   nor 100% (the seed data has mixed task statuses).

2. **Manage requirements (User Story 2)** — Add a new requirement (description + priority) and
   confirm it appears immediately. Edit its status and confirm the change shows immediately
   everywhere it appears. Remove it and confirm it disappears from the requirement list while any
   tasks it was linked to remain in the task list, now unlinked from it.

3. **Manage tasks and links (User Story 3)** — Create a new task (title, estimated effort,
   status) and confirm it appears immediately. Associate it with an existing requirement and
   confirm it shows under that requirement, and that the requirement shows under the task. Edit
   the task's status to `Done` and confirm the overall progress indicator updates immediately.
   Remove the task and confirm it disappears from the task list and from every requirement it was
   linked to.

4. **No page reload required** — Repeat any one action above and confirm no manual refresh was
   needed to see its effect (SC-002, SC-005).

## Definition of done for this slice

- All items in `checklists/requirements.md` remain checked.
- `npm run test` passes.
- `npm run build` (existing `tsc -b && vite build` script) succeeds with no type errors, including
  for the new `src/core/` module (no `any` in Core domain types, per the constitution).
- All Constitution Check rows in `plan.md` still read PASS after implementation.
