import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ImpactResult, Project } from '../core/types'
import { ImpactMap } from './ImpactMap'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: [{ id: 'task-a', title: 'Task A', estimatedEffortDays: 1, status: 'NotStarted' }],
    associations: [],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 2,
    nextChangeSeq: 1,
  }
}

const NO_IMPACT_MESSAGE = 'No tasks are affected by this change.'

describe('ImpactMap - no-impact clarity (US3)', () => {
  it('shows the no-impact banner when the result is null', () => {
    render(<ImpactMap project={fixtureProject()} result={null} />)
    expect(screen.getByText(NO_IMPACT_MESSAGE)).toBeInTheDocument()
  })

  it('shows the no-impact banner when the result has zero affected tasks', () => {
    const emptyResult: ImpactResult = {
      changeId: 'change-1',
      affectedTasks: [],
      effortImpactDays: 0,
      scheduleImpactDays: 0,
      riskLevel: 'Low',
    }
    render(<ImpactMap project={fixtureProject()} result={emptyResult} />)
    expect(screen.getByText(NO_IMPACT_MESSAGE)).toBeInTheDocument()
  })

  it('does not show the no-impact banner when the result has affected tasks', () => {
    const result: ImpactResult = {
      changeId: 'change-1',
      affectedTasks: [
        { taskId: 'task-a', relation: 'direct', reason: 'Implements the changed requirement.' },
      ],
      effortImpactDays: 1,
      scheduleImpactDays: 1,
      riskLevel: 'Low',
    }
    render(<ImpactMap project={fixtureProject()} result={result} />)
    expect(screen.queryByText(NO_IMPACT_MESSAGE)).not.toBeInTheDocument()
  })
})
