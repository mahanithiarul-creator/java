import { Recycle } from 'lucide-react'

export function BrandMark() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-100">
        <Recycle size={21} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-base font-semibold tracking-tight text-slate-900">WastePickup</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Smart Waste Collection &amp; Segregation Tracker
        </p>
      </div>
    </div>
  )
}
