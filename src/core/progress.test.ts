import { describe, expect, it } from 'vitest'
import { computeProgress } from './progress'
import type { Project } from './types'

function projectWithTasks(statuses: Project['tasks'][number]['status'][]): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: statuses.map((status, index) => ({
      id: `task-${index + 1}`,
      title: `Task ${index + 1}`,
      estimatedEffortDays: 1,
      status,
    })),
    associations: [],
    nextRequirementSeq: 1,
    nextTaskSeq: statuses.length + 1,
  }
}

describe('computeProgress', () => {
  it('reports a distinct "no tasks yet" state when there are zero tasks', () => {
    const result = computeProgress(projectWithTasks([]))
    expect(result).toEqual({ totalTasks: 0 })
    expect('percentDone' in result).toBe(false)
  })

  it('reports a percentage strictly between 0 and 100 for a mixed set of statuses', () => {
    const result = computeProgress(projectWithTasks(['Done', 'InProgress', 'NotStarted', 'NotStarted']))
    expect(result).toEqual({ totalTasks: 4, doneTasks: 1, percentDone: 25 })
  })

  it('reports 100 when every task is Done', () => {
    const result = computeProgress(projectWithTasks(['Done', 'Done', 'Done']))
    expect(result).toEqual({ totalTasks: 3, doneTasks: 3, percentDone: 100 })
  })

  it('reports 0 when no task is Done', () => {
    const result = computeProgress(projectWithTasks(['NotStarted', 'InProgress']))
    expect(result).toEqual({ totalTasks: 2, doneTasks: 0, percentDone: 0 })
  })
})
