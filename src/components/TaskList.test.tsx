import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Project } from '../core/types'
import { TaskList } from './TaskList'

function fixtureProject(tasks: Project['tasks'] = []): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks,
    associations: [],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: tasks.length + 1,
    nextChangeSeq: 1,
  }
}

describe('TaskList', () => {
  it('shows an empty-state message when there are no tasks', () => {
    render(
      <TaskList
        project={fixtureProject()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onAssociate={vi.fn()}
        onUnassociate={vi.fn()}
      />,
    )

    expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
  })

  it('does not show the empty-state message when tasks exist', () => {
    const project = fixtureProject([
      { id: 'task-1', title: 'Task One', estimatedEffortDays: 2, status: 'NotStarted' },
    ])
    render(
      <TaskList
        project={project}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onAssociate={vi.fn()}
        onUnassociate={vi.fn()}
      />,
    )

    expect(screen.queryByText('No tasks yet.')).not.toBeInTheDocument()
    expect(screen.getByText('Task One')).toBeInTheDocument()
  })
})
