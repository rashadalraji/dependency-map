import type {
  Association,
  Project,
  Requirement,
  RequirementChange,
  RequirementChangeType,
  Task,
  TaskDependency,
} from './types'

function requirement(
  id: string,
  description: string,
  priority: Requirement['priority'],
  status: Requirement['status'],
): Requirement {
  return { id, description, priority, status }
}

function task(
  id: string,
  title: string,
  estimatedEffortDays: number,
  status: Task['status'],
): Task {
  return { id, title, estimatedEffortDays, status }
}

function link(requirementId: string, taskId: string): Association {
  return { requirementId, taskId }
}

function dependsOn(dependentTaskId: string, prerequisiteTaskId: string): TaskDependency {
  return { dependentTaskId, prerequisiteTaskId }
}

function change(
  id: string,
  requirementId: string,
  changeType: RequirementChangeType,
  requirementDescriptionSnapshot: string,
  directlyAssociatedTaskIds: string[],
): RequirementChange {
  return { id, requirementId, changeType, requirementDescriptionSnapshot, directlyAssociatedTaskIds }
}

/**
 * Deterministic seed for a realistic in-progress project: fixed name/dates/ids,
 * no randomness or clock reads, so two calls produce structurally identical projects.
 */
export function createSeedProject(): Project {
  const requirements: Requirement[] = [
    requirement('req-1', 'Support multi-currency invoicing', 'High', 'Approved'),
    requirement(
      'req-2',
      'Add self-serve subscription upgrades/downgrades',
      'High',
      'Approved',
    ),
    requirement('req-3', 'Provide usage-based billing for API consumption', 'Medium', 'Proposed'),
    requirement('req-4', 'Migrate legacy invoices to new PDF template', 'Low', 'Done'),
    requirement('req-5', 'Add dunning/retry logic for failed payments', 'High', 'Proposed'),
    requirement('req-6', 'Expose billing audit log to customer admins', 'Medium', 'Approved'),
    requirement('req-7', 'Sunset the old flat-rate pricing plan', 'Low', 'Proposed'),
  ]

  const tasks: Task[] = [
    task('task-1', 'Add currency field to invoice schema', 3, 'Done'),
    task('task-2', 'Build currency conversion rate service', 5, 'InProgress'),
    task('task-3', 'Update invoice PDF renderer for multi-currency totals', 4, 'NotStarted'),
    task('task-4', 'Design self-serve plan-change UI', 3, 'Done'),
    task('task-5', 'Implement upgrade proration logic', 6, 'InProgress'),
    task('task-6', 'Implement downgrade scheduling logic', 5, 'NotStarted'),
    task('task-7', 'Add plan-change confirmation emails', 2, 'NotStarted'),
    task('task-8', 'Instrument API gateway for usage metering', 5, 'InProgress'),
    task('task-9', 'Build usage aggregation batch job', 4, 'NotStarted'),
    task('task-10', 'Design usage-based invoice line items', 3, 'NotStarted'),
    task('task-11', 'Convert legacy invoice archive to new template', 6, 'InProgress'),
    task('task-12', 'QA legacy invoice migration against sample accounts', 2, 'NotStarted'),
    task('task-13', 'Add payment retry scheduler', 4, 'NotStarted'),
    task('task-14', 'Build dunning email sequence', 3, 'NotStarted'),
    task('task-15', 'Add retry/backoff configuration UI for admins', 3, 'NotStarted'),
    task('task-16', 'Expose audit log API endpoint', 4, 'Done'),
    task('task-17', 'Build audit log viewer UI for customer admins', 5, 'InProgress'),
    task('task-18', 'Notify existing flat-rate customers of sunset date', 1, 'NotStarted'),
    task('task-19', 'Migrate flat-rate customers to nearest new plan', 5, 'NotStarted'),
    task('task-20', 'Upgrade CI pipeline caching', 2, 'Done'),
  ]

  const associations: Association[] = [
    link('req-1', 'task-1'),
    link('req-1', 'task-2'),
    link('req-1', 'task-3'),
    link('req-2', 'task-4'),
    link('req-2', 'task-5'),
    link('req-2', 'task-6'),
    link('req-2', 'task-7'),
    link('req-3', 'task-8'),
    link('req-3', 'task-9'),
    link('req-3', 'task-10'),
    link('req-1', 'task-10'),
    link('req-4', 'task-11'),
    link('req-4', 'task-12'),
    link('req-4', 'task-3'),
    link('req-5', 'task-13'),
    link('req-5', 'task-14'),
    link('req-5', 'task-15'),
    link('req-6', 'task-16'),
    link('req-6', 'task-17'),
    link('req-7', 'task-18'),
    link('req-7', 'task-19'),
    // task-20 is intentionally unassociated (orphan task edge case)
  ]

  const taskDependencies: TaskDependency[] = [
    // Multi-currency invoicing chain, 4 tasks deep: task-10 -> task-3 -> task-2 -> task-1
    dependsOn('task-2', 'task-1'),
    dependsOn('task-3', 'task-2'),
    dependsOn('task-10', 'task-3'),
    // task-10 also depends on the usage-metering work (cross-requirement dependency)
    dependsOn('task-10', 'task-9'),
    dependsOn('task-9', 'task-8'),
    // Self-serve plan changes: confirmation emails wait on both upgrade and downgrade logic
    dependsOn('task-5', 'task-4'),
    dependsOn('task-6', 'task-4'),
    dependsOn('task-7', 'task-5'),
    dependsOn('task-7', 'task-6'),
    // Legacy invoice migration QA waits on the conversion itself
    dependsOn('task-12', 'task-11'),
    // Dunning/retry: email sequence and config UI both wait on the retry scheduler
    dependsOn('task-14', 'task-13'),
    dependsOn('task-15', 'task-13'),
    // Audit log viewer waits on the API endpoint it reads from
    dependsOn('task-17', 'task-16'),
    // Flat-rate sunset: migrate customers only after they've been notified
    dependsOn('task-19', 'task-18'),
    // task-20 is intentionally left with no dependencies or dependents (unconnected node edge case)
  ]

  const requirementChanges: RequirementChange[] = [
    // Recorded when req-7 was first added, before task-18/task-19 were later linked to it —
    // demonstrates a zero-impact change (FR-012).
    change('change-1', 'req-7', 'Added', 'Sunset the old flat-rate pricing plan', []),
    // req-4's current associations include task-3, which task-10 depends on but is not itself
    // associated with req-4 — demonstrates direct AND indirect impact (FR-016).
    change('change-2', 'req-4', 'Modified', 'Migrate legacy invoices to new PDF template', [
      'task-11',
      'task-12',
      'task-3',
    ]),
    // A since-removed requirement, not present in `requirements` above — demonstrates that a
    // Removed change remains analyzable (spec User Story 3) and also shows direct+indirect
    // impact via task-17, which depends on task-16 but isn't itself in the snapshot.
    change(
      'change-3',
      'req-8',
      'Removed',
      'Support cryptocurrency invoicing (deprecated pilot)',
      ['task-16'],
    ),
    // req-6's current associations, where nothing depends on either task — demonstrates a
    // direct-only change with no further indirect impact.
    change('change-4', 'req-6', 'Modified', 'Expose billing audit log to customer admins', [
      'task-16',
      'task-17',
    ]),
  ]

  return {
    name: 'Atlas Billing Platform Revamp',
    targetDeadline: '2026-12-15',
    estimatedEffortDays: 120,
    requirements,
    tasks,
    associations,
    taskDependencies,
    requirementChanges,
    nextRequirementSeq: requirements.length + 1,
    nextTaskSeq: tasks.length + 1,
    nextChangeSeq: requirementChanges.length + 1,
  }
}
