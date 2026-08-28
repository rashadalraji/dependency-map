import type { Project } from './types'

export type ProgressSummary =
  | { totalTasks: 0 }
  | { totalTasks: number; doneTasks: number; percentDone: number }

export function computeProgress(project: Project): ProgressSummary {
  const totalTasks = project.tasks.length
  if (totalTasks === 0) {
    return { totalTasks: 0 }
  }

  const doneTasks = project.tasks.filter((task) => task.status === 'Done').length
  const percentDone = Math.round((doneTasks / totalTasks) * 100)
  return { totalTasks, doneTasks, percentDone }
}
