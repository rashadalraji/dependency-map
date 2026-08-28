# Feature Specification: Impact Visualization Clarity

**Feature Branch**: `005-impact-visualization-clarity`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "visualization and reporting of impact analysis results. For a selected requirement change, provide an Impact Report summarizing the change, directly and indirectly affected tasks, effort impact, schedule impact, risk level, and reasons for impact. Provide an Impact Map that reuses the dependency graph while highlighting the affected dependency chain and de-emphasizing unaffected tasks. The experience should clearly communicate the complete ripple effect from a requirement change through the affected project work."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the Complete Ripple Path at a Glance (Priority: P1)

A team member selects a requirement change and looks at the Impact Map. Instead of just seeing
individually colored tasks scattered across the whole project structure, they see one continuous,
unmistakable path — the changed requirement's tasks connected through the exact chain of
dependencies that carries the impact forward — while everything not part of that chain visibly
recedes into the background.

**Why this priority**: This is the headline promise of the feature — "clearly communicate the
complete ripple effect." A map that only tints individual boxes without showing the connections
between them, or that gives unaffected work equal visual weight, does not deliver a "ripple," just
a list with colors.

**Independent Test**: Select a change whose impact spans a multi-hop dependency chain (a directly
affected task, an indirectly affected task depending on it, and a further task depending on that
one) and confirm the connections linking those specific tasks are visibly emphasized, while tasks
and connections outside that chain are visibly de-emphasized, not just left neutral.

**Acceptance Scenarios**:

1. **Given** an analyzed change whose impact includes a directly affected task and an indirectly
   affected task that depends on it, **When** the user views the Impact Map, **Then** the specific
   connection between those two tasks is visually emphasized, not just the two task boxes
   themselves.
2. **Given** the same analyzed change, **When** the user views tasks and connections that are not
   part of the affected chain, **Then** they are visibly de-emphasized relative to the affected
   chain, making the affected path the clear focal point.
3. **Given** an affected chain spanning three or more tasks in sequence, **When** the user views
   the Impact Map, **Then** every connection along that sequence is emphasized, not only the first
   or last hop.

---

### User Story 2 - Trust That the Report and the Map Agree (Priority: P2)

A team member reads the Impact Report's summary of directly affected, indirectly affected, and
unaffected work, then looks at the Impact Map, and immediately recognizes the same categories by
their same visual treatment — no relearning what a color means when moving from one to the other.

**Why this priority**: The Report and the Map are two views of one analysis result; if they use
different visual language for the same categories, the "complete ripple effect" story fractures
into two inconsistent stories instead of one coherent one. This depends on the categories
established in User Story 1 already existing on the map.

**Independent Test**: For a single analyzed change, compare how a directly affected task, an
indirectly affected task, and an unaffected task are each represented in the Impact Report versus
the Impact Map, and confirm the same category uses the same visual treatment in both places.

**Acceptance Scenarios**:

1. **Given** an analyzed change, **When** the user compares a directly affected task's
   representation in the Impact Report to its representation in the Impact Map, **Then** the
   visual treatment (e.g., color) matches.
2. **Given** the same change, **When** the user compares an indirectly affected task's
   representation in both places, **Then** the visual treatment matches, and is distinguishable
   from the directly affected treatment in both places.
3. **Given** a legend or key is present on the Impact Map, **When** the user reads it, **Then** it
   accurately describes the visual treatment actually used for each category.

---

### User Story 3 - Understand When Nothing Is Affected (Priority: P3)

A team member selects a requirement change that turns out to have no affected tasks, and both the
Impact Report and the Impact Map make it immediately obvious that this change has no impact,
rather than leaving the user to infer it from an empty list or an unremarkable-looking map.

