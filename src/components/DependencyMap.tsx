import { Background, Controls, ReactFlow, ReactFlowProvider, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo, useState, type FormEvent } from 'react'
import { getDirectDependencies, getDirectDependents, wouldCreateCycle } from '../core/dependencyGraph'
import type { Project } from '../core/types'
import { GraphLegend } from './GraphLegend'
import { buildDependencyGraphElements, RELATION_INFO } from './graphLayout'
import { TaskNode } from './TaskNode'

const NODE_TYPES: NodeTypes = { task: TaskNode }

const LEGEND_ENTRIES = (['selected', 'dependency', 'dependent', 'unrelated'] as const).map(
  (relation) => ({ label: RELATION_INFO[relation].label, swatchClassName: RELATION_INFO[relation].swatchClassName }),
)

interface DependencyMapProps {
  project: Project
  error: string | null
  onAddDependency: (dependentTaskId: string, prerequisiteTaskId: string) => void
  onRemoveDependency: (dependentTaskId: string, prerequisiteTaskId: string) => void
}

export function DependencyMap({
  project,
  error,
  onAddDependency,
  onRemoveDependency,
}: DependencyMapProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [dependentTaskId, setDependentTaskId] = useState('')
  const [prerequisiteTaskId, setPrerequisiteTaskId] = useState('')

  const { nodes, edges } = useMemo(
    () => buildDependencyGraphElements(project, selectedTaskId),
    [project, selectedTaskId],
  )

  const selectedTask = project.tasks.find((task) => task.id === selectedTaskId) ?? null
  const dependencies = selectedTaskId ? getDirectDependencies(project, selectedTaskId) : []
  const dependents = selectedTaskId ? getDirectDependents(project, selectedTaskId) : []

  const validPrerequisiteOptions = project.tasks.filter(
    (task) => dependentTaskId !== '' && !wouldCreateCycle(project, dependentTaskId, task.id),
  )

  function handleCreateDependency(event: FormEvent) {
    event.preventDefault()
    if (dependentTaskId === '' || prerequisiteTaskId === '') {
      return
    }
    onAddDependency(dependentTaskId, prerequisiteTaskId)
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/60">
          <GraphLegend entries={LEGEND_ENTRIES} />
        </div>
        <div data-testid="dependency-map-graph" className="min-h-0 flex-1">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              nodesDraggable={false}
              onNodeClick={(_event, node) => setSelectedTaskId(node.id)}
              onPaneClick={() => setSelectedTaskId(null)}
              fitView
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      <aside
        aria-label="Selected task details"
        className="flex flex-col gap-4 overflow-y-auto rounded-md border border-slate-200 p-4 dark:border-slate-700"
      >
        <form onSubmit={handleCreateDependency} className="flex flex-col gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Add a dependency
          </h4>
          <label className="flex flex-col gap-1 text-sm">
            Dependent task
            <select
              value={dependentTaskId}
              onChange={(event) => {
                setDependentTaskId(event.target.value)
                setPrerequisiteTaskId('')
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Choose a task…</option>
              {project.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Depends on
            <select
              value={prerequisiteTaskId}
              onChange={(event) => setPrerequisiteTaskId(event.target.value)}
              disabled={dependentTaskId === ''}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Choose a task…</option>
              {validPrerequisiteOptions.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={dependentTaskId === '' || prerequisiteTaskId === ''}
            className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Add dependency
          </button>
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        </form>

        {selectedTask === null ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a task node to see its direct dependencies and dependents.
          </p>
        ) : (
          <>
            <h3 className="text-base font-semibold">{selectedTask.title}</h3>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Depends on ({dependencies.length})
              </h4>
              {dependencies.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No dependencies.</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {dependencies.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{task.title}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(selectedTask.id, task.id)}
                        className="text-xs text-slate-500 underline hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Depended on by ({dependents.length})
              </h4>
              {dependents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No dependents.</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {dependents.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{task.title}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(task.id, selectedTask.id)}
                        className="text-xs text-slate-500 underline hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
