import { useCallback, useState } from 'react'
import {
  addRequirement,
  editRequirement,
  removeRequirement,
  type AddRequirementInput,
  type EditRequirementChanges,
} from '../core/requirementOperations'
import { createSeedProject } from '../core/seedData'
import {
  addTask,
  associateTaskWithRequirement,
  editTask,
  removeTask,
  unassociateTaskFromRequirement,
  type AddTaskInput,
  type EditTaskChanges,
} from '../core/taskOperations'
import type { Project } from '../core/types'

export function useProjectStore() {
  const [project, setProject] = useState<Project>(() => createSeedProject())

  const addRequirementAction = useCallback(
    (input: AddRequirementInput) => setProject((current) => addRequirement(current, input)),
    [],
  )
  const editRequirementAction = useCallback(
    (requirementId: string, changes: EditRequirementChanges) =>
      setProject((current) => editRequirement(current, requirementId, changes)),
    [],
  )
  const removeRequirementAction = useCallback(
    (requirementId: string) =>
      setProject((current) => removeRequirement(current, requirementId)),
    [],
  )
  const addTaskAction = useCallback(
    (input: AddTaskInput) => setProject((current) => addTask(current, input)),
    [],
  )
  const editTaskAction = useCallback(
    (taskId: string, changes: EditTaskChanges) =>
      setProject((current) => editTask(current, taskId, changes)),
    [],
  )
  const removeTaskAction = useCallback(
    (taskId: string) => setProject((current) => removeTask(current, taskId)),
    [],
  )
  const associateTaskAction = useCallback(
    (taskId: string, requirementId: string) =>
      setProject((current) => associateTaskWithRequirement(current, taskId, requirementId)),
    [],
  )
  const unassociateTaskAction = useCallback(
    (taskId: string, requirementId: string) =>
      setProject((current) => unassociateTaskFromRequirement(current, taskId, requirementId)),
    [],
  )

  return {
    project,
    addRequirement: addRequirementAction,
    editRequirement: editRequirementAction,
    removeRequirement: removeRequirementAction,
    addTask: addTaskAction,
    editTask: editTaskAction,
    removeTask: removeTaskAction,
    associateTask: associateTaskAction,
    unassociateTask: unassociateTaskAction,
  }
}