**Why this priority**: This is a real but comparatively rare case (an edge case already partly
handled by the Impact Report's existing empty-state text). It rounds out the experience but the
core ripple-visualization value is delivered by Stories 1 and 2 regardless.

**Independent Test**: Select or construct a requirement change with zero associated tasks, and
confirm both the Impact Report and the Impact Map clearly communicate "no impact," rather than the
map simply looking like an unremarkable, fully de-emphasized version of the whole project.

**Acceptance Scenarios**:

1. **Given** a requirement change with no affected tasks, **When** the user views the Impact
   Report, **Then** it states plainly that no tasks are affected.
2. **Given** the same change, **When** the user views the Impact Map, **Then** it also
   communicates that there is no affected chain to show, rather than appearing indistinguishable
   from a map that simply failed to highlight anything.

---

### Edge Cases

- What happens when two directly affected tasks are also directly connected to each other by a
  dependency? That connection MUST also be emphasized as part of the chain, since it genuinely
  connects two affected tasks.
- What happens when an affected task depends on, or is depended on by, a task outside the affected
  set? Only the portion of that connection's *meaning* that is part of the chain is emphasized —
  the unaffected task and any of its own unrelated connections remain de-emphasized.
- What happens when the entire project is affected by a change (every task is directly or
  indirectly affected)? The whole graph is emphasized, and de-emphasis simply has nothing to apply
  to — this MUST NOT be treated as an error or empty state.
- What happens when a user switches from one analyzed change to another? The emphasized chain and
  de-emphasized rest MUST update together immediately to reflect the newly selected change, with
  no leftover emphasis from the previous one.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For a selected requirement change, the system MUST present an Impact Report
  summarizing the change, every directly affected task, every indirectly affected task, the total
  effort impact, the total schedule impact, the overall risk level, and the specific reason each
  task is affected.
- **FR-002**: The system MUST present an Impact Map built on the same task dependency structure
  used elsewhere in the application, so a user is never asked to interpret two different diagrams
  of the same project.
- **FR-003**: The Impact Map MUST visually emphasize the dependency connections that link directly
  affected tasks to the indirectly affected tasks they propagate to, so the chain of impact reads
  as a connected path, not a set of individually colored, disconnected tasks.
- **FR-004**: The Impact Map MUST visually de-emphasize both tasks and dependency connections that
  are not part of the affected chain, so the affected path is the clear visual focus.
- **FR-005**: The visual treatment used to represent "directly affected," "indirectly affected,"
  and "unaffected" MUST be identical between the Impact Report and the Impact Map.
- **FR-006**: The Impact Map MUST include a legend or key that accurately describes what each
  visual treatment on the map means.
- **FR-007**: Selecting a different requirement change MUST update the Impact Report and the
  Impact Map together, consistently and immediately, with no manual refresh and no leftover
  emphasis from a previously viewed change.
- **FR-008**: When a requirement change has no affected tasks, both the Impact Report and the
  Impact Map MUST clearly communicate that there is no impact, rather than presenting an
  unremarkable or ambiguous display that could be mistaken for a display error.
- **FR-009**: This feature MUST NOT change how affected tasks are identified, how effort/schedule
  impact is calculated, or how the overall risk level is determined — it changes only how the
  already-computed result is visualized and reported.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a usability check, at least 90% of participants can correctly trace, using only
  the Impact Map, the complete path from a directly affected task to a multi-hop indirectly
  affected task, without consulting the Impact Report.
- **SC-002**: In the same check, at least 90% of participants correctly match each visual category
  (directly affected / indirectly affected / unaffected) between the Impact Report and the Impact
  Map on their first attempt.
- **SC-003**: Users can identify a "no impact" result from either the Impact Report or the Impact
  Map alone, without needing to check the other, in a usability check with at least 90% success.
- **SC-004**: Switching between recorded changes updates both the Impact Report and Impact Map
  with no perceptible delay and no visual artifacts left over from the previous selection.
- **SC-005**: 100% of the underlying impact-analysis results (which tasks are affected, effort
  impact, schedule impact, risk level) remain unchanged after this feature — only their
  presentation changes.

## Assumptions

- This feature builds directly on `003-requirement-impact-analysis` (which established the Impact
  Report, the Impact Map, and the underlying analysis) and `004-visual-design-polish` (which
  established the current visual language, including per-category node coloring and a legend). It
  does not re-implement or change the underlying analysis in any way (FR-009) — it specifically
  closes two visualization gaps in the existing Impact Map: dependency *connections* were not yet
  visually distinguished by relevance, and the Report's and Map's color choices were not yet
  guaranteed to be drawn from one shared definition.
- "The affected chain" means every task in the analyzed result (direct or indirect) together with
  every dependency connection where both connected tasks are part of that result — this is the
  natural, complete "path" a user would trace by eye, not only the specific parent/child link the
  underlying analysis happened to record first when a task is reachable by more than one route.
- De-emphasis is a relative visual treatment (e.g., reduced prominence/contrast), not hiding —
  unaffected tasks and connections remain visible and identifiable, just visually secondary.
- There is no concept of user accounts, permissions, or authentication; this remains a
  single-user, in-browser, in-memory experience consistent with the rest of the application.
- No new data entities are introduced; this feature reads the same `Requirement Change` and
  `Impact Result` data already established by `003-requirement-impact-analysis`.
