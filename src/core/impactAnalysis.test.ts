import { describe, expect, it } from 'vitest'
import { analyzeRequirementChange } from './impactAnalysis'
import type { Project } from './types'

function baseProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [{ id: 'req-1', description: 'Req One', priority: 'High', status: 'Approved' }],
    tasks: [
      { id: 'task-a', title: 'Task A', estimatedEffortDays: 2, status: 'NotStarted' },
      { id: 'task-b', title: 'Task B', estimatedEffortDays: 3, status: 'NotStarted' },
      { id: 'task-c', title: 'Task C', estimatedEffortDays: 4, status: 'NotStarted' },
      { id: 'task-d', title: 'Task D', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [],
    // A <- B <- C (B depends on A, C depends on B); D is unconnected.
    taskDependencies: [
      { dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' },
      { dependentTaskId: 'task-c', prerequisiteTaskId: 'task-b' },
    ],
    requirementChanges: [
      {
        id: 'change-1',
        requirementId: 'req-1',
        changeType: 'Modified',
        requirementDescriptionSnapshot: 'Req One',
        directlyAssociatedTaskIds: ['task-a'],
      },
    ],
    nextRequirementSeq: 2,
    nextTaskSeq: 5,
    nextChangeSeq: 2,
  }
}

describe('analyzeRequirementChange', () => {
  it('reports zero affected tasks and Low risk for a change with no associated tasks', () => {
    const project: Project = {
      ...baseProject(),
      requirementChanges: [
        {
          id: 'change-1',
          requirementId: 'req-1',
          changeType: 'Added',
          requirementDescriptionSnapshot: 'Req One',
          directlyAssociatedTaskIds: [],
        },
      ],
    }
    const result = analyzeRequirementChange(project, 'change-1')
    expect(result.affectedTasks).toEqual([])
    expect(result.riskLevel).toBe('Low')
  })

  it('identifies direct and transitively indirect tasks across a multi-hop chain', () => {
    const result = analyzeRequirementChange(baseProject(), 'change-1')
    expect(result.affectedTasks.map((affected) => affected.taskId)).toEqual([
      'task-a',
      'task-b',
      'task-c',
    ])
    expect(result.affectedTasks[0].relation).toBe('direct')
    expect(result.affectedTasks[1].relation).toBe('indirect')
    expect(result.affectedTasks[2].relation).toBe('indirect')
  })

  it("names the actual direct parent in a multi-hop indirect task's reason", () => {
    const result = analyzeRequirementChange(baseProject(), 'change-1')
    const taskC = result.affectedTasks.find((affected) => affected.taskId === 'task-c')!
    expect(taskC.reason).toContain('Task B')
    expect(taskC.reason).not.toContain('Task A')
  })

  it('states that a directly affected task implements the changed requirement', () => {
    const result = analyzeRequirementChange(baseProject(), 'change-1')
    const taskA = result.affectedTasks.find((affected) => affected.taskId === 'task-a')!
    expect(taskA.reason).toContain('Implements the changed requirement')
    expect(taskA.reason).toContain('Req One')
  })

  it('silently drops a snapshotted task id that no longer has a matching task', () => {
    const project: Project = {
      ...baseProject(),
      requirementChanges: [
        {
          id: 'change-1',
          requirementId: 'req-1',
          changeType: 'Modified',
          requirementDescriptionSnapshot: 'Req One',
          directlyAssociatedTaskIds: ['task-a', 'task-missing'],
        },
      ],
    }
    const result = analyzeRequirementChange(project, 'change-1')
    expect(result.affectedTasks.some((affected) => affected.taskId === 'task-missing')).toBe(false)
  })

  it('counts a task reached via two different chains exactly once', () => {
    const project: Project = {
      ...baseProject(),
      tasks: [
        ...baseProject().tasks,
        { id: 'task-e', title: 'Task E', estimatedEffortDays: 1, status: 'NotStarted' },
      ],
      // Both task-a and task-d are direct; task-e depends on both.
      taskDependencies: [
        ...baseProject().taskDependencies,
        { dependentTaskId: 'task-e', prerequisiteTaskId: 'task-a' },
        { dependentTaskId: 'task-e', prerequisiteTaskId: 'task-d' },
      ],
      requirementChanges: [
        {
          id: 'change-1',
          requirementId: 'req-1',
          changeType: 'Modified',
          requirementDescriptionSnapshot: 'Req One',
          directlyAssociatedTaskIds: ['task-a', 'task-d'],
        },
      ],
    }
    const result = analyzeRequirementChange(project, 'change-1')
    expect(result.affectedTasks.filter((affected) => affected.taskId === 'task-e')).toHaveLength(1)
  })

  it('terminates safely if the dependency graph contains a cycle', () => {
    const project: Project = {
      ...baseProject(),
      // Constructed cyclic fixture: a -> b -> a (should be impossible via the app's own UI, but
      // the analysis must not hang or crash if it ever occurs).
      taskDependencies: [
        { dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' },
        { dependentTaskId: 'task-a', prerequisiteTaskId: 'task-b' },
      ],
    }
    const result = analyzeRequirementChange(project, 'change-1')
    expect(result.affectedTasks.map((affected) => affected.taskId).sort()).toEqual([
      'task-a',
      'task-b',
    ])
  })

  it('computes schedule impact as the longest dependency-connected chain, not the flat sum', () => {
    // task-a(2) -> task-b(3) -> task-c(4): longest chain = 2+3+4 = 9, not just count-based.
    const result = analyzeRequirementChange(baseProject(), 'change-1')
    expect(result.effortImpactDays).toBe(9)
    expect(result.scheduleImpactDays).toBe(9)
  })

  it('does not let an unconnected affected task inflate the schedule impact', () => {
    const project: Project = {
      ...baseProject(),
      requirementChanges: [
        {
          id: 'change-1',
          requirementId: 'req-1',
          changeType: 'Modified',
          requirementDescriptionSnapshot: 'Req One',
          directlyAssociatedTaskIds: ['task-a', 'task-d'],
        },
      ],
    }
    const result = analyzeRequirementChange(project, 'change-1')
    // task-d (1 day) is unconnected to the a->b->c chain; schedule impact stays at the chain's
    // own longest path (2+3+4=9 through a->b->c), not 9+1.
    expect(result.scheduleImpactDays).toBe(9)
  })

  it('assigns risk tiers deterministically from affected count and schedule impact', () => {
    const zeroTasks: Project = {
      ...baseProject(),
      requirementChanges: [
        {
          id: 'change-1',
          requirementId: 'req-1',
          changeType: 'Added',
          requirementDescriptionSnapshot: 'Req One',
          directlyAssociatedTaskIds: [],
        },
      ],
    }
    expect(analyzeRequirementChange(zeroTasks, 'change-1').riskLevel).toBe('Low')

    // 3 affected tasks (task-a, task-b, task-c) -> count tier High; schedule 9 days -> also High.
    expect(analyzeRequirementChange(baseProject(), 'change-1').riskLevel).toBe('High')
  })
})
