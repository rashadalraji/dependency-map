# Feature Specification: Ripple Impact Analysis

**Feature Branch**: `001-ripple-impact-analysis`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Define the MVP specification for Ripple, a frontend-only React application that helps software teams understand the impact of changing project requirements. A project contains requirements, tasks, and explicit task dependencies. Users can add, modify, or remove requirements and associate them with implementation tasks. When a requirement changes, Ripple should analyze the dependency graph to identify directly and indirectly affected tasks, calculate estimated effort and schedule impact, determine an overall risk/impact level, and explain why each task is affected. The application should provide a Dependency Map showing the project structure, an Impact Map highlighting the ripple effect of a specific change, and an Impact Report summarizing affected work, effort, schedule, and risk. Use realistic seeded data and in-memory state only; no backend, database, authentication, or external integrations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the Ripple Effect of a Requirement Change (Priority: P1)

A team member selects a requirement in the project and marks it as changed (edited or removed).
Ripple analyzes the project's task dependency graph and shows exactly which tasks are directly
affected (they implement the requirement) and which are indirectly affected (they depend on a
directly affected task), along with the estimated effort impact, schedule impact, and an overall
risk/impact level for the change — with a plain-language reason for every affected task.

**Why this priority**: This is the reason Ripple exists. Everything else in the application exists
to feed or support this single moment: "I'm about to change this requirement — what does that
actually touch, and how bad is it?" Without this, the app has no unique value.

**Independent Test**: Starting from the seeded project data, select any requirement that has
associated tasks with further downstream dependencies, mark it changed, and verify the app
produces a complete, explained impact analysis (directly affected tasks, indirectly affected
tasks, effort impact, schedule impact, overall risk level) in a single flow — no other feature
needs to exist for this to be demonstrated and validated.

**Acceptance Scenarios**:

1. **Given** a requirement linked to two tasks, one of which has another task depending on it,
   **When** the user marks that requirement as changed, **Then** the app shows both directly
   linked tasks as "directly affected" and the downstream dependent task as "indirectly affected,"
   each with a stated reason.
2. **Given** a requirement change has just been analyzed, **When** the user views the Impact
   Report, **Then** it shows the total number of affected tasks, the total estimated effort
   impact, the total estimated schedule impact, and one overall risk/impact level for the change.
3. **Given** a requirement with no associated tasks, **When** the user marks it as changed,
   **Then** the app reports zero affected tasks and the lowest risk/impact level, without error.
4. **Given** an indirectly affected task that depends on more than one directly affected task,
   **When** the user views its explanation, **Then** the explanation lists every directly affected
   task it depends on, not just one.

---

### User Story 2 - Explore the Project's Dependency Map (Priority: P2)

A team member opens Ripple and sees the full project structure — all requirements, all tasks, and
the explicit dependencies between tasks — laid out as a Dependency Map, before making or
analyzing any change.

**Why this priority**: Understanding the ripple effect of a change only makes sense once a user
can see and trust the underlying structure it is computed from. This is independently valuable
(a team can use it just to understand how their project fits together) and independently testable
without triggering any change.

**Independent Test**: Load the app with its seeded data and verify every seeded requirement, every
seeded task, and every seeded task dependency is visible and correctly connected in the Dependency
Map, with no requirement change having been triggered yet.

**Acceptance Scenarios**:

1. **Given** the app has just loaded, **When** the user views the Dependency Map, **Then** every
   seeded requirement is shown along with the tasks that implement it.
2. **Given** two tasks where one depends on the other, **When** the user views the Dependency Map,
   **Then** the dependency is shown as a directed relationship between those two tasks.
3. **Given** the user is viewing an Impact Map or Impact Report for a specific change, **When**
   they choose to go back, **Then** they return to the unfiltered, full Dependency Map.

---

### User Story 3 - Manage Requirements and Their Task Links (Priority: P3)

A team member adds a new requirement, edits an existing requirement's details, removes a
requirement that is no longer needed, or changes which tasks a requirement is associated with —
so the project data reflects reality and new "what-if" changes can be analyzed beyond the seeded
scenario.

