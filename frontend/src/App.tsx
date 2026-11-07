import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useInRouterContext, useLocation } from 'react-router-dom'
import { Bell, CircleDot, FolderKanban, ListChecks, Menu, Search, Settings, Compass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './App.css'
import { Sidebar } from './Sidebar'
import { Dashboard } from './Dashboard'

const TITLES: Record<string, string> = {
  '/': 'Overview',
  '/projects': 'Projects',
  '/issues': 'Issues',
  '/my-tasks': 'My Tasks',
  '/settings': 'Settings',
}

interface EmptyPageProps {
  icon: LucideIcon
  title: string
  hint: string
}

function EmptyPage({ icon: Icon, title, hint }: EmptyPageProps) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-line-strong bg-panel text-tide">
          <Icon size={20} />
        </span>
        <h1 className="mt-5 text-lg font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
        <Link to="/" className="btn mt-6">
          Back to overview
        </Link>
      </div>
    </div>
  )
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-medium">{TITLES[pathname] ?? 'Not found'}</p>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="search" aria-label="Search">
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
              <span className="kbd hidden md:inline">Ctrl K</span>
            </button>
            <button type="button" className="icon-btn relative" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-buoy" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/projects"
              element={<EmptyPage icon={FolderKanban} title="Projects" hint="Project boards and timelines will live here. This view isn't built yet." />}
            />
            <Route
              path="/issues"
              element={<EmptyPage icon={CircleDot} title="Issues" hint="Every issue across your workspace will be listed here. This view isn't built yet." />}
            />
            <Route
              path="/my-tasks"
              element={<EmptyPage icon={ListChecks} title="My Tasks" hint="Issues assigned to you will appear here. This view isn't built yet." />}
            />
            <Route
              path="/settings"
              element={<EmptyPage icon={Settings} title="Settings" hint="Workspace and profile settings will be available here soon." />}
            />
            <Route
              path="*"
              element={<EmptyPage icon={Compass} title="Page not found" hint="That address doesn't match anything in Shipyard." />}
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

/* Works whether or not main.tsx already provides a router. */
export default function App() {
  const insideRouter = useInRouterContext()
  return insideRouter ? (
    <Shell />
  ) : (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}