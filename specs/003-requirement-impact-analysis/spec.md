# Feature Specification: Requirement Impact Analysis

**Feature Branch**: `003-requirement-impact-analysis`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "requirement change management and impact analysis. Users should be able to record when a requirement is added, modified, or removed and trigger an impact analysis for that change. Ripple should trace the requirement-to-task relationships and task dependency graph to identify directly and indirectly affected tasks, explain why each task is affected, calculate estimated effort and schedule impact, and determine an overall impact/risk level using deterministic rules."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trigger an Impact Analysis for a Requirement Change (Priority: P1)

A team member reviews the project's history of requirement changes (added, modified, or removed
requirements), picks one, and runs an impact analysis to see exactly which tasks are affected, how
much estimated effort and schedule impact the change carries, and an overall impact/risk level.

**Why this priority**: This is the reason Ripple exists — the moment a team turns "a requirement
changed" into "here is exactly what that touches and how serious it is." Nothing else in the
application delivers this value.

**Independent Test**: Starting from the seeded requirement change history, select a change whose
requirement has tasks associated with it and downstream task dependencies, trigger its analysis,
and verify the result includes the full set of directly and indirectly affected tasks, a total
effort impact, a total schedule impact, and one overall impact/risk level — in a single flow.

**Acceptance Scenarios**:

1. **Given** a recorded change to a requirement that is associated with two tasks, one of which
   has another task depending on it, **When** the user triggers the analysis, **Then** both
   associated tasks are reported as directly affected and the downstream dependent task is
   reported as indirectly affected.
2. **Given** an analysis has just run, **When** the user views the result, **Then** it shows the
   total number of affected tasks, the total estimated effort impact, the total estimated schedule
   impact, and one overall impact/risk level.
3. **Given** a recorded change to a requirement with no associated tasks, **When** the user
   triggers its analysis, **Then** the result reports zero affected tasks and the lowest
   impact/risk level, without error.
4. **Given** the same recorded change and an unchanged project, **When** the user triggers its
   analysis more than once, **Then** the result is identical every time.

---

### User Story 2 - Understand Why Each Affected Task Is Affected (Priority: P2)

For any task shown in an impact analysis result, a team member can see a specific, plain-language
reason it is included — not just that it appears on a list.

**Why this priority**: A list of affected tasks with no explanation is barely more useful than a
guess; explaining the reasoning is what makes the result trustworthy enough to act on. It builds
directly on User Story 1's result and has no value without it, which is why it follows rather than
leads.

**Independent Test**: From an analysis result containing at least one directly affected task and
one indirectly affected task reached through another indirectly affected task, verify each has its
own specific explanation (e.g., "implements the changed requirement" vs. "depends on Task X, which
is affected"), not a generic or shared message.

**Acceptance Scenarios**:

1. **Given** a directly affected task, **When** the user views its explanation, **Then** it states
   that the task implements the requirement that changed.
2. **Given** an indirectly affected task that depends on a directly affected task, **When** the
   user views its explanation, **Then** it names the specific task it depends on and that task's
   role in the change.
3. **Given** an indirectly affected task reached through a chain of two or more dependency hops,
   **When** the user views its explanation, **Then** it reflects the actual task it directly
   depends on in that chain, not the original changed requirement's tasks directly.

---

### User Story 3 - Review the Requirement Change History (Priority: P3)

A team member browses a log of every requirement change (added, modified, or removed) that has
occurred in the project, so they can find and revisit past changes without relying on memory.

**Why this priority**: This makes User Story 1 usable over time — without a history to browse,
users would have no way to select "a recorded change" to analyze beyond whatever they just made.
It is still lower priority than the analysis itself, since a single freshly-made change is enough
to demonstrate Stories 1 and 2 on their own.

**Independent Test**: Add a requirement, modify an existing one, and remove another; verify all
three actions appear in the change history with the correct requirement identity, change type, and
order — without triggering any analysis.

**Acceptance Scenarios**:

1. **Given** the user adds a new requirement, **When** they view the change history, **Then** a
   new entry appears showing that requirement and an "Added" change type.
2. **Given** the user edits an existing requirement's description, priority, or status, **When**
   they view the change history, **Then** a new entry appears showing that requirement and a
   "Modified" change type.
3. **Given** the user removes an existing requirement, **When** they view the change history,
   **Then** a new entry appears showing that requirement (by its former description) and a
   "Removed" change type, and it remains selectable for analysis even though the requirement no
   longer exists.

---

### Edge Cases

- What happens when a requirement change's directly associated tasks include one that has since
  been deleted? The analysis MUST proceed using only the tasks that still exist, not fail or
  reference a missing task.
- What happens when analyzing a "Removed" change, since the requirement no longer appears in any
  live list? The analysis MUST still display that requirement's description (as recorded at the
  time of removal) and run normally against its recorded task associations.
