import type { Project } from './types'

export function nextRequirementId(project: Project): string {
  return `req-${project.nextRequirementSeq}`
}

export function nextTaskId(project: Project): string {
  return `task-${project.nextTaskSeq}`
}
