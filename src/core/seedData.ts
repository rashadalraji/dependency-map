import type { Association, Project, Requirement, Task } from './types'

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

  return {
    name: 'Atlas Billing Platform Revamp',
    targetDeadline: '2026-12-15',
    estimatedEffortDays: 120,
    requirements,
    tasks,
    associations,
    nextRequirementSeq: requirements.length + 1,
    nextTaskSeq: tasks.length + 1,
  }
}