**Why this priority**: This makes the tool usable beyond the built-in demo data, but the core
value proposition (Story 1) and the structural view (Story 2) both work fully against seeded data
without it, so it is the right thing to defer if time is constrained.

**Independent Test**: Add a new requirement, link it to one or more existing tasks, then verify it
now appears in the Dependency Map and can itself be selected and marked as changed to produce an
impact analysis — all without reloading the page.

**Acceptance Scenarios**:

1. **Given** the user is viewing the project, **When** they add a new requirement with a
   description and priority, **Then** it appears in the Dependency Map immediately.
2. **Given** an existing requirement, **When** the user edits its description, priority, or
   status, **Then** the update is reflected immediately everywhere that requirement is shown.
3. **Given** an existing requirement, **When** the user removes it, **Then** it no longer appears
   in the Dependency Map and can no longer be selected for a new change analysis.
4. **Given** an existing requirement and an existing task, **When** the user associates them,
   **Then** that task is included as a directly affected task if the requirement is later changed.
5. **Given** a requirement associated with a task, **When** the user removes that association,
   **Then** the task is no longer considered directly affected by a later change to that
   requirement.

---

### Edge Cases

- What happens when a changed requirement has no associated tasks? The app MUST report zero
  affected tasks and the lowest risk/impact level rather than erroring or showing a blank state.
- What happens when a directly affected task has no further tasks depending on it? The app MUST
  report it as directly affected with no indirectly affected tasks beyond it.
- What happens when the task dependency graph contains a cycle (Task A depends on Task B depends
  on Task A)? The app MUST still complete the analysis, counting each task as affected at most
  once, without an infinite loop or crash.
- What happens when a task depends on a task that implements a *different* requirement than the
  one being changed? The app MUST still trace and report it as indirectly affected, since the
  ripple effect crosses requirement boundaries.
- What happens when the user changes a second requirement while viewing the impact analysis of a
  first? The app MUST replace the displayed Impact Map/Impact Report with the new change's
  analysis (the app analyzes one change at a time).
- What happens when a requirement is removed that still has tasks associated with it? The app MUST
  treat the removal itself as the change being analyzed, with those tasks as directly affected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a Dependency Map showing all requirements in the project,
  all tasks, which requirement(s) each task implements, and the explicit dependencies between
  tasks.
- **FR-002**: Users MUST be able to select any existing requirement and mark it as changed
  (representing an edit to its details or its removal) to trigger impact analysis.
- **FR-003**: Upon a requirement change, the system MUST identify every task directly associated
  with that requirement as "directly affected."
- **FR-004**: The system MUST traverse the task dependency graph, starting from every directly
  affected task, to identify every task that depends on it, directly or transitively, and classify
  each such task as "indirectly affected."
- **FR-005**: The system MUST calculate an estimated total effort impact for the complete set of
  affected tasks (direct and indirect combined) resulting from a requirement change.
- **FR-006**: The system MUST calculate an estimated schedule impact for the complete set of
  affected tasks resulting from a requirement change.
- **FR-007**: The system MUST determine a single overall risk/impact level for each requirement
  change, derived from the number and nature of affected tasks together with the calculated
  effort and schedule impact.
- **FR-008**: For every affected task, the system MUST provide a specific, human-readable
  explanation of why that task is affected (e.g., which requirement it directly implements, or
  which other affected task it depends on).
- **FR-009**: The system MUST display an Impact Map that highlights, within the project structure,
  the changed requirement and every directly and indirectly affected task, visually distinguishing
  the two categories from each other and from unaffected items.
- **FR-010**: The system MUST display an Impact Report summarizing the requirement change: the
  count and identity of directly affected tasks, the count and identity of indirectly affected
  tasks, the total estimated effort impact, the total estimated schedule impact, and the overall
  risk/impact level.
- **FR-011**: Users MUST be able to add a new requirement to the project, specifying at minimum a
  description and a priority.
- **FR-012**: Users MUST be able to modify an existing requirement's description, priority, or
  status.
- **FR-013**: Users MUST be able to remove an existing requirement from the project.
- **FR-014**: Users MUST be able to associate a requirement with one or more implementation tasks,
  and to remove such an association, at any time.
