<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Rationale: Initial ratification. No prior constitution existed for this repository.

Modified principles: n/a (initial creation)

Added sections:
- Core Principles
  - I. Domain Core Independence
  - II. Determinism & Reproducibility
  - III. Explicit Dependency Representation
  - IV. Explainable Impact Output
  - V. Test-First for Core Logic
  - VI. Simplicity & Minimal Infrastructure
- Technology & Architecture Constraints
- Development Workflow & Review Gates
- Governance

Removed sections: n/a (initial creation)

Deferred / TODO placeholders: none. All template placeholders were resolved with
concrete values derived from the user's stated requirements and the existing
`dependency-map` Vite + React + TypeScript scaffold.

Follow-up notes:
- No test runner is currently installed in package.json (no vitest/jest). Principle V
  requires one be added before Ripple Core logic is implemented; this is an
  implementation task, not a constitution gap, and is listed under Next Actions in the
  command output.
-->

# Ripple Constitution

## Core Principles

### I. Domain Core Independence

The Ripple Core (the module(s) that model dependencies, apply a requirement change, and
compute impact results) MUST be implemented in plain TypeScript with zero imports from
`react`, `react-dom`, or any browser-only API (`window`, `document`, DOM events, etc.).
The Core MUST be usable from a Node.js script or a test file with no rendering
environment present. React components MAY call into the Core, but MUST NOT contain
graph-traversal, impact-computation, or dependency-resolution logic themselves — that
logic belongs exclusively in the Core.

**Rationale**: Mixing domain logic into components makes it untestable without a DOM,
makes the impact algorithm hard to reuse (e.g., from a script or a different UI), and
tends to hide business rules inside render code where they silently rot.

### II. Determinism & Reproducibility

Given the same dependency graph and the same requirement-change input, the Ripple Core
MUST always produce the identical impact result. Core functions MUST NOT depend on
wall-clock time, random number generation, network responses, or ambient mutable
global state. Any ordering in output (e.g., list of impacted nodes) MUST be derived
deterministically from the input (e.g., graph traversal order, then stable sort), not
from object insertion order that varies by call site or from `Map`/`Set` iteration
assumptions that are not explicitly guaranteed by the algorithm.

**Rationale**: A ripple-effect tool that gives different answers for the same input on
different runs cannot be trusted for decision-making, and non-determinism makes bugs
irreproducible and tests flaky.

### III. Explicit Dependency Representation

Dependencies between requirements/components MUST be represented as an explicit,
typed graph structure (nodes and directed edges with a declared relationship type),
never inferred implicitly from naming conventions, string matching, or side-channel
lookups at computation time. Adding, removing, or changing a dependency MUST be a
first-class, inspectable data operation on that graph, not a side effect buried in
unrelated code.

**Rationale**: Implicit dependency inference is a common source of silent, hard-to-
audit mistakes; an explicit graph is the only representation that can be validated,
visualized, and reasoned about with confidence.

### IV. Explainable Impact Output

Every impact result the Ripple Core returns MUST include the chain of reasoning that
produced it: which starting node(s) changed, which edges were traversed, and which
rule or relationship type propagated the impact to each affected node. A UI consumer
MUST be able to render "why is this impacted" for any item in the result without
re-running or re-deriving the computation. An impact result that is just a flat list
of affected IDs with no traceable path is NOT acceptable.

**Rationale**: The purpose of the tool is to help a human trust and act on an impact
analysis; an unexplained result is not meaningfully different from a guess.

### V. Test-First for Core Logic

Every Ripple Core function (graph construction, change application, impact
propagation) MUST have unit tests that exercise it directly, independent of any UI,
covering at minimum: no-impact cases, single-hop impact, multi-hop/transitive impact,
and cyclic-graph handling. Tests MUST be written or updated in the same change as the
Core logic they cover, and MUST fail before the corresponding implementation exists or
changes. UI components MAY be covered by lighter interaction/rendering tests, but the
correctness of impact computation MUST be proven at the Core level, not through the UI.

**Rationale**: Core independence (Principle I) only pays off if it is actually
exercised by fast, isolated tests; testing impact logic through the UI is slow,
indirect, and does not verify determinism or explainability guarantees.

### VI. Simplicity & Minimal Infrastructure

The application MUST default to simple in-memory data structures for the dependency
graph and requirement state. Databases, backend servers, network APIs, persistence
layers, state-management libraries, or generic abstraction layers MUST NOT be
introduced unless they directly and demonstrably serve the requirement-change-to-
impact workflow; "might need it later" is not sufficient justification. When a
simpler solution (a plain function, a plain object, a plain array) satisfies the
requirement, it MUST be preferred over a more general or "flexible" one.

**Rationale**: This is a focused analysis tool, not a platform; every added layer of
infrastructure increases the surface area to keep deterministic and explainable for no
corresponding benefit to the core workflow.

## Technology & Architecture Constraints

- The Ripple Core lives in its own directory/module boundary (e.g., `src/core/`) that
  contains no `.tsx` files and no React imports; this boundary MUST be enforceable by
  inspection (import statements) or lint rule, not just convention.
- Dependency graph and requirement-change data structures MUST be explicitly typed in
  TypeScript (no `any` for Core domain types); this is required to keep the graph
  representation (Principle III) actually explicit and inspectable.
- Data MUST be held in memory for the lifetime of the app session. Persistence across
  sessions (localStorage, files, a backend) is out of scope unless a future amendment
  to this constitution explicitly adds it as a required capability.
- React's role is limited to: rendering the graph/impact state, collecting user input
  (the requirement change), and invoking the Ripple Core. React state MUST hold Core
  outputs as opaque data, not re-derive or duplicate Core computation logic.

## Development Workflow & Review Gates

- Any change that adds or modifies Ripple Core behavior MUST include or update unit
  tests per Principle V before it is considered done; a PR/change that adds Core logic
  with no accompanying test is not acceptable.
- A reviewer (human or self-review before merge) MUST verify that no new React import,
  DOM access, or ambient side effect was introduced into the Core boundary.
- A reviewer MUST spot-check at least one impact result end-to-end and confirm the
  explanation (Principle IV) correctly traces back to real edges in the graph, not
  just that the affected-node list "looks right."
- Any proposal to add infrastructure (a dependency, a persistence layer, a state
  library) MUST state in the change description which principle or workflow
  requirement it serves; absent that justification, the simpler option (Principle VI)
  is used instead.

## Governance

This constitution supersedes ad-hoc practice for the `dependency-map` (Ripple)
project. Where code review or planning conflicts with a principle here, the
principle governs unless the constitution is first amended.

**Amendment procedure**: Amendments are proposed by editing this file, stating the
motivating problem or example that the current text fails to address, and updating
the Sync Impact Report at the top of the file. An amendment is considered adopted once
committed to the repository.

**Versioning policy**: This constitution follows semantic versioning:
- MAJOR: A principle is removed or redefined in a way that is backward-incompatible
  with prior guidance (e.g., relaxing Principle I to permit React imports in the Core).
- MINOR: A new principle or section is added, or existing guidance is materially
  expanded (e.g., adding a new required test category under Principle V).
- PATCH: Wording clarifications, typo fixes, or non-semantic refinements that do not
  change what is required or forbidden.

**Compliance review**: Every feature plan and code review for this project MUST
verify alignment with the six Core Principles above before implementation is deemed
complete. Any deviation MUST be justified explicitly in the relevant plan/PR and, if
the deviation reveals the constitution itself is wrong or incomplete, MUST be followed
by an amendment rather than a silent, repeated exception.

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
