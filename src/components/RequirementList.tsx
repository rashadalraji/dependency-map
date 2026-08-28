import { useState, type FormEvent } from 'react'
import type { AddRequirementInput, EditRequirementChanges } from '../core/requirementOperations'
import { getTasksForRequirement } from '../core/selectors'
import {
  REQUIREMENT_PRIORITIES,
  REQUIREMENT_STATUSES,
  type Project,
  type Requirement,
  type RequirementPriority,
  type RequirementStatus,
} from '../core/types'

const PRIORITY_BADGE_CLASS: Record<RequirementPriority, string> = {
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const STATUS_BADGE_CLASS: Record<RequirementStatus, string> = {
  Proposed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Approved: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  Done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const inputClassName =
  'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800'
const primaryButtonClassName = 'rounded bg-brand px-3 py-1.5 text-sm font-medium text-white'
const secondaryButtonClassName =
  'rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'

interface RequirementListProps {
  project: Project
  onAdd: (input: AddRequirementInput) => void
  onEdit: (requirementId: string, changes: EditRequirementChanges) => void
  onRemove: (requirementId: string) => void
}

export function RequirementList({ project, onAdd, onEdit, onRemove }: RequirementListProps) {
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<RequirementPriority>('Medium')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (description.trim() === '') {
      setFormError('Description is required.')
      return
    }
    onAdd({ description, priority })
    setDescription('')
    setPriority('Medium')
    setFormError(null)
  }

  return (
    <section aria-label="Requirements" className="rounded-md border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="text-lg font-semibold">Requirements ({project.requirements.length})</h2>

      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-end gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
        <label className="flex flex-col gap-1 text-sm">
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does the project need?"
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as RequirementPriority)}
            className={inputClassName}
          >
            {REQUIREMENT_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryButtonClassName}>
          Add requirement
        </button>
        {formError && <p className="w-full text-sm text-rose-600 dark:text-rose-400">{formError}</p>}
      </form>

      {project.requirements.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No requirements yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {project.requirements.map((requirement) => (
            <RequirementRow
              key={requirement.id}
              project={project}
              requirement={requirement}
              isEditing={editingId === requirement.id}
              onStartEdit={() => setEditingId(requirement.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={(changes) => {
                onEdit(requirement.id, changes)
                setEditingId(null)
              }}
              onRemove={() => onRemove(requirement.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

interface RequirementRowProps {
  project: Project
  requirement: Requirement
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (changes: EditRequirementChanges) => void
  onRemove: () => void
}

function RequirementRow({
  project,
  requirement,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
}: RequirementRowProps) {
  const [description, setDescription] = useState(requirement.description)
  const [priority, setPriority] = useState<RequirementPriority>(requirement.priority)
  const [status, setStatus] = useState<RequirementStatus>(requirement.status)
  const [error, setError] = useState<string | null>(null)
  const linkedTasks = getTasksForRequirement(project, requirement.id)

  function handleSave() {
    if (description.trim() === '') {
      setError('Description is required.')
      return
    }
    onSaveEdit({ description, priority, status })
    setError(null)
  }

  if (isEditing) {
    return (
      <li className="flex flex-wrap items-center gap-2 rounded border border-slate-200 p-2 dark:border-slate-700">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClassName}
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as RequirementPriority)}
          className={inputClassName}
        >
          {REQUIREMENT_PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as RequirementStatus)}
          className={inputClassName}
        >
          {REQUIREMENT_STATUSES.map((option) => (
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
        <strong className="text-sm">{requirement.description}</strong>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE_CLASS[requirement.priority]}`}>
          {requirement.priority}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[requirement.status]}`}>
          {requirement.status}
        </span>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {linkedTasks.length === 0
          ? 'No tasks linked'
          : `Tasks: ${linkedTasks.map((task) => task.title).join(', ')}`}
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
