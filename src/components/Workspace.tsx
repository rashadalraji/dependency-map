import { useMemo, useState } from 'react'
import { analyzeRequirementChange } from '../core/impactAnalysis'
import { useProjectStore } from '../state/useProjectStore'
import { ChangeHistory } from './ChangeHistory'
import { DependencyMap } from './DependencyMap'
import { ImpactMap } from './ImpactMap'
import { ImpactReport } from './ImpactReport'
import { ProjectHeader } from './ProjectHeader'
import { RequirementList } from './RequirementList'
import { TaskList } from './TaskList'

type WorkspaceView = 'workspace' | 'dependency-map' | 'requirement-impact'

const VIEWS: { id: WorkspaceView; label: string }[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'dependency-map', label: 'Dependency Map' },
  { id: 'requirement-impact', label: 'Requirement Impact' },
]

function navButtonClassName(isActive: boolean): string {
  const base = '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors'
  if (isActive) {
    return `${base} border-brand text-brand dark:border-brand-dark dark:text-brand-dark`
  }
  return `${base} border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100`
}

export function Workspace() {
  const store = useProjectStore()
  const [view, setView] = useState<WorkspaceView>('workspace')
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null)

  const selectedChange =
    store.project.requirementChanges.find((change) => change.id === selectedChangeId) ?? null

  const impactResult = useMemo(
    () => (selectedChange ? analyzeRequirementChange(store.project, selectedChange.id) : null),
    [store.project, selectedChange],
  )

  return (
    <div className="mx-auto w-full box-border p-6 text-left text-slate-800 dark:text-slate-100">
      <ProjectHeader project={store.project} />

      <nav aria-label="Primary views" className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={navButtonClassName(view === id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {view === 'workspace' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RequirementList
            project={store.project}
            onAdd={store.addRequirement}
            onEdit={store.editRequirement}
            onRemove={store.removeRequirement}
          />
          <TaskList
            project={store.project}
            onAdd={store.addTask}
            onEdit={store.editTask}
            onRemove={store.removeTask}
            onAssociate={store.associateTask}
            onUnassociate={store.unassociateTask}
          />
        </div>
      )}

      {view === 'dependency-map' && (
        <DependencyMap
          project={store.project}
          error={store.error}
          onAddDependency={store.addTaskDependency}
          onRemoveDependency={store.removeTaskDependency}
        />
      )}

      {view === 'requirement-impact' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChangeHistory
            project={store.project}
            selectedChangeId={selectedChangeId}
            onSelectChange={setSelectedChangeId}
          />
          <div className="flex flex-col gap-4">
            {selectedChange && impactResult ? (
              <>
                <ImpactReport project={store.project} change={selectedChange} result={impactResult} />
                <ImpactMap project={store.project} result={impactResult} />
              </>
            ) : (
              <p className="rounded-md border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Select a recorded change to analyze its impact.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
