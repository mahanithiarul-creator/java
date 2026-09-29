import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FlaggedHouseholdItem {
  id: number
  householdName: string
  address: string
  averageScore: number | null
}

interface FlaggedHouseholdsProps {
  flagged: FlaggedHouseholdItem[]
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export function FlaggedHouseholds({ flagged, loading = false, error, onRetry }: FlaggedHouseholdsProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 h-6 w-48 animate-pulse rounded-full bg-slate-200" />
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
          <AlertTriangle size={18} />
          <h3 className="font-semibold">Flagged households unavailable</h3>
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

  if (!flagged.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-lg font-semibold">Households Requiring Attention</h3>
          </div>
          <Link to="/flagged" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-8 text-center">
          <p className="text-base font-medium text-slate-700">All households are currently meeting the required segregation standard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="text-lg font-semibold">Households Requiring Attention</h3>
        </div>
        <Link to="/flagged" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {flagged.map((household) => (
          <div key={household.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-slate-800">{household.householdName}</p>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                  ⚠ Flagged
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">{household.address}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Avg score</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {household.averageScore == null ? 'Unavailable' : `${household.averageScore.toFixed(1)}%`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
