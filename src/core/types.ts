export type RequirementPriority = 'Low' | 'Medium' | 'High'
export type RequirementStatus = 'Proposed' | 'Approved' | 'Done'
export type TaskStatus = 'NotStarted' | 'InProgress' | 'Done'

export const REQUIREMENT_PRIORITIES: RequirementPriority[] = ['Low', 'Medium', 'High']
export const REQUIREMENT_STATUSES: RequirementStatus[] = ['Proposed', 'Approved', 'Done']
export const TASK_STATUSES: TaskStatus[] = ['NotStarted', 'InProgress', 'Done']

export interface Requirement {
  id: string
  description: string
  priority: RequirementPriority
  status: RequirementStatus
}

export interface Task {
  id: string
  title: string
  estimatedEffortDays: number
  status: TaskStatus
}

export interface Association {
  requirementId: string
  taskId: string
}

export interface TaskDependency {
  dependentTaskId: string
  prerequisiteTaskId: string
}

export interface Project {
  name: string
  targetDeadline: string
  estimatedEffortDays: number
  requirements: Requirement[]
  tasks: Task[]
  associations: Association[]
  taskDependencies: TaskDependency[]
  nextRequirementSeq: number
  nextTaskSeq: number
}
