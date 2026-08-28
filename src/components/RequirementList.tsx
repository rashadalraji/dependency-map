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
    <section className="panel" aria-label="Requirements">
      <h2>Requirements ({project.requirements.length})</h2>

      <form className="add-form" onSubmit={handleAdd}>
        <label>
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does the project need?"
          />
        </label>
        <label>
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as RequirementPriority)}
          >
            {REQUIREMENT_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Add requirement</button>
        {formError && <p className="form-error">{formError}</p>}
      </form>

      <ul className="entity-list">
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
      <li className="entity-row">
        <input value={description} onChange={(event) => setDescription(event.target.value)} />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as RequirementPriority)}
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
        >
          {REQUIREMENT_STATUSES.map((option) => (
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
        <strong>{requirement.description}</strong>
        <span className="badge">{requirement.priority}</span>
        <span className="badge">{requirement.status}</span>
      </div>
      <div className="entity-row__tasks">
        {linkedTasks.length === 0
          ? 'No tasks linked'
          : `Tasks: ${linkedTasks.map((task) => task.title).join(', ')}`}
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
