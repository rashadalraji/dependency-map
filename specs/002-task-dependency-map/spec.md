# Feature Specification: Task Dependency Map

**Feature Branch**: `002-task-dependency-map`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "explicit task dependency management and visualization. Users should be able to create and remove dependencies between tasks, view direct dependencies and dependents, and prevent circular dependencies. Provide an interactive Dependency Map that visually represents tasks as nodes and their dependencies as directed connections, allowing users to understand how work is connected and which tasks depend on others."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore the Dependency Map (Priority: P1)

A team member opens the Dependency Map and sees every task in the project as a node, with an
arrow-style connection drawn from each task to every other task it depends on. Selecting any task
shows exactly which tasks it depends on and which tasks depend on it.

**Why this priority**: This is the headline deliverable and the reason this feature exists —
turning a list of tasks into a picture of how work is actually connected. It delivers value on
its own using the existing seeded tasks, before any dependency is ever created or removed by a
user.

**Independent Test**: Load the app with its seeded task dependencies and verify every task appears
as a node, every seeded dependency appears as a directed connection between the correct two tasks,
and selecting a task shows the correct set of direct dependencies and direct dependents for it —
without creating or removing anything.

**Acceptance Scenarios**:

1. **Given** the project's seeded tasks and dependencies, **When** the user opens the Dependency
   Map, **Then** every task is shown as a node and every dependency is shown as a directed
   connection from the dependent task to the task it depends on.
2. **Given** a task with no dependencies and no dependents, **When** the user views the Dependency
   Map, **Then** that task still appears as a node, shown unconnected rather than omitted.
3. **Given** a task that depends on two other tasks and is itself depended on by a third,
   **When** the user selects that task, **Then** the two tasks it depends on and the one task that
   depends on it are all clearly identified.
4. **Given** a chain of tasks where A depends on B and B depends on C, **When** the user selects
   A, **Then** only B is shown as a direct dependency of A (C is not shown as a direct dependency,
   since the relationship is indirect).

---

### User Story 2 - Create a Dependency Between Tasks (Priority: P2)

A team member picks two existing tasks and records that one depends on the other, so the
Dependency Map reflects a real constraint on how the work must proceed.

**Why this priority**: Once people can see the map (Story 1), the next most valuable thing is
keeping it accurate as new constraints are discovered — but this is meaningful only because the
map to update already exists, so it follows Story 1.

**Independent Test**: Pick two existing tasks with no relationship between them, create a
dependency stating one depends on the other, and verify the new connection appears in the
Dependency Map immediately and is reflected when either task is selected.

**Acceptance Scenarios**:

1. **Given** two existing tasks with no dependency between them, **When** the user records that
   one depends on the other, **Then** a new directed connection appears in the Dependency Map
   immediately.
2. **Given** a task, **When** the user attempts to make it depend on itself, **Then** the system
   rejects the attempt and explains why.
3. **Given** a chain where A depends on B and B depends on C, **When** the user attempts to make C
   depend on A, **Then** the system rejects the attempt because it would create a circular
   dependency, and explains why.
4. **Given** two tasks that already have a dependency recorded between them, **When** the user
   attempts to create that same dependency again, **Then** the system does not create a duplicate
   connection.

---

### User Story 3 - Remove a Dependency (Priority: P3)

A team member removes a dependency that no longer reflects reality (e.g., the work was
re-sequenced), so the Dependency Map continues to represent the true state of the project.

**Why this priority**: Removing an outdated constraint matters, but it is a smaller and less
frequent need than seeing the map (Story 1) or recording new constraints as they're discovered
(Story 2), so it is the right thing to deliver last.

**Independent Test**: Starting from an existing dependency between two tasks, remove it and verify
the connection disappears from the Dependency Map immediately, and that selecting either task no
longer lists the other as a dependency/dependent.

**Acceptance Scenarios**:

1. **Given** an existing dependency between two tasks, **When** the user removes it, **Then** the
   connection disappears from the Dependency Map immediately.
2. **Given** an existing dependency has just been removed, **When** the user selects either of the
   two tasks that were involved, **Then** neither lists the other as a direct dependency or
   dependent anymore.

---

### Edge Cases

- What happens when a task has neither dependencies nor dependents? It MUST still appear in the
  Dependency Map as an unconnected node, not be hidden or treated as an error.
- What happens when a user tries to make a task depend on itself? The system MUST reject the
  attempt and explain why, without altering the map.
