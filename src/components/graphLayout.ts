import dagre from '@dagrejs/dagre'
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import type { ImpactResult, Project, TaskStatus } from '../core/types'

export type TaskNodeRelation =
  | 'selected'
  | 'dependency'
  | 'dependent'
  | 'unrelated'
  | 'direct'
  | 'indirect'
  | 'unaffected'

export interface TaskNodeData extends Record<string, unknown> {
  label: string
  status: TaskStatus
  relation: TaskNodeRelation
}

/** Single source of truth for what each relation means and how it's colored, shared by
 * `TaskNode` (the graph node itself) and `GraphLegend` (the key explaining it) — see
 * research.md #2 (004-visual-design-polish) and spec FR-003. */
export const RELATION_INFO: Record<TaskNodeRelation, { label: string; swatchClassName: string }> = {
  selected: { label: 'Selected', swatchClassName: 'bg-brand' },
  dependency: { label: 'Depends on selected', swatchClassName: 'bg-sky-500' },
  dependent: { label: 'Depends on it', swatchClassName: 'bg-pink-500' },
  unrelated: { label: 'Unrelated', swatchClassName: 'bg-slate-400' },
  direct: { label: 'Directly affected', swatchClassName: 'bg-rose-600' },
  indirect: { label: 'Indirectly affected', swatchClassName: 'bg-orange-500' },
  unaffected: { label: 'Unaffected', swatchClassName: 'bg-slate-400' },
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 56

interface TaskGraphLayout {
  positions: Map<string, { x: number; y: number }>
  edges: Edge[]
}

/**
 * The dagre-computed positions and dependency edges shared by every graph view over the task
 * dependency graph (research.md #4, 003-requirement-impact-analysis) — deterministic for a given
 * project, and independent of what each view highlights. An edge runs from its prerequisite task
 * to its dependent task (the direction work "flows"), matching typical dependency diagrams.
 */
function computeTaskGraphLayout(project: Project): TaskGraphLayout {
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

  const positions = new Map(
    project.tasks.map((task) => {
      const position = graph.node(task.id)
      return [task.id, { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 }] as const
    }),
  )

  const edges: Edge[] = project.taskDependencies.map((dependency) => ({
    id: `${dependency.prerequisiteTaskId}->${dependency.dependentTaskId}`,
    source: dependency.prerequisiteTaskId,
    target: dependency.dependentTaskId,
    markerEnd: { type: MarkerType.ArrowClosed },
  }))

  return { positions, edges }
}

function nodesFromLayout(
  project: Project,
  layout: TaskGraphLayout,
  relationFor: (taskId: string) => TaskNodeRelation,
): Node<TaskNodeData>[] {
  return project.tasks.map((task) => {
    const position = layout.positions.get(task.id)!
    return {
      id: task.id,
      type: 'task',
      position,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: task.title, status: task.status, relation: relationFor(task.id) },
    }
  })
}

/** Nodes/edges for the Dependency Map (002): highlights the selected task's direct relations. */
export function buildDependencyGraphElements(
  project: Project,
  selectedTaskId: string | null,
): { nodes: Node<TaskNodeData>[]; edges: Edge[] } {
  const layout = computeTaskGraphLayout(project)

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

  return { nodes: nodesFromLayout(project, layout, relationFor), edges: layout.edges }
}

/** Nodes/edges for the Impact Map (003): highlights a change's direct/indirect affected tasks. */
export function buildImpactGraphElements(
  project: Project,
  impactResult: ImpactResult | null,
): { nodes: Node<TaskNodeData>[]; edges: Edge[] } {
  const layout = computeTaskGraphLayout(project)

  const relationById = new Map(
    (impactResult?.affectedTasks ?? []).map((affected) => [affected.taskId, affected.relation]),
  )

  function relationFor(taskId: string): TaskNodeRelation {
    return relationById.get(taskId) ?? 'unaffected'
  }

  return { nodes: nodesFromLayout(project, layout, relationFor), edges: layout.edges }
}
