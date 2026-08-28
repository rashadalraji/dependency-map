import { describe, expect, it } from 'vitest'
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
  })
})
