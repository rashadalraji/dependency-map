import { nextChangeId } from './ids'
import type { Project, RequirementChange, RequirementChangeType } from './types'

/**
 * Appends a RequirementChange snapshotting which tasks are currently associated with
 * `requirementId` in `project`. Callers that remove associations as part of their own effect
 * (e.g. removeRequirement) MUST call this against the pre-removal project state, so the snapshot
 * captures what is about to be deleted rather than the empty post-removal state.
 */
export function recordRequirementChange(
  project: Project,
  requirementId: string,
  changeType: RequirementChangeType,
  requirementDescriptionSnapshot: string,
): Project {
  const directlyAssociatedTaskIds = project.associations
    .filter((association) => association.requirementId === requirementId)
    .map((association) => association.taskId)

  const change: RequirementChange = {
    id: nextChangeId(project),
    requirementId,
    changeType,
    requirementDescriptionSnapshot,
    directlyAssociatedTaskIds,
  }

  return {
    ...project,
    requirementChanges: [...project.requirementChanges, change],
    nextChangeSeq: project.nextChangeSeq + 1,
  }
}
