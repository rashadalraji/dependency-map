import { describe, expect, it } from 'vitest'
import { wouldCreateCycle } from './dependencyGraph'
import { createSeedProject } from './seedData'

describe('createSeedProject', () => {
  it('is deterministic across calls', () => {
    expect(createSeedProject()).toEqual(createSeedProject())
  })

  it('produces 5-8 requirements and 15-25 tasks', () => {
    const project = createSeedProject()
    expect(project.requirements.length).toBeGreaterThanOrEqual(5)
    expect(project.requirements.length).toBeLessThanOrEqual(8)
    expect(project.tasks.length).toBeGreaterThanOrEqual(15)
    expect(project.tasks.length).toBeLessThanOrEqual(25)
  })

  it('includes at least one task in each status', () => {
    const project = createSeedProject()
    const statuses = new Set(project.tasks.map((task) => task.status))
    expect(statuses.has('NotStarted')).toBe(true)
    expect(statuses.has('InProgress')).toBe(true)
    expect(statuses.has('Done')).toBe(true)
  })

  it('sets the next-id sequences past every seeded id', () => {
    const project = createSeedProject()
    expect(project.nextRequirementSeq).toBe(project.requirements.length + 1)
    expect(project.nextTaskSeq).toBe(project.tasks.length + 1)
    expect(project.nextChangeSeq).toBe(project.requirementChanges.length + 1)
  })

  it('includes at least one requirement change of each type', () => {
    const project = createSeedProject()
    const types = new Set(project.requirementChanges.map((change) => change.changeType))
    expect(types.has('Added')).toBe(true)
    expect(types.has('Modified')).toBe(true)
    expect(types.has('Removed')).toBe(true)
  })

  it('includes a "Removed" change whose requirement no longer appears in the live list', () => {
    const project = createSeedProject()
    const removed = project.requirementChanges.find((change) => change.changeType === 'Removed')
    expect(removed).toBeDefined()
    expect(
      project.requirements.some((requirement) => requirement.id === removed!.requirementId),
    ).toBe(false)
  })

  it('includes a task dependency chain at least 3 tasks deep', () => {
    const project = createSeedProject()
    expect(project.taskDependencies.length).toBeGreaterThan(0)
    expect(project.taskDependencies).toContainEqual({
      dependentTaskId: 'task-3',
      prerequisiteTaskId: 'task-2',
    })
    expect(project.taskDependencies).toContainEqual({
      dependentTaskId: 'task-2',
      prerequisiteTaskId: 'task-1',
    })
  })

  it('contains no cycle in its seeded task dependencies', () => {
    const project = createSeedProject()
    for (const edge of project.taskDependencies) {
      const withoutEdge = {
        ...project,
        taskDependencies: project.taskDependencies.filter((other) => other !== edge),
      }
      expect(wouldCreateCycle(withoutEdge, edge.dependentTaskId, edge.prerequisiteTaskId)).toBe(
        false,
      )
    }
  })
})
