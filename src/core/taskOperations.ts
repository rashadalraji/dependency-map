import { nextTaskId } from './ids'
import type { Project, Task, TaskStatus } from './types'

export interface AddTaskInput {
  title: string
  estimatedEffortDays: number
  status?: TaskStatus
}

export function addTask(project: Project, input: AddTaskInput): Project {
  const title = input.title.trim()
  if (title === '') {
    throw new Error('Task title must not be empty')
  }
  if (!(input.estimatedEffortDays > 0)) {
    throw new Error('Task estimated effort must be a positive number')
  }

  const task: Task = {
    id: nextTaskId(project),
    title,
    estimatedEffortDays: input.estimatedEffortDays,
    status: input.status ?? 'NotStarted',
  }

  return {
    ...project,
    tasks: [...project.tasks, task],
    nextTaskSeq: project.nextTaskSeq + 1,
  }
}

export interface EditTaskChanges {
  title?: string
  estimatedEffortDays?: number
  status?: TaskStatus
}

export function editTask(project: Project, taskId: string, changes: EditTaskChanges): Project {
  return {
    ...project,
    tasks: project.tasks.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      const title = changes.title !== undefined ? changes.title.trim() : task.title
      if (title === '') {
        throw new Error('Task title must not be empty')
      }

      const estimatedEffortDays = changes.estimatedEffortDays ?? task.estimatedEffortDays
      if (!(estimatedEffortDays > 0)) {
        throw new Error('Task estimated effort must be a positive number')
      }

      return {
        ...task,
        title,
        estimatedEffortDays,
        status: changes.status ?? task.status,
      }
    }),
  }
}

export function removeTask(project: Project, taskId: string): Project {
  return {
    ...project,
    tasks: project.tasks.filter((task) => task.id !== taskId),
    associations: project.associations.filter((association) => association.taskId !== taskId),
    taskDependencies: project.taskDependencies.filter(
      (dependency) =>
        dependency.dependentTaskId !== taskId && dependency.prerequisiteTaskId !== taskId,
    ),
  }
}

export function associateTaskWithRequirement(
  project: Project,
  taskId: string,
  requirementId: string,
): Project {
  const alreadyLinked = project.associations.some(
    (association) => association.taskId === taskId && association.requirementId === requirementId,
  )
  if (alreadyLinked) {
    return project
  }

  return {
    ...project,
    associations: [...project.associations, { taskId, requirementId }],
  }
}

export function unassociateTaskFromRequirement(
  project: Project,
  taskId: string,
  requirementId: string,
): Project {
  return {
    ...project,
    associations: project.associations.filter(
      (association) =>
        !(association.taskId === taskId && association.requirementId === requirementId),
    ),
  }
}
