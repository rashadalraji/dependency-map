import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createSeedProject } from '../core/seedData'
import { Workspace } from './Workspace'

describe('Workspace', () => {
  it('renders the seeded project name, a requirement, a task, and a progress figure', () => {
    const seed = createSeedProject()
    render(<Workspace />)

    expect(screen.getByRole('heading', { level: 1, name: seed.name })).toBeInTheDocument()
    expect(screen.getAllByText(seed.requirements[0].description).length).toBeGreaterThan(0)
    expect(screen.getAllByText(seed.tasks[0].title).length).toBeGreaterThan(0)
    expect(screen.getByText(/\d+% \(\d+ of \d+ tasks done\)/)).toBeInTheDocument()
  })

  it('always shows exactly one active view in the primary navigation', () => {
    render(<Workspace />)
    const nav = screen.getByRole('navigation', { name: 'Primary views' })
    const buttons = within(nav).getAllByRole('button')

    function activeButtons() {
      return buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')
    }

    expect(activeButtons()).toEqual([screen.getByRole('button', { name: 'Workspace' })])

    fireEvent.click(screen.getByRole('button', { name: 'Dependency Map' }))
    expect(activeButtons()).toEqual([screen.getByRole('button', { name: 'Dependency Map' })])

    fireEvent.click(screen.getByRole('button', { name: 'Requirement Impact' }))
    expect(activeButtons()).toEqual([screen.getByRole('button', { name: 'Requirement Impact' })])
  })
})
