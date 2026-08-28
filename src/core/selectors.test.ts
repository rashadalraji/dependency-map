import { describe, expect, it } from 'vitest'
import { getRequirementsForTask, getTasksForRequirement } from './selectors'
import type { Project } from './types'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [
      { id: 'req-1', description: 'Req One', priority: 'High', status: 'Approved' },
      { id: 'req-2', description: 'Req Two', priority: 'Low', status: 'Proposed' },
    ],
    tasks: [
      { id: 'task-1', title: 'Task One', estimatedEffortDays: 1, status: 'NotStarted' },
      { id: 'task-2', title: 'Task Two', estimatedEffortDays: 1, status: 'Done' },
      { id: 'task-3', title: 'Task Three (orphan)', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [
      { requirementId: 'req-1', taskId: 'task-1' },
      { requirementId: 'req-1', taskId: 'task-2' },
      { requirementId: 'req-2', taskId: 'task-2' },
    ],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: 3,
    nextTaskSeq: 4,
    nextChangeSeq: 1,
  }
}

describe('getTasksForRequirement', () => {
  it('returns every task linked to a requirement', () => {
    const project = fixtureProject()
    expect(getTasksForRequirement(project, 'req-1').map((task) => task.id)).toEqual([
      'task-1',
      'task-2',
    ])
  })

  it('returns an empty array, not an error, for a requirement with no tasks', () => {
    const project = fixtureProject()
    project.requirements.push({
      id: 'req-3',
      description: 'Req Three',
      priority: 'Medium',
      status: 'Proposed',
    })
    expect(getTasksForRequirement(project, 'req-3')).toEqual([])
  })
})

describe('getRequirementsForTask', () => {
  it('returns every requirement linked to a task, including multiple requirements', () => {
    const project = fixtureProject()
    expect(getRequirementsForTask(project, 'task-2').map((requirement) => requirement.id)).toEqual([
      'req-1',
      'req-2',
    ])
  })

  it('returns an empty array, not an error, for an unassociated task', () => {
    const project = fixtureProject()
    expect(getRequirementsForTask(project, 'task-3')).toEqual([])
  })
})
