import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { addTaskDependency, removeTaskDependency } from '../core/taskDependencyOperations'
import type { Project } from '../core/types'
import { DependencyMap } from './DependencyMap'

function fixtureProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: [
      { id: 'task-a', title: 'Task A', estimatedEffortDays: 1, status: 'Done' },
      { id: 'task-b', title: 'Task B', estimatedEffortDays: 1, status: 'InProgress' },
      { id: 'task-c', title: 'Task C (unconnected)', estimatedEffortDays: 1, status: 'NotStarted' },
    ],
    associations: [],
    // Task B depends on Task A
    taskDependencies: [{ dependentTaskId: 'task-b', prerequisiteTaskId: 'task-a' }],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 4,
    nextChangeSeq: 1,
  }
}

/** Mirrors useProjectStore's synchronous-catch pattern, scoped to a test-controlled project. */
function Harness({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState(initialProject)
  const [error, setError] = useState<string | null>(null)

  function handleAdd(dependentTaskId: string, prerequisiteTaskId: string) {
    try {
      setProject(addTaskDependency(project, dependentTaskId, prerequisiteTaskId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add dependency')
    }
  }

  function handleRemove(dependentTaskId: string, prerequisiteTaskId: string) {
    setProject(removeTaskDependency(project, dependentTaskId, prerequisiteTaskId))
  }

  return (
    <DependencyMap
      project={project}
      error={error}
      onAddDependency={handleAdd}
      onRemoveDependency={handleRemove}
    />
  )
}

/** Task titles also appear as <option> text in the create-dependency form, so node clicks and
 * assertions about the graph must be scoped to the graph pane specifically. */
function getGraph(container: HTMLElement): HTMLElement {
  const graph = container.querySelector('.dependency-map__graph')
  if (!graph) throw new Error('Dependency map graph pane not found')
  return graph as HTMLElement
}

describe('DependencyMap - viewing (US1)', () => {
  it('renders every task as a node, including an unconnected one', () => {
    const { container } = render(
      <DependencyMap
        project={fixtureProject()}
        error={null}
        onAddDependency={vi.fn()}
        onRemoveDependency={vi.fn()}
      />,
    )
    const graph = within(getGraph(container))

    expect(graph.getByText('Task A')).toBeInTheDocument()
    expect(graph.getByText('Task B')).toBeInTheDocument()
    expect(graph.getByText('Task C (unconnected)')).toBeInTheDocument()
  })

  it('shows the correct direct dependencies and dependents when a task is selected', () => {
    const { container } = render(
      <DependencyMap
        project={fixtureProject()}
        error={null}
        onAddDependency={vi.fn()}
        onRemoveDependency={vi.fn()}
      />,
    )

    fireEvent.click(within(getGraph(container)).getByText('Task B'))

    expect(screen.getByRole('heading', { level: 3, name: 'Task B' })).toBeInTheDocument()
    expect(screen.getByText('Depends on (1)')).toBeInTheDocument()
    expect(screen.getByText('Depended on by (0)')).toBeInTheDocument()
  })
})

describe('DependencyMap - creating a dependency (US2)', () => {
  it('excludes the selected dependent task itself and any cycle-forming task from the prerequisite options', () => {
    render(
      <DependencyMap
        project={fixtureProject()}
        error={null}
        onAddDependency={vi.fn()}
        onRemoveDependency={vi.fn()}
      />,
    )

    // Task B already depends on Task A, so choosing Task A as the dependent task means
    // Task B (which would close the loop) and Task A itself (self-dependency) must both
    // be excluded from the "Depends on" options.
    fireEvent.change(screen.getByLabelText('Dependent task'), { target: { value: 'task-a' } })

    const prerequisiteSelect = screen.getByLabelText('Depends on')
    expect(within(prerequisiteSelect).queryByRole('option', { name: 'Task A' })).toBeNull()
    expect(within(prerequisiteSelect).queryByRole('option', { name: 'Task B' })).toBeNull()
    expect(
      within(prerequisiteSelect).getByRole('option', { name: 'Task C (unconnected)' }),
    ).toBeInTheDocument()
  })

  it('displays an error message when one is passed in (e.g. a rejected attempt)', () => {
    render(
      <DependencyMap
        project={fixtureProject()}
        error="This dependency would create a circular chain of dependencies"
        onAddDependency={vi.fn()}
        onRemoveDependency={vi.fn()}
      />,
    )

    expect(
      screen.getByText('This dependency would create a circular chain of dependencies'),
    ).toBeInTheDocument()
  })

  it('creates a valid dependency and updates the detail panel immediately', () => {
    const { container } = render(<Harness initialProject={fixtureProject()} />)

    fireEvent.change(screen.getByLabelText('Dependent task'), { target: { value: 'task-c' } })
    fireEvent.change(screen.getByLabelText('Depends on'), { target: { value: 'task-a' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add dependency' }))

    fireEvent.click(within(getGraph(container)).getByText('Task C (unconnected)'))
    expect(screen.getByText('Depends on (1)')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Task C (unconnected)' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Task A').length).toBeGreaterThan(0)
  })
})

describe('DependencyMap - removing a dependency (US3)', () => {
  it('removes an existing dependency and updates the panel immediately', () => {
    const { container } = render(<Harness initialProject={fixtureProject()} />)

    fireEvent.click(within(getGraph(container)).getByText('Task B'))
    expect(screen.getByText('Depends on (1)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.getByText('Depends on (0)')).toBeInTheDocument()
    expect(screen.getByText('No dependencies.')).toBeInTheDocument()
  })
})
