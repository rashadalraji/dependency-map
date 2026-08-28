import type { Project, Task } from './types'

export function getDirectDependencies(project: Project, taskId: string): Task[] {
  const prerequisiteIds = new Set(
    project.taskDependencies
      .filter((dependency) => dependency.dependentTaskId === taskId)
      .map((dependency) => dependency.prerequisiteTaskId),
  )
  return project.tasks.filter((task) => prerequisiteIds.has(task.id))
}

export function getDirectDependents(project: Project, taskId: string): Task[] {
  const dependentIds = new Set(
    project.taskDependencies
      .filter((dependency) => dependency.prerequisiteTaskId === taskId)
      .map((dependency) => dependency.dependentTaskId),
  )
  return project.tasks.filter((task) => dependentIds.has(task.id))
}

/**
 * True if adding a dependency where `dependentTaskId` depends on `prerequisiteTaskId` would
 * create a cycle: either a direct self-dependency, or an existing path from `prerequisiteTaskId`
 * back to `dependentTaskId` following current "depends on" edges forward.
 */
export function wouldCreateCycle(
  project: Project,
  dependentTaskId: string,
  prerequisiteTaskId: string,
): boolean {
  if (dependentTaskId === prerequisiteTaskId) {
    return true
  }

  const visited = new Set<string>()
  const queue: string[] = [prerequisiteTaskId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (currentId === dependentTaskId) {
      return true
    }
    if (visited.has(currentId)) {
      continue
    }
    visited.add(currentId)

    for (const dependency of project.taskDependencies) {
      if (dependency.dependentTaskId === currentId) {
        queue.push(dependency.prerequisiteTaskId)
      }
    }
  }

  return false
}