- **FR-015**: Users MUST be able to define an explicit dependency stating that one task depends on
  another task.
- **FR-016**: The system MUST produce a well-defined, terminating impact analysis even when the
  task dependency graph contains a cycle, counting each task as affected at most once.
- **FR-017**: The system MUST start with a realistic, pre-populated set of requirements, tasks,
  and task dependencies so the full workflow can be explored without any manual data entry.
- **FR-018**: The system MUST hold all project data (requirements, tasks, dependencies, and the
  most recent change's impact analysis) only in memory for the current browser session; no data
  MUST be persisted to a server, database, or local storage, and no reload MUST be required to see
  the effect of any user action.
- **FR-019**: Users MUST be able to return from an Impact Map or Impact Report view to the
  complete, unfiltered Dependency Map at any time.

### Key Entities

- **Project**: The single container for the MVP's requirements, tasks, and dependencies; has a
  name and holds the complete in-memory state the app operates on.
- **Requirement**: A stated project need with a description, a priority, and a status; may be
  associated with zero or more tasks and is the starting point of any impact analysis.
- **Task**: A unit of implementation work with a title, an estimated effort, and a status; is
  associated with the requirement(s) it implements and may depend on, or be depended on by, other
  tasks.
- **Task Dependency**: An explicit, directed "depends on" relationship from one task to another,
  used to trace indirect impact through the project.
- **Requirement Change**: The user-initiated action (edit or removal) applied to a single
  requirement that serves as the trigger and input for a new impact analysis.
- **Impact Result**: The computed outcome of analyzing one Requirement Change — the sets of
  directly and indirectly affected tasks, the total effort impact, the total schedule impact, the
  overall risk/impact level, and the per-task explanation of why each task was included.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can view the complete project structure (every requirement, task, and task
  dependency) immediately upon opening the application, with no configuration or data entry.
- **SC-002**: For any requirement change, a user can see 100% of the directly and indirectly
  affected tasks together with a stated reason for each, without manually tracing the dependency
  graph themselves.
- **SC-003**: A user can obtain the overall risk/impact level and the total estimated effort and
  schedule impact of a requirement change from a single view, without cross-referencing separate
  screens or documents.
- **SC-004**: In a usability check, at least 90% of participants correctly identify, using only
  the on-screen explanation, why a specific task is shown as affected by a given requirement
  change.
- **SC-005**: A user can go from selecting a requirement change to seeing its full Impact Map and
  Impact Report in a single interaction, with no intermediate manual steps or page reload.
- **SC-006**: After adding, modifying, or removing a requirement or its task associations, a user
  sees the Dependency Map reflect that change immediately, without refreshing or reloading the
  application.

## Assumptions

- The MVP manages a single project at a time; switching between or comparing multiple projects is
  out of scope for this feature.
- Task effort is expressed in a simple estimated-effort unit (e.g., person-days) per task; total
  effort impact is an aggregation of the affected tasks' estimates rather than output of a full
  project-scheduling engine.
- Schedule impact is derived from the same affected-task data (e.g., aggregated estimated
  duration) rather than from calendar-aware project scheduling (holidays, resource availability,
  parallel work capacity).
- The overall risk/impact level is expressed as a small fixed set of categories (e.g., Low,
  Medium, High, Critical), assigned by consistent, deterministic rules based on the affected-task
  set and the calculated effort/schedule impact, so the same change always yields the same level.
- "Marking a requirement as changed" covers edits to its details and its removal; adding a brand
  new requirement does not itself trigger an impact analysis until it is associated with at least
  one task, since there is nothing yet for the change to ripple to.
- The system analyzes one requirement change at a time; a new change replaces the previously
  displayed Impact Map and Impact Report rather than combining with it.
- Task dependencies are directed and may legitimately form cycles; the system does not need to
  prevent users from creating a cycle, only to analyze impact safely when one exists.
- There is no concept of user accounts, permissions, or authentication; the app serves a single
  implicit user, and all state resets when the page is reloaded.
- The seeded data represents one realistic software project with enough requirements, tasks, and
  dependency depth (including at least one multi-hop chain and one cross-requirement dependency)
  to demonstrate both direct and indirect impact out of the box.
