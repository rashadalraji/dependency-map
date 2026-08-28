import { Background, Controls, ReactFlow, ReactFlowProvider, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { ImpactResult, Project } from '../core/types'
import { GraphLegend } from './GraphLegend'
import { buildImpactGraphElements, RELATION_INFO } from './graphLayout'
import { TaskNode } from './TaskNode'

const NODE_TYPES: NodeTypes = { task: TaskNode }

const LEGEND_ENTRIES = (['direct', 'indirect', 'unaffected'] as const).map((relation) => ({
  label: RELATION_INFO[relation].label,
  swatchClassName: RELATION_INFO[relation].swatchClassName,
}))

interface ImpactMapProps {
  project: Project
  result: ImpactResult | null
}

export function ImpactMap({ project, result }: ImpactMapProps) {
  const { nodes, edges } = useMemo(
    () => buildImpactGraphElements(project, result),
    [project, result],
  )

  return (
    <div className="flex h-[55vh] min-h-96 flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <GraphLegend entries={LEGEND_ENTRIES} />
      </div>
      <div data-testid="impact-map-graph" className="min-h-0 flex-1">
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} nodesDraggable={false} fitView>
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  )
}
