import { Background, Controls, ReactFlow, ReactFlowProvider, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { ImpactResult, Project } from '../core/types'
import { buildImpactGraphElements } from './graphLayout'
import './ImpactMap.css'
import { TaskNode } from './TaskNode'

const NODE_TYPES: NodeTypes = { task: TaskNode }

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
    <div className="impact-map">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} nodesDraggable={false} fitView>
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
