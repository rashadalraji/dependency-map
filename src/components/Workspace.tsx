import { useProjectStore } from '../state/useProjectStore'
import { ProjectHeader } from './ProjectHeader'
import { RequirementList } from './RequirementList'
import { TaskList } from './TaskList'
import './Workspace.css'

export function Workspace() {
  const store = useProjectStore()

  return (
    <div className="workspace">
      <ProjectHeader project={store.project} />
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
    </div>
  )
}
