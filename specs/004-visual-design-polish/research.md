# Phase 0 Research: Visual Design Polish

No `NEEDS CLARIFICATION` markers remain — both open product decisions (CSS approach, visual style
direction) were resolved via `/speckit-clarify` before this plan was written. The items below are
the concrete technical decisions needed to execute that direction.

## 1. Tailwind setup

**Decision**: Adopt Tailwind CSS v4 via the `@tailwindcss/vite` plugin, with a single
`@import "tailwindcss";` in `src/index.css` and design tokens defined there via a CSS-first
`@theme` block. No separate `tailwind.config.js` is needed for this project's scope.

**Rationale**: Tailwind v4's Vite plugin auto-detects template/component files with no manual
`content: []` globs, and its CSS-first `@theme` configuration keeps all styling configuration in
one place (`index.css`) rather than splitting it across a JS config file and CSS — the simplest
setup that satisfies the clarification's choice of a utility-first framework.

**Alternatives considered**:
- *Tailwind v3 with PostCSS + `tailwind.config.js`*: The older, more verbose setup path; v4's
  Vite-native plugin and CSS-first config are simpler for a fresh integration with no legacy
  constraint pulling toward v3.
- *A component library (e.g., a full design-system package)*: Already ruled out during
  clarification in favor of a utility-first framework specifically.

## 2. Design tokens for the corporate/structured style

**Decision**: Define the palette in `@theme` using Tailwind's built-in color scales rather than
inventing new hex values: `slate` for neutral backgrounds/borders/text (structured, dense feel),
the existing purple accent hue mapped to a `brand` token (preserving current identity per spec
Assumptions — no rebrand requested), and semantic scales for status/priority/risk that reuse
existing hues already established in `001`-`003`: `emerald`/`amber`/`slate` for task status
(Done/In Progress/Not Started), `rose`/`orange`/`sky`/`pink` for the graph-node relations already
in use (direct/indirect, dependency/dependent).

**Rationale**: Reusing Tailwind's built-in scales (rather than custom hex tokens) guarantees a
harmonized, accessible set of shades with matching dark-mode-appropriate variants already tuned by
Tailwind, and keeps the existing color *meanings* intact — text and legends (FR-003/FR-008)
explain them regardless, so this is a restyle, not a re-mapping of what colors mean.

**Alternatives considered**: Inventing a fully custom hex palette — more design effort for no
requirement calling for a unique brand identity (spec Assumptions explicitly rule this out).

## 3. Dark mode strategy under Tailwind

**Decision**: Use Tailwind's default `dark:` variant, which follows `prefers-color-scheme` media
queries out of the box in v4 — matching the app's existing OS-preference-based dark mode (there is
no manual light/dark toggle today). Each element carries its light-mode utility classes plus
`dark:` variants for the handful of values that need to differ (backgrounds, text, borders),
replacing the current approach of redefining CSS custom properties under a
`@media (prefers-color-scheme: dark)` block.

**Rationale**: This is the direct Tailwind-native equivalent of the app's existing dark-mode
behavior, preserving it exactly (spec Assumptions) without introducing a new toggle or a new
preference source.

**Alternatives considered**: A manual light/dark toggle stored in `localStorage` — out of scope;
no requirement calls for one, and it would be new interactive behavior beyond "beautify existing
design."

## 4. Decoupling test scoping from styling classes

**Decision**: Wherever an existing test scopes a query by a hand-written CSS class that this
feature removes, add a stable `data-testid` attribute to that element instead, and update the
test to query by it. The only instance found is `DependencyMap.test.tsx`, which scopes graph-node
lookups via `container.querySelector('.dependency-map__graph')`.

**Rationale**: `data-testid` is a purpose-built test hook that is invisible to styling and
survives any future restyle, whereas scoping by a class whose entire purpose is "carry Tailwind
utility styling" would tie test stability to presentation choices again. This satisfies SC-005
(no functional regression) while actually reducing future coupling, not just preserving today's.

**Alternatives considered**: Scoping by ARIA role/label instead — preferred in general, but the
graph pane itself has no natural distinguishing role beyond its container, so a `data-testid` is
the more direct, minimal fix here.

## 5. Closing the empty-state and legend gaps

**Decision**: Add empty-state messages to `RequirementList`, `TaskList`, and `ChangeHistory`
(mirroring the pattern `ImpactReport` already uses for "No tasks are affected by this change.").
Add one new shared `GraphLegend` component, rendered by both `DependencyMap` and `ImpactMap`,
listing each color-coded relation/category with its label.

**Rationale**: Auditing the current components against spec FR-003 (legends) and FR-007
(empty-state messages) found these as the only two genuine gaps — everything else the spec asks
for is achievable by restyling existing markup. Since this is presentation-only work (adding a
conditional render branch, not new data or logic), it stays within this feature's scope (FR-009)
rather than requiring a `src/core/` change.

**Alternatives considered**: Deferring the legend/empty-states to a future feature — rejected,
since FR-003 and FR-007 are explicit, testable requirements of this spec, not optional polish.
