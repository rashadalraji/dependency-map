import { useState } from 'react'
import { useProjectStore } from '../state/useProjectStore'
import { DependencyMap } from './DependencyMap'
import { ProjectHeader } from './ProjectHeader'
import { RequirementList } from './RequirementList'
import { TaskList } from './TaskList'
import './Workspace.css'

type WorkspaceView = 'workspace' | 'dependency-map'

export function Workspace() {
  const store = useProjectStore()
  const [view, setView] = useState<WorkspaceView>('workspace')

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
      </nav>

      {view === 'workspace' ? (
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
      ) : (
        <DependencyMap
          project={store.project}
          error={store.error}
          onAddDependency={store.addTaskDependency}
          onRemoveDependency={store.removeTaskDependency}
        />
      )}
    </div>
  )
}
