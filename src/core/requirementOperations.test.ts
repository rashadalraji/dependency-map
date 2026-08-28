import { describe, expect, it } from 'vitest'
import { addRequirement, editRequirement, removeRequirement } from './requirementOperations'
import type { Project } from './types'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [
      { id: 'req-1', description: 'Existing requirement', priority: 'Medium', status: 'Proposed' },
    ],
    tasks: [{ id: 'task-1', title: 'Existing task', estimatedEffortDays: 2, status: 'NotStarted' }],
    associations: [{ requirementId: 'req-1', taskId: 'task-1' }],
    taskDependencies: [],
    nextRequirementSeq: 2,
    nextTaskSeq: 2,
  }
}

describe('addRequirement', () => {
  it('appends a new requirement defaulting to Proposed status', () => {
    const project = addRequirement(fixtureProject(), {
      description: 'New requirement',
      priority: 'High',
    })
    expect(project.requirements).toContainEqual({
      id: 'req-2',
      description: 'New requirement',
      priority: 'High',
      status: 'Proposed',
    })
    expect(project.nextRequirementSeq).toBe(3)
  })

  it('rejects an empty or whitespace-only description', () => {
    expect(() => addRequirement(fixtureProject(), { description: '   ', priority: 'Low' })).toThrow()
  })
})

describe('editRequirement', () => {
  it('updates only the given fields', () => {
    const project = editRequirement(fixtureProject(), 'req-1', { status: 'Approved' })
    expect(project.requirements[0]).toEqual({
      id: 'req-1',
      description: 'Existing requirement',
      priority: 'Medium',
      status: 'Approved',
    })
  })
})

describe('removeRequirement', () => {
  it('deletes the requirement and its associations, leaving its tasks intact', () => {
    const project = removeRequirement(fixtureProject(), 'req-1')
    expect(project.requirements).toEqual([])
    expect(project.associations).toEqual([])
    expect(project.tasks).toEqual([
      { id: 'task-1', title: 'Existing task', estimatedEffortDays: 2, status: 'NotStarted' },
    ])
  })

  it('is a no-op when the id does not exist', () => {
    const original = fixtureProject()
    const project = removeRequirement(original, 'req-missing')
    expect(project.requirements).toEqual(original.requirements)
    expect(project.associations).toEqual(original.associations)
  })
})
