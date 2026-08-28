import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Project } from '../core/types'
import { RequirementList } from './RequirementList'

function fixtureProject(requirements: Project['requirements'] = []): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements,
    tasks: [],
    associations: [],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: requirements.length + 1,
    nextTaskSeq: 1,
    nextChangeSeq: 1,
  }
}

describe('RequirementList', () => {
  it('shows an empty-state message when there are no requirements', () => {
    render(
      <RequirementList project={fixtureProject()} onAdd={vi.fn()} onEdit={vi.fn()} onRemove={vi.fn()} />,
    )

    expect(screen.getByText('No requirements yet.')).toBeInTheDocument()
  })

  it('does not show the empty-state message when requirements exist', () => {
    const project = fixtureProject([
      { id: 'req-1', description: 'Req One', priority: 'High', status: 'Approved' },
    ])
    render(<RequirementList project={project} onAdd={vi.fn()} onEdit={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.queryByText('No requirements yet.')).not.toBeInTheDocument()
    expect(screen.getByText('Req One')).toBeInTheDocument()
  })
})
