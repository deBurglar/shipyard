import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CircleCheck,
  CircleDot,
  FolderKanban,
  GitMerge,
  MessageSquare,
  Plus,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getHealth } from './lib/api'

type Tone = 'ok' | 'risk' | 'idle'
type ChartTone = 'tide' | 'ok' | 'buoy'
type ProjectStatus = 'On track' | 'At risk' | 'Paused'
type ActivityKind = 'done' | 'comment' | 'merge' | 'open'
type ApiStatus = 'connecting' | 'connected' | 'offline'

interface Project {
  key: string
  name: string
  lead: string
  updated: string
  open: number
  total: number
  status: ProjectStatus
}

interface ActivityEntry {
  id: number
  actor: string
  verb: string
  target: string
  ref: string
  time: string
  kind: ActivityKind
}

const PROJECTS: Project[] = [
  { key: 'ATL', name: 'Atlas mobile rewrite', lead: 'Priya Nair', updated: '12 min ago', open: 18, total: 64, status: 'On track' },
  { key: 'BIL', name: 'Billing engine v2', lead: 'Marcus Lee', updated: '41 min ago', open: 27, total: 46, status: 'At risk' },
  { key: 'EDG', name: 'Edge cache rollout', lead: 'You', updated: '1 hour ago', open: 4, total: 35, status: 'On track' },
  { key: 'DSN', name: 'Design tokens', lead: 'Ana Torres', updated: '2 hours ago', open: 11, total: 25, status: 'On track' },
  { key: 'AUD', name: 'Audit logging', lead: 'Dev Patel', updated: 'Yesterday', open: 23, total: 30, status: 'Paused' },
]

const ACTIVITY: ActivityEntry[] = [
  { id: 1, actor: 'Priya Nair', verb: 'merged', target: 'Migrate navigation to Expo Router', ref: 'ATL-214', time: '12m', kind: 'merge' },
  { id: 2, actor: 'Marcus Lee', verb: 'commented on', target: 'Invoice rounding drifts on multi-currency refunds', ref: 'BIL-88', time: '41m', kind: 'comment' },
  { id: 3, actor: 'You', verb: 'closed', target: 'Purge stale keys on deploy', ref: 'EDG-31', time: '1h', kind: 'done' },
  { id: 4, actor: 'Ana Torres', verb: 'opened', target: 'Contrast fails on disabled button tokens', ref: 'DSN-47', time: '2h', kind: 'open' },
  { id: 5, actor: 'Dev Patel', verb: 'commented on', target: 'Write-ahead log for audit events', ref: 'AUD-12', time: '5h', kind: 'comment' },
  { id: 6, actor: 'Priya Nair', verb: 'closed', target: 'Fix keyboard overlap on checkout sheet', ref: 'ATL-209', time: 'Yesterday', kind: 'done' },
]

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  'On track': 'ok',
  'At risk': 'risk',
  Paused: 'idle',
}

const KIND_ICON: Record<ActivityKind, { icon: LucideIcon; tone: Tone }> = {
  done: { icon: CircleCheck, tone: 'ok' },
  comment: { icon: MessageSquare, tone: 'idle' },
  merge: { icon: GitMerge, tone: 'ok' },
  open: { icon: CircleDot, tone: 'risk' },
}

const percent = (p: Project) => Math.round(((p.total - p.open) / p.total) * 100)

function useSimulatedLoad(ms = 900) {
  const [loading, setLoading] = useState(true)
  const timer = useRef<number>(0)

  useEffect(() => {
    timer.current = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(timer.current)
  }, [ms])

  const reload = useCallback(() => {
    setLoading(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLoading(false), ms)
  }, [ms])

  return { loading, reload }
}

function DraftBar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="draft" data-tone={tone} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

interface Stat {
  label: string
  value: number
  note: string
  good: boolean
  icon: LucideIcon
  chartValues: number[]
  chartLabel: string
  chartTone: ChartTone
}

function StatCard({ label, value, note, good, icon: Icon, chartValues, chartLabel, chartTone }: Stat) {
  const peak = Math.max(...chartValues, 1)

  return (
    <div className="card stat">
      <div className="flex items-center justify-between text-muted">
        <span className="text-[0.82rem] font-medium">{label}</span>
        <Icon size={16} />
      </div>
      <div className="stat-reading">
        <p className="mt-3 text-[2.1rem] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        <div className="stat-chart" data-tone={chartTone} role="img" aria-label={chartLabel}>
          {chartValues.map((point, index) => (
            <span
              key={index}
              data-empty={point === 0}
              style={{ height: `${Math.max((point / peak) * 100, 8)}%` }}
            />
          ))}
        </div>
      </div>
      <p className={`mt-2.5 text-xs ${good ? 'text-ok' : 'text-buoy'}`}>{note}</p>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="card stat" aria-hidden="true">
      <div className="skeleton h-3.5 w-24" />
      <div className="skeleton mt-4 h-8 w-16" />
      <div className="skeleton mt-3.5 h-3 w-32" />
    </div>
  )
}

