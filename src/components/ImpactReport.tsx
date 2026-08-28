import type { Project, RequirementChange, ImpactResult } from '../core/types'

interface ImpactReportProps {
  project: Project
  change: RequirementChange
  result: ImpactResult
}

export function ImpactReport({ project, change, result }: ImpactReportProps) {
  const taskById = new Map(project.tasks.map((task) => [task.id, task]))
  const directTasks = result.affectedTasks.filter((affected) => affected.relation === 'direct')
  const indirectTasks = result.affectedTasks.filter((affected) => affected.relation === 'indirect')

  return (
    <section className="panel" aria-label="Impact report">
      <h2>Impact Report</h2>
      <p>
        <strong>{change.requirementDescriptionSnapshot}</strong> — {change.changeType}
      </p>
      <dl className="impact-report__summary">
        <div>
          <dt>Directly affected tasks</dt>
          <dd>{directTasks.length}</dd>
        </div>
        <div>
          <dt>Indirectly affected tasks</dt>
          <dd>{indirectTasks.length}</dd>
        </div>
        <div>
          <dt>Effort impact</dt>
          <dd>{result.effortImpactDays} days</dd>
        </div>
        <div>
          <dt>Schedule impact</dt>
          <dd>{result.scheduleImpactDays} days</dd>
        </div>
        <div>
          <dt>Risk level</dt>
          <dd className={`impact-report__risk impact-report__risk--${result.riskLevel.toLowerCase()}`}>
            {result.riskLevel}
          </dd>
        </div>
      </dl>

      {result.affectedTasks.length === 0 ? (
        <p>No tasks are affected by this change.</p>
      ) : (
        <ul className="impact-report__tasks">
          {result.affectedTasks.map((affected) => (
            <li key={affected.taskId} className={`impact-report__task impact-report__task--${affected.relation}`}>
              <strong>{taskById.get(affected.taskId)?.title ?? affected.taskId}</strong>
              <span className="badge">{affected.relation}</span>
              <p className="impact-report__task-reason">{affected.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
