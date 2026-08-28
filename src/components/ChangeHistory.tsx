import type { Project, RequirementChangeType } from '../core/types'

const CHANGE_TYPE_BADGE_CLASS: Record<RequirementChangeType, string> = {
  Added: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Modified: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  Removed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

interface ChangeHistoryProps {
  project: Project
  selectedChangeId: string | null
  onSelectChange: (changeId: string) => void
}

export function ChangeHistory({ project, selectedChangeId, onSelectChange }: ChangeHistoryProps) {
  return (
    <section aria-label="Requirement change history" className="rounded-md border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="text-lg font-semibold">Requirement Change History ({project.requirementChanges.length})</h2>

      {project.requirementChanges.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No requirement changes recorded yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {project.requirementChanges.map((change) => {
            const isSelected = change.id === selectedChangeId
            return (
              <li
                key={change.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded border p-2 ${
                  isSelected
                    ? 'border-brand bg-brand/5 dark:border-brand-dark'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{change.requirementDescriptionSnapshot}</strong>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${CHANGE_TYPE_BADGE_CLASS[change.changeType]}`}>
                    {change.changeType}
                  </span>
                </div>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectChange(change.id)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Analyze
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
