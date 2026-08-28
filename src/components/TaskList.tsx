import { useState, type FormEvent } from 'react'
import { getRequirementsForTask } from '../core/selectors'
import type { AddTaskInput, EditTaskChanges } from '../core/taskOperations'
import { TASK_STATUSES, type Project, type Task, type TaskStatus } from '../core/types'

const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  NotStarted: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  InProgress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const inputClassName =
  'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800'
const primaryButtonClassName = 'rounded bg-brand px-3 py-1.5 text-sm font-medium text-white'
const secondaryButtonClassName =
  'rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
const linkButtonClassName = 'text-xs text-slate-500 underline hover:text-brand dark:text-slate-400'

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
    <section aria-label="Tasks" className="rounded-md border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="text-lg font-semibold">Tasks ({project.tasks.length})</h2>

      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-end gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What work needs to happen?"
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Estimated effort (days)
          <input
            type="number"
            min="0"
            step="0.5"
            value={estimatedEffortDays}
            onChange={(event) => setEstimatedEffortDays(event.target.value)}
            className={`${inputClassName} w-24`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className={inputClassName}
          >
            {TASK_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryButtonClassName}>
          Create task
        </button>
        {formError && <p className="w-full text-sm text-rose-600 dark:text-rose-400">{formError}</p>}
      </form>

      {project.tasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
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
      )}
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
      <li className="flex flex-wrap items-center gap-2 rounded border border-slate-200 p-2 dark:border-slate-700">
        <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} />
        <input
          type="number"
          min="0"
          step="0.5"
          value={estimatedEffortDays}
          onChange={(event) => setEstimatedEffortDays(event.target.value)}
          className={`${inputClassName} w-24`}
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className={inputClassName}
        >
          {TASK_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleSave} className={primaryButtonClassName}>
          Save
        </button>
        <button type="button" onClick={onCancelEdit} className={secondaryButtonClassName}>
          Cancel
        </button>
        {error && <p className="w-full text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-1 rounded border border-slate-200 p-2 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm">{task.title}</strong>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {task.estimatedEffortDays}d
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[task.status]}`}>
          {task.status}
        </span>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {linkedRequirements.length === 0 ? (
          'Not linked to any requirement'
        ) : (
          <ul className="flex flex-col gap-0.5">
            {linkedRequirements.map((requirement) => (
              <li key={requirement.id} className="flex items-center gap-2">
                <span>{requirement.description}</span>
                <button type="button" onClick={() => onUnassociate(requirement.id)} className={linkButtonClassName}>
                  Unlink
                </button>
              </li>
            ))}
          </ul>
        )}
        {linkableRequirements.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <select
              value={linkTarget}
              onChange={(event) => setLinkTarget(event.target.value)}
              className={inputClassName}
            >
              <option value="">Link to requirement…</option>
              {linkableRequirements.map((requirement) => (
                <option key={requirement.id} value={requirement.id}>
                  {requirement.description}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleLink} className={secondaryButtonClassName}>
              Link
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onStartEdit} className={secondaryButtonClassName}>
          Edit
        </button>
        <button type="button" onClick={onRemove} className={secondaryButtonClassName}>
          Remove
        </button>
      </div>
    </li>
  )
}
