# Quickstart: Visual Design Polish

Validation guide for `004-visual-design-polish` once implemented. This feature introduces no new
data model or internal API boundary (it is presentation-only), so there is no `data-model.md` or
`contracts/` for this feature — see `research.md` for the technical decisions instead.

## Run the automated checks

```sh
npm run test      # Vitest: the full existing 001/002/003 suite must still pass unchanged
npm run build     # tsc -b && vite build — confirms Tailwind's Vite plugin integrates cleanly
```

Expected: every existing test continues to pass (SC-005) — assertions about data shown, counts,
calculations, and navigation are untouched; only a handful of tests' *element-scoping* queries
change (per research.md #4), never what they assert.

## Run the app and validate manually

```sh
npm run dev
```

Walk through the acceptance scenarios from `spec.md`:

1. **Navigation (User Story 1)** — Confirm the three views (Workspace, Dependency Map,
   Requirement Impact) are presented as clear primary navigation, the active view is visually
   obvious, and switching between them is immediate and unambiguous.

2. **Understanding content (User Story 2)** — Confirm every status/priority/risk indicator (task
   status, requirement priority, impact risk level) shows a text label, not just a color. Confirm
   both graph views (Dependency Map, Impact Map) show a legend explaining their node colors.
   Confirm each panel/list/form has clear headings and grouping. Confirm an empty
   Requirements/Tasks/Change-History list shows a friendly message rather than a blank area (you
   can observe this by removing all requirements, or on a hypothetical fresh project).

3. **Responsive layout (User Story 3)** — Narrow the browser window to a typical smaller-laptop
   width and confirm every view remains fully readable with no horizontal scrolling, and
   multi-column layouts (Requirements/Tasks side by side; the change-history/impact-report/map
   layout) reflow to a single column.

4. **No functional regression** — Spot-check at least one flow from each prior feature (add/edit/
   remove a requirement or task, create/remove a task dependency, trigger and re-run an impact
   analysis) and confirm the outcome is identical to before this redesign — only the appearance
   changed.

## Definition of done for this slice

- All items in `checklists/requirements.md` remain checked.
- `npm run test` passes with the full existing suite, and `npm run build` succeeds with no type
  errors.
- All Constitution Check rows in `plan.md` still read PASS (or justified) after implementation.
- No hand-written stylesheet (`Workspace.css`, `DependencyMap.css`, `ImpactMap.css`,
  `TaskNode.css`) remains — every component is styled via Tailwind utilities.
