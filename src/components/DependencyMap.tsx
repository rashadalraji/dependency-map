import { Background, Controls, ReactFlow, ReactFlowProvider, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo, useState, type FormEvent } from 'react'
import { getDirectDependencies, getDirectDependents, wouldCreateCycle } from '../core/dependencyGraph'
import type { Project } from '../core/types'
import './DependencyMap.css'
import { buildDependencyGraphElements } from './graphLayout'
import { TaskNode } from './TaskNode'

const NODE_TYPES: NodeTypes = { task: TaskNode }

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
    <div className="dependency-map">
      <div className="dependency-map__graph">
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

      <aside className="dependency-map__panel" aria-label="Selected task details">
        <form className="dependency-map__create-form" onSubmit={handleCreateDependency}>
          <h4>Add a dependency</h4>
          <label>
            Dependent task
            <select
              value={dependentTaskId}
              onChange={(event) => {
                setDependentTaskId(event.target.value)
                setPrerequisiteTaskId('')
              }}
            >
              <option value="">Choose a task…</option>
              {project.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Depends on
            <select
              value={prerequisiteTaskId}
              onChange={(event) => setPrerequisiteTaskId(event.target.value)}
              disabled={dependentTaskId === ''}
            >
              <option value="">Choose a task…</option>
              {validPrerequisiteOptions.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={dependentTaskId === '' || prerequisiteTaskId === ''}>
            Add dependency
          </button>
          {error && <p className="dependency-map__error">{error}</p>}
        </form>

        {selectedTask === null ? (
          <p>Select a task node to see its direct dependencies and dependents.</p>
        ) : (
          <>
            <h3>{selectedTask.title}</h3>
            <div>
              <h4>Depends on ({dependencies.length})</h4>
              {dependencies.length === 0 ? (
                <p>No dependencies.</p>
              ) : (
                <ul>
                  {dependencies.map((task) => (
                    <li key={task.id}>
                      {task.title}{' '}
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(selectedTask.id, task.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4>Depended on by ({dependents.length})</h4>
              {dependents.length === 0 ? (
                <p>No dependents.</p>
              ) : (
                <ul>
                  {dependents.map((task) => (
                    <li key={task.id}>
                      {task.title}{' '}
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(task.id, selectedTask.id)}
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