function ApiConnectionStatus() {
  const [status, setStatus] = useState<ApiStatus>('connecting')

  useEffect(() => {
    const controller = new AbortController()

    getHealth(controller.signal)
      .then(({ status: healthStatus }) => {
        setStatus(healthStatus === 'UP' ? 'connected' : 'offline')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('offline')
      })

    return () => controller.abort()
  }, [])

  const label = status === 'connected' ? 'Connected' : status === 'offline' ? 'Offline' : 'Connecting'

  return (
    <span className="api-status" data-status={status} role="status" aria-live="polite">
      <span className="api-status-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

function ProjectRow({ project }: { project: Project }) {
  const tone = STATUS_TONE[project.status]
  const pct = percent(project)
  return (
    <li>
      <Link to="/projects" className="row-link">
        <span className="w-8 shrink-0 font-mono text-xs text-faint">{project.key}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{project.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            Led by {project.lead}, updated {project.updated}
          </p>
        </div>
        <div className="hidden w-32 shrink-0 sm:block">
          <DraftBar value={pct} tone={tone} />
          <p className="mt-1.5 text-xs text-muted tabular-nums">
            {pct}% done, {project.open} open
          </p>
        </div>
        <span className="pill" data-tone={tone}>
          {project.status}
        </span>
      </Link>
    </li>
  )
}

function RowSkeleton() {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5" aria-hidden="true">
      <div className="skeleton h-3 w-8" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/5" />
        <div className="skeleton h-3 w-3/5" />
      </div>
      <div className="skeleton hidden h-6 w-24 sm:block" />
    </li>
  )
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const { icon: Icon, tone } = KIND_ICON[entry.kind]
  return (
    <li className="relative flex gap-3 px-5 py-3">
      <span
        data-tone={tone}
        className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line-strong bg-panel text-[var(--tone)]"
      >
        <Icon size={12} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.82rem] leading-snug text-muted">
          <span className="font-medium text-text">{entry.actor}</span> {entry.verb}{' '}
          <span className="text-text">{entry.target}</span>
        </p>
        <p className="mt-1 text-xs text-faint">
          <span className="font-mono">{entry.ref}</span>
          <span className="ml-2">{entry.time === 'Yesterday' ? entry.time : `${entry.time} ago`}</span>
        </p>
      </div>
    </li>
  )
}

function ActivitySkeleton() {
  return (
    <li className="flex gap-3 px-5 py-3" aria-hidden="true">
      <div className="skeleton size-5 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-11/12" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </li>
  )
}

export function Dashboard() {
  const { loading, reload } = useSimulatedLoad()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const activeProjects = PROJECTS.filter((p) => p.status !== 'Paused').length
  const openIssues = PROJECTS.reduce((n, p) => n + p.open, 0)
  const completed = PROJECTS.reduce((n, p) => n + (p.total - p.open), 0)

  const stats: Stat[] = [
    {
      label: 'Active projects',
      value: activeProjects,
      note: '1 more than last month',
      good: true,
      icon: FolderKanban,
      chartValues: PROJECTS.map((project) => Number(project.status !== 'Paused')),
      chartLabel: 'Active projects by project',
      chartTone: 'tide',
    },
    {
      label: 'Open issues',
      value: openIssues,
      note: '12 fewer than last week',
      good: true,
      icon: CircleDot,
      chartValues: PROJECTS.map((project) => project.open),
      chartLabel: 'Open issues by project',
      chartTone: 'buoy',
    },
    {
      label: 'Completed',
      value: completed,
      note: '23 closed this week',
      good: true,
      icon: CircleCheck,
      chartValues: PROJECTS.map((project) => project.total - project.open),
      chartLabel: 'Completed issues by project',
      chartTone: 'ok',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
            {greeting}, Shreyansh
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-sm text-muted">You have 7 open tasks, and 3 are due this week.</p>
            <ApiConnectionStatus />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={reload} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button type="button" className="btn btn-primary">
            <Plus size={15} />
            New issue
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Summary" aria-busy={loading}>
        {loading
          ? [0, 1, 2].map((i) => <StatSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="card overflow-hidden" aria-labelledby="recent-projects" aria-busy={loading}>
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 id="recent-projects" className="text-sm font-semibold">
              Recent projects
            </h2>
            <Link to="/projects" className="text-xs text-muted transition-colors hover:text-tide">
              View all projects
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {loading
              ? [0, 1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)
              : PROJECTS.map((p) => <ProjectRow key={p.key} project={p} />)}
          </ul>
        </section>

        <section className="card overflow-hidden" aria-labelledby="activity" aria-busy={loading}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 id="activity" className="text-sm font-semibold">
              Activity
            </h2>
          </div>
          <ul className="rail py-1.5">
            {loading
              ? [0, 1, 2, 3, 4, 5].map((i) => <ActivitySkeleton key={i} />)
              : ACTIVITY.map((a) => <ActivityItem key={a.id} entry={a} />)}
          </ul>
        </section>
      </div>
    </div>
  )
}