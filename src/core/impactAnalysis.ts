import { getDirectDependents } from './dependencyGraph'
import type { AffectedTask, ImpactResult, ImpactRiskLevel, Project, Task } from './types'

export function analyzeRequirementChange(project: Project, changeId: string): ImpactResult {
  const change = project.requirementChanges.find((candidate) => candidate.id === changeId)
  if (!change) {
    throw new Error(`Requirement change not found: ${changeId}`)
  }

  const taskById = new Map(project.tasks.map((task) => [task.id, task]))

  // Direct impact: the change's snapshot, filtered to tasks that still exist.
  const directTaskIds = change.directlyAssociatedTaskIds.filter((taskId) => taskById.has(taskId))
  const directSet = new Set(directTaskIds)

  // Indirect impact: breadth-first, downstream only, via the current dependency graph.
  // `causedBy` records the specific parent that caused each indirect task's inclusion, for its
  // explanation. `visited` (seeded with the direct set) prevents re-processing, dedups a task
  // reached via multiple chains, and makes any cycle in the dependency graph safe (FR-013).
  const causedBy = new Map<string, string>()
  const indirectOrder: string[] = []
  const visited = new Set(directSet)
  const queue = [...directTaskIds]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    for (const dependent of getDirectDependents(project, currentId)) {
      if (visited.has(dependent.id)) {
        continue
      }
      visited.add(dependent.id)
      causedBy.set(dependent.id, currentId)
      indirectOrder.push(dependent.id)
      queue.push(dependent.id)
    }
  }

  const affectedTasks: AffectedTask[] = [
    ...directTaskIds.map(
      (taskId): AffectedTask => ({
        taskId,
        relation: 'direct',
        reason: `Implements the changed requirement: "${change.requirementDescriptionSnapshot}".`,
      }),
    ),
    ...indirectOrder.map((taskId): AffectedTask => {
      const parentId = causedBy.get(taskId)!
      const parentTitle = taskById.get(parentId)?.title ?? parentId
      const parentQualifier = directSet.has(parentId)
        ? 'is directly affected by'
        : 'is also affected by'
      return {
        taskId,
        relation: 'indirect',
        reason: `Depends on "${parentTitle}", which ${parentQualifier} this change.`,
      }
    }),
  ]

  const affectedIds = new Set(affectedTasks.map((affected) => affected.taskId))
  const effortImpactDays = affectedTasks.reduce(
    (sum, affected) => sum + (taskById.get(affected.taskId)?.estimatedEffortDays ?? 0),
    0,
  )
  const scheduleImpactDays = computeScheduleImpactDays(project, affectedIds, taskById)
  const riskLevel = computeRiskLevel(affectedTasks.length, scheduleImpactDays)

  return { changeId, affectedTasks, effortImpactDays, scheduleImpactDays, riskLevel }
}

/**
 * The longest chain, by summed estimated effort, through the subgraph induced by the affected
 * tasks and the dependency edges connecting them — unconnected affected tasks do not add to this
 * figure. Memoized DFS with a cycle guard so a (should-be-impossible) cycle still terminates.
 */
function computeScheduleImpactDays(
  project: Project,
  affectedIds: Set<string>,
  taskById: Map<string, Task>,
): number {
  const memo = new Map<string, number>()
  const visiting = new Set<string>()

  function longestEndingAt(taskId: string): number {
    if (memo.has(taskId)) {
      return memo.get(taskId)!
    }
    if (visiting.has(taskId)) {
      return 0
    }
    visiting.add(taskId)

    const ownEffort = taskById.get(taskId)?.estimatedEffortDays ?? 0
    let bestPrerequisite = 0
    for (const dependency of project.taskDependencies) {
      if (dependency.dependentTaskId === taskId && affectedIds.has(dependency.prerequisiteTaskId)) {
        bestPrerequisite = Math.max(bestPrerequisite, longestEndingAt(dependency.prerequisiteTaskId))
      }
    }

    const result = ownEffort + bestPrerequisite
    visiting.delete(taskId)
    memo.set(taskId, result)
    return result
  }

  let longest = 0
  for (const taskId of affectedIds) {
    longest = Math.max(longest, longestEndingAt(taskId))
  }
  return longest
}

const RISK_TIERS: ImpactRiskLevel[] = ['Low', 'Medium', 'High', 'Critical']

function tierForAffectedCount(count: number): ImpactRiskLevel {
  if (count === 0) return 'Low'
  if (count <= 2) return 'Medium'
  if (count <= 5) return 'High'
  return 'Critical'
}

function tierForScheduleImpact(days: number): ImpactRiskLevel {
  if (days <= 0) return 'Low'
  if (days <= 3) return 'Medium'
  if (days <= 9) return 'High'
  return 'Critical'
}

function computeRiskLevel(affectedCount: number, scheduleImpactDays: number): ImpactRiskLevel {
  const countTier = tierForAffectedCount(affectedCount)
  const scheduleTier = tierForScheduleImpact(scheduleImpactDays)
  return RISK_TIERS.indexOf(countTier) >= RISK_TIERS.indexOf(scheduleTier) ? countTier : scheduleTier
}
