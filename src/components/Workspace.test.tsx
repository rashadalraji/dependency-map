import { render, screen } from '@testing-library/react'
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
})
