import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Project } from '../core/types'
import { ChangeHistory } from './ChangeHistory'
import { Workspace } from './Workspace'

function emptyProject(): Project {
  return {
    name: 'Test Project',
    targetDeadline: '2026-01-01',
    estimatedEffortDays: 10,
    requirements: [],
    tasks: [],
    associations: [],
    taskDependencies: [],
    requirementChanges: [],
    nextRequirementSeq: 1,
    nextTaskSeq: 1,
    nextChangeSeq: 1,
  }
}

function switchToView(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

const NAME = 'Test Requirement For History'

// The requirement's description also appears as plain <option> text in TaskList's "link to
// requirement" dropdowns, so lookups must be scoped to the <strong> that names the row itself.
function findByStrong(name: string) {
  return screen.getByText(name, { selector: 'strong' })
}
function findAllByStrong(name: string) {
  return screen.getAllByText(name, { selector: 'strong' })
}

describe('ChangeHistory (US3)', () => {
  it('logs Added, Modified, and Removed changes as requirements are managed, and keeps a removed one selectable', () => {
    render(<Workspace />)

    // Add a new requirement via the existing Workspace requirement controls.
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: NAME } })
    fireEvent.click(screen.getByRole('button', { name: 'Add requirement' }))

    switchToView('Requirement Impact')
    let historyRow = findByStrong(NAME).closest('li')!
    expect(within(historyRow).getByText('Added')).toBeInTheDocument()

    // Modify it.
    switchToView('Workspace')
    const requirementRow = findByStrong(NAME).closest('li')!
    fireEvent.click(within(requirementRow).getByRole('button', { name: 'Edit' }))
    const statusSelect = within(requirementRow).getAllByRole('combobox')[1]
    fireEvent.change(statusSelect, { target: { value: 'Approved' } })
    fireEvent.click(within(requirementRow).getByRole('button', { name: 'Save' }))

    switchToView('Requirement Impact')
    expect(findAllByStrong(NAME).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Modified').length).toBeGreaterThan(0)

    // Remove it.
    switchToView('Workspace')
    const rowToRemove = findByStrong(NAME).closest('li')!
    fireEvent.click(within(rowToRemove).getByRole('button', { name: 'Remove' }))
    expect(screen.queryByText(NAME, { selector: 'strong' })).not.toBeInTheDocument()

    // The Removed entry remains visible and selectable in the change history, even though the
    // requirement itself no longer appears in the live Workspace view.
    switchToView('Requirement Impact')
    const removedRows = findAllByStrong(NAME)
    expect(removedRows.length).toBeGreaterThanOrEqual(3)

    historyRow = removedRows[removedRows.length - 1].closest('li')!
    expect(within(historyRow).getByText('Removed')).toBeInTheDocument()
    const analyzeButton = within(historyRow).getByRole('button', { name: 'Analyze' })
    fireEvent.click(analyzeButton)
    expect(analyzeButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows an empty-state message when no changes have been recorded', () => {
    render(<ChangeHistory project={emptyProject()} selectedChangeId={null} onSelectChange={vi.fn()} />)
    expect(screen.getByText('No requirement changes recorded yet.')).toBeInTheDocument()
  })
})
