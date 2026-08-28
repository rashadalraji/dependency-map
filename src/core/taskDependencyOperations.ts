import { wouldCreateCycle } from './dependencyGraph'
import type { Project } from './types'

export function addTaskDependency(
  project: Project,
  dependentTaskId: string,
  prerequisiteTaskId: string,
): Project {
  if (dependentTaskId === prerequisiteTaskId) {
    throw new Error('A task cannot depend on itself')
  }

  if (wouldCreateCycle(project, dependentTaskId, prerequisiteTaskId)) {
    throw new Error('This dependency would create a circular chain of dependencies')
  }

  const alreadyExists = project.taskDependencies.some(
    (dependency) =>
      dependency.dependentTaskId === dependentTaskId &&
      dependency.prerequisiteTaskId === prerequisiteTaskId,
  )
  if (alreadyExists) {
    return project
  }

  return {
    ...project,
    taskDependencies: [...project.taskDependencies, { dependentTaskId, prerequisiteTaskId }],
  }
}

export function removeTaskDependency(
  project: Project,
  dependentTaskId: string,
  prerequisiteTaskId: string,
): Project {
  return {
    ...project,
    taskDependencies: project.taskDependencies.filter(
      (dependency) =>
        !(
          dependency.dependentTaskId === dependentTaskId &&
          dependency.prerequisiteTaskId === prerequisiteTaskId
        ),
    ),
  }
}
