import { describe, expect, it } from 'vitest'
import { addTaskDependency, removeTaskDependency } from './taskDependencyOperations'
import type { Project } from './types'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: [
      { id: 'task-a', title: 'Task A', estimatedEffortDays: 1, status: 'NotStarted' },
      { id: 'task-b', title: 'Task B', estimatedEffortDays: 1, status: 'NotStarted' },
      { id: 'task-c', title: 'Task C', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [],
    // A depends on B
    taskDependencies: [{ dependentTaskId: 'task-a', prerequisiteTaskId: 'task-b' }],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 4,
    nextChangeSeq: 1,
  }
}

describe('addTaskDependency', () => {
  it('rejects a self-dependency', () => {
    expect(() => addTaskDependency(fixtureProject(), 'task-a', 'task-a')).toThrow()
  })

  it('rejects a dependency that would form a cycle', () => {
    // task-b already (transitively) leads back to task-a via A->B, so B->A would cycle.
    expect(() => addTaskDependency(fixtureProject(), 'task-b', 'task-a')).toThrow()
  })

  it('is a no-op, not a duplicate, when the pair already exists', () => {
    const original = fixtureProject()
    const project = addTaskDependency(original, 'task-a', 'task-b')
    expect(project.taskDependencies).toEqual(original.taskDependencies)
  })

  it('adds a valid new dependency', () => {
    const project = addTaskDependency(fixtureProject(), 'task-b', 'task-c')
    expect(project.taskDependencies).toContainEqual({
      dependentTaskId: 'task-b',
      prerequisiteTaskId: 'task-c',
    })
  })
})

describe('removeTaskDependency', () => {
  it('removes an existing dependency', () => {
    const project = removeTaskDependency(fixtureProject(), 'task-a', 'task-b')
    expect(project.taskDependencies).toEqual([])
  })

  it('is a no-op for a pair that is not currently a dependency', () => {
    const original = fixtureProject()
    const project = removeTaskDependency(original, 'task-b', 'task-c')
    expect(project.taskDependencies).toEqual(original.taskDependencies)
  })
})
