import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { TaskNodeData } from './graphLayout'
import './TaskNode.css'

const STATUS_LABEL: Record<TaskNodeData['status'], string> = {
  NotStarted: 'Not started',
  InProgress: 'In progress',
  Done: 'Done',
}

export function TaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
  const { label, status, relation } = data

  return (
    <div className={`task-node task-node--${status.toLowerCase()} task-node--${relation}`}>
      <Handle type="target" position={Position.Left} />
      <span className="task-node__title">{label}</span>
      <span className="task-node__status">{STATUS_LABEL[status]}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
