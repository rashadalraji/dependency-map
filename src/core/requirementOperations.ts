import { nextRequirementId } from './ids'
import { recordRequirementChange } from './requirementChangeLog'
import type { Project, Requirement, RequirementPriority, RequirementStatus } from './types'

export interface AddRequirementInput {
  description: string
  priority: RequirementPriority
}

export function addRequirement(project: Project, input: AddRequirementInput): Project {
  const description = input.description.trim()
  if (description === '') {
    throw new Error('Requirement description must not be empty')
  }

  const requirement: Requirement = {
    id: nextRequirementId(project),
    description,
    priority: input.priority,
    status: 'Proposed',
  }

  const updated: Project = {
    ...project,
    requirements: [...project.requirements, requirement],
    nextRequirementSeq: project.nextRequirementSeq + 1,
  }

  return recordRequirementChange(updated, requirement.id, 'Added', requirement.description)
}

export interface EditRequirementChanges {
  description?: string
  priority?: RequirementPriority
  status?: RequirementStatus
}

export function editRequirement(
  project: Project,
  requirementId: string,
  changes: EditRequirementChanges,
): Project {
  let updatedDescription: string | undefined

  const updated: Project = {
    ...project,
    requirements: project.requirements.map((requirement) => {
      if (requirement.id !== requirementId) {
        return requirement
      }

      const description =
        changes.description !== undefined ? changes.description.trim() : requirement.description
      if (description === '') {
        throw new Error('Requirement description must not be empty')
      }
      updatedDescription = description

      return {
        ...requirement,
        description,
        priority: changes.priority ?? requirement.priority,
        status: changes.status ?? requirement.status,
      }
    }),
  }

  if (updatedDescription === undefined) {
    return updated
  }

  return recordRequirementChange(updated, requirementId, 'Modified', updatedDescription)
}

export function removeRequirement(project: Project, requirementId: string): Project {
  const requirement = project.requirements.find((candidate) => candidate.id === requirementId)
  if (requirement === undefined) {
    return project
  }

  // Snapshot associations from the pre-removal state, before they are deleted below.
  const withChangeRecorded = recordRequirementChange(
    project,
    requirementId,
    'Removed',
    requirement.description,
  )

  return {
    ...withChangeRecorded,
    requirements: withChangeRecorded.requirements.filter(
      (candidate) => candidate.id !== requirementId,
    ),
    associations: withChangeRecorded.associations.filter(
      (association) => association.requirementId !== requirementId,
    ),
  }
}
