import { useState, type FormEvent } from 'react'
import { getRequirementsForTask } from '../core/selectors'
import type { AddTaskInput, EditTaskChanges } from '../core/taskOperations'
import { TASK_STATUSES, type Project, type Task, type TaskStatus } from '../core/types'

interface TaskListProps {
  project: Project
  onAdd: (input: AddTaskInput) => void
  onEdit: (taskId: string, changes: EditTaskChanges) => void
  onRemove: (taskId: string) => void
  onAssociate: (taskId: string, requirementId: string) => void
  onUnassociate: (taskId: string, requirementId: string) => void
}

export function TaskList({
  project,
  onAdd,
  onEdit,
  onRemove,
  onAssociate,
  onUnassociate,
}: TaskListProps) {
  const [title, setTitle] = useState('')
  const [estimatedEffortDays, setEstimatedEffortDays] = useState('1')
  const [status, setStatus] = useState<TaskStatus>('NotStarted')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const effort = Number(estimatedEffortDays)
    if (title.trim() === '') {
      setFormError('Title is required.')
      return
    }
    if (!(effort > 0)) {
      setFormError('Estimated effort must be a positive number.')
      return
    }
    onAdd({ title, estimatedEffortDays: effort, status })
    setTitle('')
    setEstimatedEffortDays('1')
    setStatus('NotStarted')
    setFormError(null)
  }

  return (
    <section className="panel" aria-label="Tasks">
      <h2>Tasks ({project.tasks.length})</h2>

      <form className="add-form" onSubmit={handleAdd}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What work needs to happen?"
          />
        </label>
        <label>
          Estimated effort (days)
          <input
            type="number"
            min="0"
            step="0.5"
            value={estimatedEffortDays}
            onChange={(event) => setEstimatedEffortDays(event.target.value)}
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {TASK_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create task</button>
        {formError && <p className="form-error">{formError}</p>}
      </form>

      <ul className="entity-list">
        {project.tasks.map((task) => (
          <TaskRow
            key={task.id}
            project={project}
            task={task}
            isEditing={editingId === task.id}
            onStartEdit={() => setEditingId(task.id)}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={(changes) => {
              onEdit(task.id, changes)
              setEditingId(null)
            }}
            onRemove={() => onRemove(task.id)}
            onAssociate={(requirementId) => onAssociate(task.id, requirementId)}
            onUnassociate={(requirementId) => onUnassociate(task.id, requirementId)}
          />
        ))}
      </ul>
    </section>
  )
}

interface TaskRowProps {
  project: Project
  task: Task
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (changes: EditTaskChanges) => void
  onRemove: () => void
  onAssociate: (requirementId: string) => void
  onUnassociate: (requirementId: string) => void
}

function TaskRow({
  project,
  task,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
  onAssociate,
  onUnassociate,
}: TaskRowProps) {
  const [title, setTitle] = useState(task.title)
  const [estimatedEffortDays, setEstimatedEffortDays] = useState(String(task.estimatedEffortDays))
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [error, setError] = useState<string | null>(null)
  const [linkTarget, setLinkTarget] = useState('')

  const linkedRequirements = getRequirementsForTask(project, task.id)
  const linkableRequirements = project.requirements.filter(
    (requirement) => !linkedRequirements.some((linked) => linked.id === requirement.id),
  )

  function handleSave() {
    const effort = Number(estimatedEffortDays)
    if (title.trim() === '') {
      setError('Title is required.')
      return
    }
    if (!(effort > 0)) {
      setError('Estimated effort must be a positive number.')
      return
    }
    onSaveEdit({ title, estimatedEffortDays: effort, status })
    setError(null)
  }

  function handleLink() {
    if (linkTarget === '') return
    onAssociate(linkTarget)
    setLinkTarget('')
  }

  if (isEditing) {
    return (
      <li className="entity-row">
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
        <input
          type="number"
          min="0"
          step="0.5"
          value={estimatedEffortDays}
          onChange={(event) => setEstimatedEffortDays(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
          {TASK_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleSave}>
          Save
        </button>
        <button type="button" onClick={onCancelEdit}>
          Cancel
        </button>
        {error && <p className="form-error">{error}</p>}
      </li>
    )
  }

  return (
    <li className="entity-row">
      <div className="entity-row__main">
        <strong>{task.title}</strong>
        <span className="badge">{task.estimatedEffortDays}d</span>
        <span className="badge">{task.status}</span>
      </div>
      <div className="entity-row__requirements">
        {linkedRequirements.length === 0 ? (
          'Not linked to any requirement'
        ) : (
          <ul className="linked-requirements">
            {linkedRequirements.map((requirement) => (
              <li key={requirement.id}>
                {requirement.description}{' '}
                <button type="button" onClick={() => onUnassociate(requirement.id)}>
                  Unlink
                </button>
              </li>
            ))}
          </ul>
        )}
        {linkableRequirements.length > 0 && (
          <div className="link-form">
            <select value={linkTarget} onChange={(event) => setLinkTarget(event.target.value)}>
              <option value="">Link to requirement…</option>
              {linkableRequirements.map((requirement) => (
                <option key={requirement.id} value={requirement.id}>
                  {requirement.description}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleLink}>
              Link
            </button>
          </div>
        )}
      </div>
      <div className="entity-row__actions">
        <button type="button" onClick={onStartEdit}>
          Edit
        </button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </li>
  )
}
