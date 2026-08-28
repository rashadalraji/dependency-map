import type { Project } from '../core/types'

interface ChangeHistoryProps {
  project: Project
  selectedChangeId: string | null
  onSelectChange: (changeId: string) => void
}

export function ChangeHistory({ project, selectedChangeId, onSelectChange }: ChangeHistoryProps) {
  return (
    <section className="panel" aria-label="Requirement change history">
      <h2>Requirement Change History ({project.requirementChanges.length})</h2>
      <ul className="entity-list">
        {project.requirementChanges.map((change) => (
          <li key={change.id} className="entity-row">
            <div className="entity-row__main">
              <strong>{change.requirementDescriptionSnapshot}</strong>
              <span className="badge">{change.changeType}</span>
            </div>
            <div className="entity-row__actions">
              <button
                type="button"
                aria-pressed={change.id === selectedChangeId}
                onClick={() => onSelectChange(change.id)}
              >
                Analyze
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
