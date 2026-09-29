import { AlertCircle, BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ZonePerformanceChartProps {
  data: Array<{ zone: string; score: number }>
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export function ZonePerformanceChart({ data, loading = false, error, onRetry }: ZonePerformanceChartProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 h-6 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="h-[260px] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle size={18} />
          <h3 className="font-semibold">Zone analytics unavailable</h3>
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

  if (!data.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <BarChart3 size={18} />
          <h3 className="font-semibold text-slate-800">Zone Segregation Performance</h3>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <p className="text-lg font-medium text-slate-700">No zones available</p>
          <p className="mt-2 text-sm text-slate-500">Create a zone to begin tracking performance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <BarChart3 size={18} className="text-moss" />
          <h3 className="text-lg font-semibold">Zone Segregation Performance</h3>
        </div>
      </div>

      <div className="h-[290px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="zone" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              cursor={{ fill: '#ecfdf5' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Segregation Score']}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#0d615b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
