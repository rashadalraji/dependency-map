import { describe, expect, it } from 'vitest'
import {
  addTask,
  associateTaskWithRequirement,
  editTask,
  removeTask,
  unassociateTaskFromRequirement,
} from './taskOperations'
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
    tasks: [{ id: 'task-1', title: 'Existing task', estimatedEffortDays: 2, status: 'NotStarted' }],
    associations: [
      { requirementId: 'req-1', taskId: 'task-1' },
      { requirementId: 'req-2', taskId: 'task-1' },
    ],
    nextRequirementSeq: 3,
    nextTaskSeq: 2,
  }
}

describe('addTask', () => {
  it('defaults status to NotStarted when omitted', () => {
    const project = addTask(fixtureProject(), { title: 'New task', estimatedEffortDays: 3 })
    expect(project.tasks).toContainEqual({
      id: 'task-2',
      title: 'New task',
      estimatedEffortDays: 3,
      status: 'NotStarted',
    })
    expect(project.nextTaskSeq).toBe(3)
  })

  it('rejects an empty title', () => {
    expect(() => addTask(fixtureProject(), { title: '  ', estimatedEffortDays: 1 })).toThrow()
  })

  it('rejects a non-positive estimated effort', () => {
    expect(() => addTask(fixtureProject(), { title: 'Task', estimatedEffortDays: 0 })).toThrow()
  })
})

describe('editTask', () => {
  it('updates only the given fields', () => {
    const project = editTask(fixtureProject(), 'task-1', { status: 'Done' })
    expect(project.tasks[0]).toEqual({
      id: 'task-1',
      title: 'Existing task',
      estimatedEffortDays: 2,
      status: 'Done',
    })
  })
})

describe('removeTask', () => {
  it('deletes the task and every association referencing it', () => {
    const project = removeTask(fixtureProject(), 'task-1')
    expect(project.tasks).toEqual([])
    expect(project.associations).toEqual([])
  })
})

describe('associateTaskWithRequirement', () => {
  it('is idempotent for an already-linked pair', () => {
    const original = fixtureProject()
    const project = associateTaskWithRequirement(original, 'task-1', 'req-1')
    expect(project.associations).toEqual(original.associations)
  })

  it('adds a new association for a not-yet-linked pair', () => {
    const project = addTask(fixtureProject(), { title: 'New task', estimatedEffortDays: 1 })
    const linked = associateTaskWithRequirement(project, 'task-2', 'req-1')
    expect(linked.associations).toContainEqual({ requirementId: 'req-1', taskId: 'task-2' })
  })
})

describe('unassociateTaskFromRequirement', () => {
  it('removes an existing association', () => {
    const project = unassociateTaskFromRequirement(fixtureProject(), 'task-1', 'req-1')
    expect(project.associations).toEqual([{ requirementId: 'req-2', taskId: 'task-1' }])
  })

  it('is a no-op for a pair that is not associated', () => {
    const original = fixtureProject()
    const project = unassociateTaskFromRequirement(original, 'task-1', 'req-missing')
    expect(project.associations).toEqual(original.associations)
  })
})
