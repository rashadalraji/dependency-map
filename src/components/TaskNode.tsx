import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { RELATION_INFO, type TaskNodeData } from './graphLayout'

const STATUS_LABEL: Record<TaskNodeData['status'], string> = {
  NotStarted: 'Not started',
  InProgress: 'In progress',
  Done: 'Done',
}

const STATUS_ACCENT_CLASS: Record<TaskNodeData['status'], string> = {
  NotStarted: 'border-l-slate-400',
  InProgress: 'border-l-amber-500',
  Done: 'border-l-emerald-500',
}

const EMPHASIZED_RELATIONS = new Set(['selected', 'direct'])

export function TaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
  const { label, status, relation } = data
  const isEmphasized = EMPHASIZED_RELATIONS.has(relation)
  const isMuted = relation === 'unrelated' || relation === 'unaffected'

  return (
    <div
      className={`min-w-40 rounded-md border-2 border-l-4 bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100 ${STATUS_ACCENT_CLASS[status]} ${
        isEmphasized
          ? 'border-brand ring-2 ring-brand/20'
          : isMuted
            ? 'border-slate-200 opacity-60 dark:border-slate-700'
            : 'border-slate-300 dark:border-slate-600'
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="font-semibold">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span>{STATUS_LABEL[status]}</span>
        <span aria-hidden="true">·</span>
        <span>{RELATION_INFO[relation].label}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