- What happens when a user tries to create a dependency that would form an indirect cycle (e.g.,
  A→B→C, then attempting C→A)? The system MUST detect this using the full chain of existing
  dependencies, not just direct pairs, and reject it with an explanation.
- What happens when a user tries to create a dependency that already exists? The system MUST treat
  it as a safe no-op rather than creating a duplicate connection.
- What happens when a user tries to remove a dependency that does not exist (e.g., already
  removed)? The system MUST treat it as a safe no-op.
- What happens when an existing task is removed from the project (via existing task management)?
  The system MUST also remove every dependency that referenced it, so the Dependency Map never
  shows a connection to a task that no longer exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display an interactive Dependency Map showing every task in the
  project as a node.
- **FR-002**: The system MUST display every existing task dependency as a directed connection
  between its two tasks, with the direction visually distinguishable from an unrelated pair of
  tasks or the reverse direction.
- **FR-003**: Users MUST be able to select any task and see that task's complete set of direct
  dependencies (tasks it depends on) and direct dependents (tasks that depend on it) clearly
  identified, both within the map and as a plain list.
- **FR-004**: Users MUST be able to create a new dependency stating that one existing task depends
  on another existing task.
- **FR-005**: The system MUST reject an attempt to create a dependency that would make a task
  depend on itself, whether directly or through an indirect chain of existing dependencies, and
  MUST tell the user why the attempt was rejected.
- **FR-006**: Creating a dependency that already exists MUST NOT create a duplicate connection.
- **FR-007**: Users MUST be able to remove an existing dependency between two tasks.
- **FR-008**: Removing a dependency that does not currently exist MUST be a safe no-op.
- **FR-009**: Creating or removing a dependency MUST update the Dependency Map immediately, with
  no page reload.
- **FR-010**: The Dependency Map MUST show a task with no dependencies and no dependents as an
  unconnected node rather than omitting it.
- **FR-011**: When a task is removed from the project, the system MUST also remove every
  dependency that referenced that task.
- **FR-012**: The system MUST hold all task dependency data only in memory for the current browser
  session; no data MUST be persisted to a server, database, or local storage.
- **FR-013**: The system MUST start with a realistic, pre-populated set of task dependencies
  (extending the project's existing seeded tasks), including at least one multi-hop dependency
  chain, so the Dependency Map is meaningful without any manual setup.

### Key Entities

- **Task** *(existing entity, extended here)*: A unit of implementation work, already defined by
  the project workspace. This feature adds dependency relationships between tasks; it does not
  change any of a task's existing attributes.
- **Task Dependency**: A directed relationship between exactly two existing tasks — a dependent
  task and the prerequisite task it depends on — representing that the dependent task's completion
  is constrained by the prerequisite task.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view every task and every dependency in the project as a single visual map
  within seconds of opening it, with no configuration required.
- **SC-002**: For any task, users can identify all of its direct dependencies and direct
  dependents without manually cross-referencing a separate list of every dependency in the
  project.
- **SC-003**: 100% of attempts to create a dependency that would result in a circular relationship
  are blocked, with an explanation shown to the user.
- **SC-004**: Users can create or remove a dependency and see the Dependency Map reflect that
  change in a single interaction, with no page reload.
- **SC-005**: In a usability check, at least 90% of participants can correctly identify, using
  only the Dependency Map, which tasks a given task depends on and which tasks depend on it.
- **SC-006**: The Dependency Map remains readable at the scale of the project's seeded data
  (dozens of tasks and dependencies) without users needing outside documentation to interpret it.

## Assumptions

- This feature builds on the existing project workspace: it extends the existing `Task` entity
  with dependency relationships and does not change requirements, requirement-task associations,
  or any other existing behavior from that feature.
- A dependency is directed and binary — exactly one dependent task and one prerequisite task per
  dependency; grouped or conditional dependencies (e.g., "any 2 of these 3") are out of scope.
- Cycle detection considers the full transitive closure of existing dependencies, not just the two
  tasks directly involved in the new dependency being created.
- This feature does not include analyzing or reporting the downstream impact of a requirement or
  task change (effort/schedule/risk impact); that capability, if built, belongs to a separate,
  later feature.
- The Dependency Map is a single, project-wide view; filtering, searching, or multiple saved views
  are not required for this feature.
- There is no concept of user accounts, permissions, or authentication; the app serves a single
  implicit user, and all state resets when the page is reloaded, consistent with the rest of the
  application.
- The seeded task dependencies extend the project workspace's existing seeded tasks with a
  realistic set of directed relationships, including at least one chain three or more tasks deep,
  to demonstrate both direct and transitive relationships out of the box.
