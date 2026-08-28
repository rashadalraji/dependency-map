import { describe, expect, it } from 'vitest'
import { getDirectDependencies, getDirectDependents, wouldCreateCycle } from './dependencyGraph'
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
      { id: 'task-d', title: 'Task D (unconnected)', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [],
    // A depends on B, B depends on C
    taskDependencies: [
      { dependentTaskId: 'task-a', prerequisiteTaskId: 'task-b' },
      { dependentTaskId: 'task-b', prerequisiteTaskId: 'task-c' },
    ],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 5,
    nextChangeSeq: 1,
  }
}

describe('getDirectDependencies', () => {
  it('returns only the direct prerequisite, not the transitive chain', () => {
    const project = fixtureProject()
    expect(getDirectDependencies(project, 'task-a').map((task) => task.id)).toEqual(['task-b'])
  })

  it('returns an empty array for an unconnected task', () => {
    const project = fixtureProject()
    expect(getDirectDependencies(project, 'task-d')).toEqual([])
  })
})

describe('getDirectDependents', () => {
  it('returns only the direct dependent, not the transitive chain', () => {
    const project = fixtureProject()
    expect(getDirectDependents(project, 'task-c').map((task) => task.id)).toEqual(['task-b'])
  })

  it('returns an empty array for an unconnected task', () => {
    const project = fixtureProject()
    expect(getDirectDependents(project, 'task-d')).toEqual([])
  })
})

describe('wouldCreateCycle', () => {
  it('is true for a task depending on itself', () => {
    const project = fixtureProject()
    expect(wouldCreateCycle(project, 'task-a', 'task-a')).toBe(true)
  })

  it('is true across an indirect chain (A depends on B depends on C; C depending on A would cycle)', () => {
    const project = fixtureProject()
    expect(wouldCreateCycle(project, 'task-c', 'task-a')).toBe(true)
  })

  it('is false for an unrelated pair', () => {
    const project = fixtureProject()
    expect(wouldCreateCycle(project, 'task-d', 'task-a')).toBe(false)
  })

  it('is false for a new dependency that extends the chain without closing it', () => {
    const project = fixtureProject()
    expect(wouldCreateCycle(project, 'task-d', 'task-c')).toBe(false)
  })
})
