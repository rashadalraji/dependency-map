import { useCallback, useState } from 'react'
import {
  addRequirement,
  editRequirement,
  removeRequirement,
  type AddRequirementInput,
  type EditRequirementChanges,
} from '../core/requirementOperations'
import { createSeedProject } from '../core/seedData'
import { addTaskDependency, removeTaskDependency } from '../core/taskDependencyOperations'
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

/**
 * React's functional setState updater isn't guaranteed to run synchronously inside the
 * setState() call, so a try/catch wrapped around `setProject(current => op(current))` cannot
 * reliably catch an error `op` throws — it can surface later as an uncaught render-phase error
 * instead. Operations that can reject their input (empty description/title, self-dependency,
 * circular dependency) are applied directly against the latest `project` value here, inside a
 * synchronous try/catch, so validation failures are always caught and reported via `error`.
 */
export function useProjectStore() {
  const [project, setProject] = useState<Project>(() => createSeedProject())
  const [error, setError] = useState<string | null>(null)

  const applyValidated = useCallback(
    (operation: (current: Project) => Project) => {
      try {
        const updated = operation(project)
        setProject(updated)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'That action could not be completed.')
      }
    },
    [project],
  )

  const addRequirementAction = useCallback(
    (input: AddRequirementInput) => applyValidated((current) => addRequirement(current, input)),
    [applyValidated],
  )
  const editRequirementAction = useCallback(
    (requirementId: string, changes: EditRequirementChanges) =>
      applyValidated((current) => editRequirement(current, requirementId, changes)),
    [applyValidated],
  )
  const removeRequirementAction = useCallback(
    (requirementId: string) =>
      setProject((current) => removeRequirement(current, requirementId)),
    [],
  )
  const addTaskAction = useCallback(
    (input: AddTaskInput) => applyValidated((current) => addTask(current, input)),
    [applyValidated],
  )
  const editTaskAction = useCallback(
    (taskId: string, changes: EditTaskChanges) =>
      applyValidated((current) => editTask(current, taskId, changes)),
    [applyValidated],
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
  const addTaskDependencyAction = useCallback(
    (dependentTaskId: string, prerequisiteTaskId: string) =>
      applyValidated((current) => addTaskDependency(current, dependentTaskId, prerequisiteTaskId)),
    [applyValidated],
  )
  const removeTaskDependencyAction = useCallback(
    (dependentTaskId: string, prerequisiteTaskId: string) =>
      setProject((current) => removeTaskDependency(current, dependentTaskId, prerequisiteTaskId)),
    [],
  )

  return {
    project,
    error,
    addRequirement: addRequirementAction,
    editRequirement: editRequirementAction,
    removeRequirement: removeRequirementAction,
    addTask: addTaskAction,
    editTask: editTaskAction,
    removeTask: removeTaskAction,
    associateTask: associateTaskAction,
    unassociateTask: unassociateTaskAction,
    addTaskDependency: addTaskDependencyAction,
    removeTaskDependency: removeTaskDependencyAction,
  }
}
