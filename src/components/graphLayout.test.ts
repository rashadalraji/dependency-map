import { describe, expect, it } from 'vitest'
import { buildDependencyGraphElements, buildImpactGraphElements } from './graphLayout'
import type { ImpactResult, Project } from '../core/types'

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
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 4,
    nextChangeSeq: 1,
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

describe('buildImpactGraphElements - edge chain highlighting (005)', () => {
  function chainFixtureProject(): Project {
    return {
      name: 'Test Project',
      targetDeadline: '2026-01-01',
      estimatedEffortDays: 10,
      requirements: [],
      tasks: [
        { id: 'task-a', title: 'Task A', estimatedEffortDays: 1, status: 'Done' },
        { id: 'task-b', title: 'Task B', estimatedEffortDays: 1, status: 'NotStarted' },
        { id: 'task-c', title: 'Task C', estimatedEffortDays: 1, status: 'NotStarted' },
        { id: 'task-d', title: 'Task D (unaffected)', estimatedEffortDays: 1, status: 'NotStarted' },
      ],
      associations: [],
      taskDependencies: [
        { dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' }, // a -> b: direct -> indirect
        { dependentTaskId: 'task-c', prerequisiteTaskId: 'task-a' }, // a -> c: direct -> direct
        { dependentTaskId: 'task-a', prerequisiteTaskId: 'task-d' }, // d -> a: unaffected -> direct
        { dependentTaskId: 'task-d', prerequisiteTaskId: 'task-c' }, // c -> d: direct -> unaffected
      ],
      requirementChanges: [],
      nextRequirementSeq: 1,
      nextTaskSeq: 5,
      nextChangeSeq: 1,
    }
  }

  function chainFixtureResult(): ImpactResult {
    return {
      changeId: 'change-1',
      affectedTasks: [
        { taskId: 'task-a', relation: 'direct', reason: 'Implements the changed requirement.' },
        { taskId: 'task-c', relation: 'direct', reason: 'Implements the changed requirement.' },
        { taskId: 'task-b', relation: 'indirect', reason: 'Depends on "Task A".' },
      ],
      effortImpactDays: 3,
      scheduleImpactDays: 2,
      riskLevel: 'Medium',
    }
  }

  function edgeBetween(edges: ReturnType<typeof buildImpactGraphElements>['edges'], source: string, target: string) {
    return edges.find((edge) => edge.source === source && edge.target === target)!
  }

  it('emphasizes an edge between a directly affected task and an indirectly affected one, colored by the target', () => {
    const { edges } = buildImpactGraphElements(chainFixtureProject(), chainFixtureResult())
    const edge = edgeBetween(edges, 'task-a', 'task-b')
    expect(edge.style).toMatchObject({ opacity: 1 })
    expect((edge.markerEnd as { color: string }).color).toBe('#f97316') // indirect (orange)
  })

  it('emphasizes an edge directly connecting two directly affected tasks', () => {
    const { edges } = buildImpactGraphElements(chainFixtureProject(), chainFixtureResult())
    const edge = edgeBetween(edges, 'task-a', 'task-c')
    expect(edge.style).toMatchObject({ opacity: 1 })
    expect((edge.markerEnd as { color: string }).color).toBe('#e11d48') // direct (rose)
  })

  it('de-emphasizes an edge whose source is unaffected, even though its target is affected', () => {
    const { edges } = buildImpactGraphElements(chainFixtureProject(), chainFixtureResult())
    const edge = edgeBetween(edges, 'task-d', 'task-a')
    expect(edge.style).toMatchObject({ opacity: 0.35 })
  })

  it('de-emphasizes an edge whose target is unaffected, even though its source is affected', () => {
    const { edges } = buildImpactGraphElements(chainFixtureProject(), chainFixtureResult())
    const edge = edgeBetween(edges, 'task-c', 'task-d')
    expect(edge.style).toMatchObject({ opacity: 0.35 })
  })

  it('de-emphasizes every edge when the impact result is null', () => {
    const { edges } = buildImpactGraphElements(chainFixtureProject(), null)
    for (const edge of edges) {
      expect(edge.style).toMatchObject({ opacity: 0.35 })
    }
  })

  it('de-emphasizes every edge when the impact result has no affected tasks', () => {
    const emptyResult: ImpactResult = {
      changeId: 'change-1',
      affectedTasks: [],
      effortImpactDays: 0,
      scheduleImpactDays: 0,
      riskLevel: 'Low',
    }
    const { edges } = buildImpactGraphElements(chainFixtureProject(), emptyResult)
    for (const edge of edges) {
      expect(edge.style).toMatchObject({ opacity: 0.35 })
    }
  })
})
