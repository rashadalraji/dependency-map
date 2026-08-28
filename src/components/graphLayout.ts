import dagre from '@dagrejs/dagre'
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import type { Project, TaskStatus } from '../core/types'

export type TaskNodeRelation = 'selected' | 'dependency' | 'dependent' | 'unrelated'

export interface TaskNodeData extends Record<string, unknown> {
  label: string
  status: TaskStatus
  relation: TaskNodeRelation
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 56

/**
 * Converts the task-dependency graph into React Flow nodes/edges with deterministic,
 * dagre-computed positions. An edge runs from its prerequisite task to its dependent task
 * (the direction work "flows" — prerequisite must complete before the dependent can proceed),
 * matching the convention used in typical project-dependency diagrams.
 */
export function buildDependencyGraphElements(
  project: Project,
  selectedTaskId: string | null,
): { nodes: Node<TaskNodeData>[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: 'LR', nodesep: 32, ranksep: 96 })
  graph.setDefaultEdgeLabel(() => ({}))

  for (const task of project.tasks) {
    graph.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const dependency of project.taskDependencies) {
    graph.setEdge(dependency.prerequisiteTaskId, dependency.dependentTaskId)
  }

  dagre.layout(graph)

  const dependencyIds = new Set(
    selectedTaskId === null
      ? []
      : project.taskDependencies
          .filter((dependency) => dependency.dependentTaskId === selectedTaskId)
          .map((dependency) => dependency.prerequisiteTaskId),
  )
  const dependentIds = new Set(
    selectedTaskId === null
      ? []
      : project.taskDependencies
          .filter((dependency) => dependency.prerequisiteTaskId === selectedTaskId)
          .map((dependency) => dependency.dependentTaskId),
  )

  function relationFor(taskId: string): TaskNodeRelation {
    if (taskId === selectedTaskId) return 'selected'
    if (dependencyIds.has(taskId)) return 'dependency'
    if (dependentIds.has(taskId)) return 'dependent'
    return 'unrelated'
  }

  const nodes: Node<TaskNodeData>[] = project.tasks.map((task) => {
    const position = graph.node(task.id)
    return {
      id: task.id,
      type: 'task',
      position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: task.title, status: task.status, relation: relationFor(task.id) },
    }
  })

  const edges: Edge[] = project.taskDependencies.map((dependency) => ({
    id: `${dependency.prerequisiteTaskId}->${dependency.dependentTaskId}`,
    source: dependency.prerequisiteTaskId,
    target: dependency.dependentTaskId,
    markerEnd: { type: MarkerType.ArrowClosed },
  }))

  return { nodes, edges }
}