- What happens when a directly affected task has no tasks depending on it? It MUST be reported as
  directly affected with no further indirect impact from it.
- What happens when two directly affected tasks both lead, via different dependency chains, to the
  same downstream task? That task MUST be counted once in the indirectly affected set, not
  duplicated.
- What happens when a requirement is added and analyzed before any task is associated with it?
  Zero affected tasks and the lowest impact/risk level are reported, not an error.
- What happens when the changed requirement's tasks have no relevant dependencies at all? Only
  direct impact is reported; the indirectly affected set is empty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically create a record of a requirement change — Added,
  Modified, or Removed — whenever a user adds, edits, or removes a requirement, capturing which
  tasks were directly associated with that requirement at that moment.
- **FR-002**: Users MUST be able to view the project's history of recorded requirement changes,
  each showing the requirement's identity/description, the type of change, and when it occurred
  relative to the others.
- **FR-003**: Users MUST be able to select any recorded requirement change and trigger an impact
  analysis for it.
- **FR-004**: Upon triggering an impact analysis, the system MUST identify every task that was
  directly associated with the changed requirement at the time of that change as "directly
  affected."
- **FR-005**: The system MUST trace the current task dependency graph forward from every directly
  affected task to identify every task that depends on it, directly or transitively, and classify
  each such task as "indirectly affected."
- **FR-006**: For every directly or indirectly affected task, the system MUST provide a specific,
  human-readable explanation of why it is included — naming the requirement it implements, or the
  specific task it depends on that is itself part of the change.
- **FR-007**: The system MUST calculate an estimated total effort impact for the complete set of
  affected tasks (direct and indirect combined).
- **FR-008**: The system MUST calculate an estimated schedule impact for the complete set of
  affected tasks, reflecting that tasks connected by a dependency chain add to the timeline
  sequentially while unconnected affected tasks do not compound each other's delay.
- **FR-009**: The system MUST determine a single overall impact/risk level for the analysis, using
  consistent, deterministic rules based on the number of affected tasks, the effort impact, and the
  schedule impact, such that the same recorded change analyzed against an unchanged project always
  yields the same level.
- **FR-010**: The system MUST display an Impact Report summarizing: which requirement changed and
  how, the count and identity of directly affected tasks, the count and identity of indirectly
  affected tasks, the total effort impact, the total schedule impact, and the overall impact/risk
  level.
- **FR-011**: The system MUST display an Impact Map that visually highlights, within the task
  dependency structure, the directly and indirectly affected tasks for the analyzed change,
  distinguishing the two categories from each other and from unaffected tasks.
- **FR-012**: When a requirement change has no directly associated tasks, the system MUST report
  zero affected tasks and the lowest impact/risk level rather than an error.
- **FR-013**: The system MUST produce a well-defined, terminating analysis even if the task
  dependency graph contains a cycle, counting each task as affected at most once.
