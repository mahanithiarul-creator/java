import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  loading?: boolean
}

export function StatCard({ title, value, detail, icon: Icon, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="mt-6 h-3 w-20 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-slate-200" />
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-moss">
          <Icon size={20} />
        </div>
        <span className="text-xs text-slate-400">Live</span>
      </div>

      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  )
}
