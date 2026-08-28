import { nextRequirementId } from './ids'
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

  return {
    ...project,
    requirements: [...project.requirements, requirement],
    nextRequirementSeq: project.nextRequirementSeq + 1,
  }
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
  return {
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

      return {
        ...requirement,
        description,
        priority: changes.priority ?? requirement.priority,
        status: changes.status ?? requirement.status,
      }
    }),
  }
}

export function removeRequirement(project: Project, requirementId: string): Project {
  return {
    ...project,
    requirements: project.requirements.filter((requirement) => requirement.id !== requirementId),
    associations: project.associations.filter(
      (association) => association.requirementId !== requirementId,
    ),
  }
}
