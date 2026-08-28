import { computeProgress } from '../core/progress'
import type { Project } from '../core/types'

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const progress = computeProgress(project)

  return (
    <header className="border-b border-slate-200 pb-4 dark:border-slate-700">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{project.name}</h1>
      <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Target deadline
          </dt>
          <dd className="mt-0.5 text-sm">{project.targetDeadline}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Estimated effort
          </dt>
          <dd className="mt-0.5 text-sm">{project.estimatedEffortDays} days</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Progress
          </dt>
          <dd className="mt-0.5 text-sm">
            {'percentDone' in progress
              ? `${progress.percentDone}% (${progress.doneTasks} of ${progress.totalTasks} tasks done)`
              : 'No tasks yet'}
          </dd>
        </div>
      </dl>
    </header>
  )
}
