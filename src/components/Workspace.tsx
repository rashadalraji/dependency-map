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
import './Workspace.css'

type WorkspaceView = 'workspace' | 'dependency-map' | 'requirement-impact'

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
    <div className="workspace">
      <ProjectHeader project={store.project} />

      <nav className="workspace__view-toggle">
        <button
          type="button"
          aria-pressed={view === 'workspace'}
          onClick={() => setView('workspace')}
        >
          Workspace
        </button>
        <button
          type="button"
          aria-pressed={view === 'dependency-map'}
          onClick={() => setView('dependency-map')}
        >
          Dependency Map
        </button>
        <button
          type="button"
          aria-pressed={view === 'requirement-impact'}
          onClick={() => setView('requirement-impact')}
        >
          Requirement Impact
        </button>
      </nav>

      {view === 'workspace' && (
        <div className="workspace__panels">
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
        <div className="workspace__panels">
          <ChangeHistory
            project={store.project}
            selectedChangeId={selectedChangeId}
            onSelectChange={setSelectedChangeId}
          />
          <div className="workspace__impact-column">
            {selectedChange && impactResult ? (
              <>
                <ImpactReport project={store.project} change={selectedChange} result={impactResult} />
                <ImpactMap project={store.project} result={impactResult} />
              </>
            ) : (
              <p>Select a recorded change to analyze its impact.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
