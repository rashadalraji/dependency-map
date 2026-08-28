import type { Project, RequirementChange, ImpactResult, ImpactRiskLevel } from '../core/types'
import { RELATION_INFO } from './graphLayout'

const RISK_BADGE_CLASS: Record<ImpactRiskLevel, string> = {
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Critical: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}

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
    <section aria-label="Impact report" className="rounded-md border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="text-lg font-semibold">Impact Report</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        <strong className="text-slate-900 dark:text-slate-100">{change.requirementDescriptionSnapshot}</strong> —{' '}
        {change.changeType}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Directly affected tasks
          </dt>
          <dd className="mt-0.5 text-base">{directTasks.length}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Indirectly affected tasks
          </dt>
          <dd className="mt-0.5 text-base">{indirectTasks.length}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Effort impact
          </dt>
          <dd className="mt-0.5 text-base">{result.effortImpactDays} days</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Schedule impact
          </dt>
          <dd className="mt-0.5 text-base">{result.scheduleImpactDays} days</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Risk level
          </dt>
          <dd className={`mt-0.5 inline-block rounded px-2 py-0.5 text-sm font-semibold ${RISK_BADGE_CLASS[result.riskLevel]}`}>
            {result.riskLevel}
          </dd>
        </div>
      </dl>

      {result.affectedTasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No tasks are affected by this change.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {result.affectedTasks.map((affected) => (
            <li
              key={affected.taskId}
              className="rounded border border-slate-200 p-2 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 rounded-full ${RELATION_INFO[affected.relation].swatchClassName}`}
                />
                <strong className="text-sm">{taskById.get(affected.taskId)?.title ?? affected.taskId}</strong>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {RELATION_INFO[affected.relation].label}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{affected.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
