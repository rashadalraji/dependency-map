import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GraphLegend } from './GraphLegend'

describe('GraphLegend', () => {
  it('renders a label for every entry passed in', () => {
    render(
      <GraphLegend
        entries={[
          { swatchClassName: 'bg-rose-600', label: 'Directly affected' },
          { swatchClassName: 'bg-orange-500', label: 'Indirectly affected' },
        ]}
      />,
    )

    expect(screen.getByText('Directly affected')).toBeInTheDocument()
    expect(screen.getByText('Indirectly affected')).toBeInTheDocument()
  })
})
