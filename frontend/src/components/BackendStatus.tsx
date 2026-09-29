import { Activity, WifiOff } from 'lucide-react'
import { useBackendStatus } from '../hooks/useBackendStatus'

export function BackendStatus() {
  const { status, isChecking } = useBackendStatus()

  const connected = status === 'connected'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        connected
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
      title={connected ? 'Backend Connected' : 'Backend Unavailable'}
    >
      {connected ? <Activity size={14} className="shrink-0" /> : <WifiOff size={14} className="shrink-0" />}
      <span>{isChecking ? 'Checking backend…' : connected ? '🟢 Backend Connected' : '🔴 Backend Unavailable'}</span>
    </div>
  )
}