- **FR-014**: Running an impact analysis MUST NOT alter the project's requirements, tasks,
  associations, or task dependencies — analysis is read-only.
- **FR-015**: The system MUST hold all requirement-change records and analysis results only in
  memory for the current browser session; no data MUST be persisted to a server, database, or
  local storage.
- **FR-016**: The system MUST start with a realistic, pre-populated requirement change history
  (extending the existing seeded project) so the impact-analysis workflow can be explored without
  manual setup, including at least one change whose analysis produces both direct and indirect
  impact.
- **FR-017**: Users MUST be able to return from an Impact Map or Impact Report view to the
  requirement change history at any time.

### Key Entities

- **Requirement Change**: A recorded event capturing that a requirement was added, modified, or
  removed, including which tasks were directly associated with it at that moment and when it
  occurred; the input to an impact analysis. Builds on the existing Requirement entity without
  changing it.
- **Impact Result**: The computed outcome of analyzing one Requirement Change — the sets of
  directly and indirectly affected tasks, the total effort impact, the total schedule impact, the
  overall impact/risk level, and the specific explanation for each affected task.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can trigger an impact analysis for any recorded requirement change and see a
  complete result — affected tasks, effort impact, schedule impact, and risk level — in a single
  interaction, with no page reload.
- **SC-002**: For any impact analysis, users can see 100% of the directly and indirectly affected
  tasks together with a stated reason for each, without manually tracing the dependency graph
  themselves.
- **SC-003**: Running the analysis for the same recorded change against an unchanged project
  always produces the same affected-task set, effort impact, schedule impact, and risk level.
- **SC-004**: Users can obtain the overall impact/risk level and the total effort and schedule
  impact of a change from a single view, without cross-referencing separate screens or documents.
- **SC-005**: In a usability check, at least 90% of participants correctly identify, using only
  the on-screen explanation, why a specific task is shown as affected by a given analyzed change.
- **SC-006**: Users can find and review the history of past requirement changes without needing to
  recall from memory which requirements were edited or removed.

## Assumptions

- This feature builds on the existing project workspace (`001-project-workspace`) and task
  dependency map (`002-task-dependency-map`); it introduces no new requirement, task, association,
  or dependency mechanics, only a change-history log and an analysis layer over them.
- A requirement change record is created automatically whenever a requirement is added, edited, or
  removed via the existing requirement-management capability; there is no separate manual "log a
  change" action distinct from performing the edit itself.
- Impact analysis for a recorded change is triggered explicitly by the user, not run automatically
  on every edit, so a team can review the history and choose which changes are worth analyzing.
- "Directly affected tasks" for a change are fixed to the tasks associated with that requirement at
  the moment the change was recorded (a snapshot); "indirectly affected tasks" are computed against
  the task dependency graph as it currently stands, so re-analyzing an older change after
  dependencies are edited can surface newly indirect tasks.
- Indirect impact propagates only "downstream," to tasks that depend on an affected task — not
  "upstream" to tasks an affected task itself depends on — since a task depending on work that is
  changing is put at risk, while the work it depends on is not.
- Effort impact is a simple sum of affected tasks' estimated effort. Schedule impact reflects the
  longest chain of dependency-connected affected tasks, since parallel, unconnected affected tasks
  do not add to each other's timeline. Both use a small set of deterministic, documented rules
  rather than a full project-scheduling engine.
- The overall impact/risk level is one of a small fixed set of categories (e.g., Low, Medium,
  High, Critical), assigned by consistent, deterministic thresholds on the affected-task count,
  effort impact, and schedule impact.
- One impact analysis is displayed at a time; selecting a different recorded change to analyze
  replaces the displayed Impact Map and Impact Report.
- There is no concept of user accounts, permissions, or authentication; all state is in-memory and
  resets on reload, consistent with the rest of the application.
- The seeded requirement change history includes at least one entry whose analysis demonstrates
  both direct and indirect impact, reusing the existing seeded tasks and dependencies.
