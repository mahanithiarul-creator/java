import { AlertCircle, Clock3, Truck } from 'lucide-react'

interface PickupRecord {
  id: number
  householdId: number
  householdName: string
  pickupDateTime: string
  segregationScore: number
}

interface RecentPickupsProps {
  pickups: PickupRecord[]
  loading?: boolean
  error?: string
  onRetry?: () => void
}

function getStatus(score: number) {
  if (score < 60) return { label: 'Poor', className: 'bg-rose-100 text-rose-700' }
  if (score < 80) return { label: 'Average', className: 'bg-amber-100 text-amber-700' }
  return { label: 'Good', className: 'bg-emerald-100 text-emerald-700' }
}

export function RecentPickups({ pickups, loading = false, error, onRetry }: RecentPickupsProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 h-6 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle size={18} />
          <h3 className="font-semibold">Pickup activity unavailable</h3>
        </div>
        <p className="mt-2 text-sm text-rose-700/80">{error}</p>
        {onRetry ? (
          <button onClick={onRetry} className="mt-4 rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700">
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  if (!pickups.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Truck size={18} className="text-moss" />
          <h3 className="text-lg font-semibold">Recent Pickup Activity</h3>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <p className="text-lg font-medium text-slate-700">No pickup records yet</p>
          <p className="mt-2 text-sm text-slate-500">Records will appear here once households are serviced.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-slate-800">
        <Truck size={18} className="text-moss" />
        <h3 className="text-lg font-semibold">Recent Pickup Activity</h3>
      </div>

      <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_0.7fr_0.8fr] md:gap-4 md:border-b md:border-slate-200 md:pb-3 md:text-xs md:font-semibold md:uppercase md:tracking-[0.12em] md:text-slate-400">
        <span>Household</span>
        <span>Date &amp; Time</span>
        <span>Score</span>
        <span>Status</span>
      </div>

      <div className="mt-4 space-y-3 md:mt-0">
        {pickups.map((pickup) => {
          const status = getStatus(pickup.segregationScore)
          const dateLabel = new Date(pickup.pickupDateTime).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })

          return (
            <div key={pickup.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:grid md:grid-cols-[1.5fr_1.5fr_0.7fr_0.8fr] md:items-center md:gap-4 md:bg-transparent md:px-0 md:py-3">
              <div className="flex items-center gap-3 md:gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-moss">
                  <Clock3 size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{pickup.householdName}</p>
                  <p className="text-xs text-slate-500 md:hidden">{dateLabel}</p>
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-600 md:mt-0">{dateLabel}</p>
              <p className="mt-2 text-sm font-semibold text-slate-700 md:mt-0">{pickup.segregationScore}</p>
              <div className="mt-2 md:mt-0">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
