import { describe, expect, it } from 'vitest'
import { recordRequirementChange } from './requirementChangeLog'
import type { Project } from './types'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [
      { id: 'req-1', description: 'Req One', priority: 'High', status: 'Approved' },
    ],
    tasks: [{ id: 'task-1', title: 'Task One', estimatedEffortDays: 2, status: 'NotStarted' }],
    associations: [{ requirementId: 'req-1', taskId: 'task-1' }],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: 2,
    nextTaskSeq: 2,
    nextChangeSeq: 1,
  }
}

describe('recordRequirementChange', () => {
  it('appends a change with a deterministic id and the current associations as a snapshot', () => {
    const project = recordRequirementChange(fixtureProject(), 'req-1', 'Modified', 'Req One')
    expect(project.requirementChanges).toEqual([
      {
        id: 'change-1',
        requirementId: 'req-1',
        changeType: 'Modified',
        requirementDescriptionSnapshot: 'Req One',
        directlyAssociatedTaskIds: ['task-1'],
      },
    ])
    expect(project.nextChangeSeq).toBe(2)
  })

  it('snapshots an empty association list for a requirement with no associated tasks', () => {
    const project = recordRequirementChange(fixtureProject(), 'req-2', 'Added', 'Req Two')
    expect(project.requirementChanges[0].directlyAssociatedTaskIds).toEqual([])
  })

  it('is deterministic: two calls with the same input produce the same change apart from nothing (pure)', () => {
    const first = recordRequirementChange(fixtureProject(), 'req-1', 'Modified', 'Req One')
    const second = recordRequirementChange(fixtureProject(), 'req-1', 'Modified', 'Req One')
    expect(first.requirementChanges).toEqual(second.requirementChanges)
  })
})
