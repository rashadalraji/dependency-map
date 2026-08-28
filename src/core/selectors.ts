import type { Project, Requirement, Task } from './types'

export function getTasksForRequirement(project: Project, requirementId: string): Task[] {
  const taskIds = new Set(
    project.associations
      .filter((association) => association.requirementId === requirementId)
      .map((association) => association.taskId),
  )
  return project.tasks.filter((task) => taskIds.has(task.id))
}

export function getRequirementsForTask(project: Project, taskId: string): Requirement[] {
  const requirementIds = new Set(
    project.associations
      .filter((association) => association.taskId === taskId)
      .map((association) => association.requirementId),
  )
  return project.requirements.filter((requirement) => requirementIds.has(requirement.id))
}
