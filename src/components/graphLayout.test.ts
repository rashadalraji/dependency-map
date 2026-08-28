import { describe, expect, it } from 'vitest'
import { buildDependencyGraphElements } from './graphLayout'
import type { Project } from '../core/types'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: [
      { id: 'task-a', title: 'Task A', estimatedEffortDays: 1, status: 'Done' },
      { id: 'task-b', title: 'Task B', estimatedEffortDays: 1, status: 'InProgress' },
      { id: 'task-c', title: 'Task C', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [],
    taskDependencies: [{ dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' }],
    nextRequirementSeq: 1,
    nextTaskSeq: 4,
  }
}

describe('buildDependencyGraphElements', () => {
  it('produces exactly one node per task and one edge per dependency', () => {
    const project = fixtureProject()
    const { nodes, edges } = buildDependencyGraphElements(project, null)
    expect(nodes).toHaveLength(3)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({ source: 'task-a', target: 'task-b' })
  })

  it('produces the same node positions across two calls with the same input (determinism)', () => {
    const project = fixtureProject()
    const first = buildDependencyGraphElements(project, null)
    const second = buildDependencyGraphElements(project, null)
    expect(first.nodes.map((node) => node.position)).toEqual(
      second.nodes.map((node) => node.position),
    )
  })

  it('tags relationships correctly relative to the selected task', () => {
    const project = fixtureProject()
    const { nodes } = buildDependencyGraphElements(project, 'task-b')
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node.data]))
    expect(byId['task-b'].relation).toBe('selected')
    expect(byId['task-a'].relation).toBe('dependency')
    expect(byId['task-c'].relation).toBe('unrelated')
  })
})
