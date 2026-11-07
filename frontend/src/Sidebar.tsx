import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Check,
  ChevronsUpDown,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  count?: number
}

const NAV: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban, count: 5 },
  { to: '/issues', label: 'Issues', icon: CircleDot, count: 83 },
  { to: '/my-tasks', label: 'My Tasks', icon: ListChecks, count: 7 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const WORKSPACES = [
  { id: 'harbor', name: 'Harbor Labs', plan: 'Team plan', initials: 'HL' },
  { id: 'drydock', name: 'Drydock', plan: 'Free plan', initials: 'DD' },
  { id: 'side', name: 'Side Projects', plan: 'Free plan', initials: 'SP' },
] as const

type Workspace = (typeof WORKSPACES)[number]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onCloseMobile: () => void
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v9" stroke="#5ad1e6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4l5 6h-5" fill="#5ad1e6" fillOpacity=".25" stroke="#5ad1e6" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 14h18l-2.6 5.2a1 1 0 0 1-.9.55h-11a1 1 0 0 1-.9-.55L3 14Z" fill="#e7eaef" />
    </svg>
  )
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onCloseMobile }: SidebarProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace>(WORKSPACES[0])
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!switcherOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [switcherOpen])

  return (
    <>
      <div className="scrim" data-open={mobileOpen} onClick={onCloseMobile} aria-hidden="true" />
      <aside className="sidebar" data-collapsed={collapsed} data-open={mobileOpen} aria-label="Primary">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Logo />
          <span className="sidebar-label text-[0.95rem] font-semibold tracking-tight">Shipyard</span>
          <button
            type="button"
            className="icon-btn ml-auto lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={switcherRef} className="relative px-2 pb-3">
          <button
            type="button"
            className="ws-btn"
            aria-expanded={switcherOpen}
            aria-haspopup="menu"
            onClick={() => setSwitcherOpen((o) => !o)}
            title={workspace.name}
          >
            <span className="ws-tile">{workspace.initials}</span>
            <span className="sidebar-label min-w-0 flex-1">
              <span className="block truncate text-[0.85rem] font-medium leading-tight">{workspace.name}</span>
              <span className="block truncate text-xs text-faint">{workspace.plan}</span>
            </span>
            <ChevronsUpDown size={15} className="sidebar-label shrink-0 text-faint" />
          </button>

          {switcherOpen && (
            <div className="popover" role="menu">
              {WORKSPACES.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={w.id === workspace.id}
                  onClick={() => {
                    setWorkspace(w)
                    setSwitcherOpen(false)
                  }}
                >
                  <span className="ws-tile">{w.initials}</span>
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.id === workspace.id && <Check size={15} className="text-tide" />}
                </button>
              ))}
              <div className="my-1 border-t border-line" />
              <button type="button" role="menuitem" className="text-muted">
                <Plus size={15} className="mx-[0.3rem]" />
                Create workspace
              </button>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, count }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-link" title={label} onClick={onCloseMobile}>
              <Icon size={17} />
              <span className="sidebar-label">{label}</span>
              {count !== undefined && <span className="nav-count sidebar-label">{count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-line p-2">
          <button
            type="button"
            className="nav-link max-lg:hidden"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            <span className="sidebar-label">Collapse</span>
            <span className="nav-count sidebar-label">Ctrl B</span>
          </button>
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong bg-raised text-xs font-semibold">
              S
            </span>
            <span className="sidebar-label min-w-0">
              <span className="block truncate text-[0.82rem] font-medium leading-tight">Shreyansh</span>
              <span className="block truncate text-xs text-faint">Owner</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}