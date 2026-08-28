import { computeProgress } from '../core/progress'
import type { Project } from '../core/types'

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const progress = computeProgress(project)

  return (
    <header className="project-header">
      <h1>{project.name}</h1>
      <dl className="project-header__facts">
        <div>
          <dt>Target deadline</dt>
          <dd>{project.targetDeadline}</dd>
        </div>
        <div>
          <dt>Estimated effort</dt>
          <dd>{project.estimatedEffortDays} days</dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>
            {'percentDone' in progress
              ? `${progress.percentDone}% (${progress.doneTasks} of ${progress.totalTasks} tasks done)`
              : 'No tasks yet'}
          </dd>
        </div>
      </dl>
    </header>
  )
}
