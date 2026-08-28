import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { analyzeRequirementChange } from '../core/impactAnalysis'
import type { Project } from '../core/types'
import { RELATION_INFO } from './graphLayout'
import { ImpactReport } from './ImpactReport'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [{ id: 'req-1', description: 'Req One', priority: 'High', status: 'Approved' }],
    tasks: [
      { id: 'task-a', title: 'Task A', estimatedEffortDays: 2, status: 'NotStarted' },
      { id: 'task-b', title: 'Task B', estimatedEffortDays: 3, status: 'NotStarted' },
    ],
    associations: [],
    // Task B depends on Task A.
    taskDependencies: [{ dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' }],
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
    nextTaskSeq: 3,
    nextChangeSeq: 2,
  }
}

describe('ImpactReport', () => {
  it('renders the correct affected-task counts, effort impact, schedule impact, and risk level', () => {
    const project = fixtureProject()
    const change = project.requirementChanges[0]
    const result = analyzeRequirementChange(project, change.id)

    render(<ImpactReport project={project} change={change} result={result} />)

    expect(screen.getByText('Directly affected tasks').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Indirectly affected tasks').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Effort impact').nextElementSibling).toHaveTextContent('5 days')
    expect(screen.getByText('Schedule impact').nextElementSibling).toHaveTextContent('5 days')
    expect(screen.getByText('Risk level').nextElementSibling).toHaveTextContent('High')
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
  })

  it('renders an identical result when the same change is analyzed twice', () => {
    const project = fixtureProject()
    const change = project.requirementChanges[0]
    const first = analyzeRequirementChange(project, change.id)
    const second = analyzeRequirementChange(project, change.id)
    expect(first).toEqual(second)
  })
})

describe('ImpactReport - explanations (US2)', () => {
  function multiHopProject(): Project {
    return {
      ...fixtureProject(),
      tasks: [
        ...fixtureProject().tasks,
        { id: 'task-c', title: 'Task C', estimatedEffortDays: 1, status: 'NotStarted' },
      ],
      // Task B depends on Task A (direct); Task C depends on Task B (indirect via indirect).
      taskDependencies: [
        { dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' },
        { dependentTaskId: 'task-c', prerequisiteTaskId: 'task-b' },
      ],
    }
  }

  it("states that a directly affected task implements the changed requirement", () => {
    const project = multiHopProject()
    const change = project.requirementChanges[0]
    const result = analyzeRequirementChange(project, change.id)
    render(<ImpactReport project={project} change={change} result={result} />)

    const taskAItem = screen.getByText('Task A').closest('li')!
    expect(taskAItem).toHaveTextContent('Implements the changed requirement')
    expect(taskAItem).toHaveTextContent('Req One')
  })

  it("names the actual direct parent task for a multi-hop indirect task, not the original requirement's tasks", () => {
    const project = multiHopProject()
    const change = project.requirementChanges[0]
    const result = analyzeRequirementChange(project, change.id)
    render(<ImpactReport project={project} change={change} result={result} />)

    const taskCItem = screen.getByText('Task C').closest('li')!
    expect(taskCItem).toHaveTextContent('Task B')
    expect(taskCItem).not.toHaveTextContent('Task A')
  })
})

describe('ImpactReport - Report/Map color consistency (005, US2)', () => {
  it("labels a directly affected task using RELATION_INFO's shared definition, not a local duplicate", () => {
    const project = fixtureProject()
    const change = project.requirementChanges[0]
    const result = analyzeRequirementChange(project, change.id)
    render(<ImpactReport project={project} change={change} result={result} />)

    const taskAItem = screen.getByText('Task A').closest('li')!
    expect(taskAItem).toHaveTextContent(RELATION_INFO.direct.label)
  })

  it("labels an indirectly affected task using RELATION_INFO's shared definition, not a local duplicate", () => {
    const project = fixtureProject()
    const change = project.requirementChanges[0]
    const result = analyzeRequirementChange(project, change.id)
    render(<ImpactReport project={project} change={change} result={result} />)

    const taskBItem = screen.getByText('Task B').closest('li')!
    expect(taskBItem).toHaveTextContent(RELATION_INFO.indirect.label)
  })
})
