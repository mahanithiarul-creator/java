import { Bell, Menu, RefreshCcw, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { BackendStatus } from './BackendStatus'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Waste Management Dashboard',
  '/zones': 'Zones',
  '/households': 'Households',
  '/pickups': 'Pickup Logs',
  '/schedules': 'Schedules',
  '/analytics': 'Analytics',
  '/flagged': 'Flagged Households',
}

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operations</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <BackendStatus />

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
            aria-label="Refresh dashboard"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 hover:border-slate-300 sm:flex" aria-label="Search">
            <Search size={16} />
            Search
          </button>

          <button className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={18} />
          </button>

          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-moss">WM</div>
        </div>
      </div>
    </header>
  )
}
