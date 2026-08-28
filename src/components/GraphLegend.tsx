interface GraphLegendEntry {
  swatchClassName: string
  label: string
}

interface GraphLegendProps {
  entries: GraphLegendEntry[]
}

export function GraphLegend({ entries }: GraphLegendProps) {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
      {entries.map((entry) => (
        <li key={entry.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-full ${entry.swatchClassName}`} />
          {entry.label}
        </li>
      ))}
    </ul>
  )
}
