import { CalendarDays, House, MapPinned, Plus, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { title: 'Add Zone', icon: MapPinned, to: '/zones' },
  { title: 'Add Household', icon: House, to: '/households' },
  { title: 'Create Schedule', icon: CalendarDays, to: '/schedules' },
  { title: 'Record Pickup', icon: Truck, to: '/pickups' },
]

export function QuickActions() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-slate-800">
        <Plus size={18} className="text-moss" />
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map(({ title, icon: Icon, to }) => (
          <Link
            key={title}
            to={to}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-moss shadow-sm">
                <Icon size={18} />
              </div>
              <span className="font-medium text-slate-700">{title}</span>
            </div>
            <span className="text-slate-400 transition group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
