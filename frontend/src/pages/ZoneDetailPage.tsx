import { ArrowLeft, CalendarDays, MapPinned, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { analyticsApi, householdsApi, schedulesApi, zonesApi } from '../api/index'
import { getApiErrorMessage } from '../api/axios'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, ScheduleResponse, ZoneResponse } from '../types/api'

const formatDay = (day: string) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()

export function ZoneDetailPage() {
  const { id } = useParams()
  usePageTitle('Zone Details')
  const { status } = useBackendStatus()

  const zoneId = Number(id)
  const [zone, setZone] = useState<ZoneResponse | null>(null)
  const [households, setHouseholds] = useState<HouseholdResponse[]>([])
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [averageScore, setAverageScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected' || !Number.isFinite(zoneId)) {
      setLoading(false)
      setError('The requested zone is unavailable.')
      return
    }

    let alive = true

    const loadZone = async () => {
      setLoading(true)
      setError(null)

      try {
        const [zoneResult, householdsResult, schedulesResult, analyticsResult] = await Promise.all([
          zonesApi.getById(zoneId),
          householdsApi.getByZone(zoneId),
          schedulesApi.getByZone(zoneId),
          analyticsApi.getZoneAverageScore(zoneId),
        ])

        if (!alive) return

        setZone(zoneResult)
        setHouseholds(householdsResult)
        setSchedules(schedulesResult)
        setAverageScore(analyticsResult.averageScore)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadZone()

    return () => {
      alive = false
    }
  }, [status, zoneId])

  const scheduleSummary = useMemo(
    () =>
      [...schedules].sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek)).map((schedule) => ({
        ...schedule,
        label: `${formatDay(schedule.dayOfWeek)} · ${schedule.startTime}–${schedule.endTime}`,
      })),
    [schedules],
  )

  if (status !== 'connected') {
    return (
      <section className="page-enter rounded-3xl border border-rose-200 bg-white p-8 text-sm text-rose-700 shadow-sm">
        Backend connection is required to view zone detail.
      </section>
    )
  }

  if (loading) {
    return <section className="page-enter rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading zone details…</section>
  }

  if (error || !zone) {
    return (
      <section className="page-enter space-y-4 rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-rose-700">{error ?? 'Zone not found.'}</p>
        <Link to="/zones" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
          <ArrowLeft size={16} />
          Back to zones
        </Link>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Zone Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{zone.zoneName}</h1>
        </div>

        <Link to="/zones" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          <ArrowLeft size={16} />
          Back to zones
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Zone ID</p>
          <div className="mt-3 flex items-center gap-2 text-slate-900">
            <MapPinned size={16} className="text-moss" />
            <span className="text-lg font-semibold">{zone.id}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Households</p>
          <div className="mt-3 flex items-center gap-2 text-slate-900">
            <Users size={16} className="text-moss" />
            <span className="text-lg font-semibold">{households.length}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Average score</p>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {averageScore == null ? 'No score yet' : `${averageScore.toFixed(1)}%`}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Households</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{households.length} total</span>
          </div>

          {households.length ? (
            <div className="space-y-3">
              {households.map((household) => (
                <Link
                  key={household.id}
                  to={`/households/${household.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <div>
                    <p className="font-medium text-slate-900">{household.householdName}</p>
                    <p className="text-sm text-slate-500">{household.address}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${household.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {household.flagged ? 'Flagged' : 'Active'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              No households are assigned to this zone yet.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-moss" />
            <h2 className="text-xl font-semibold text-slate-900">Schedules</h2>
          </div>

          {scheduleSummary.length ? (
            <div className="space-y-3">
              {scheduleSummary.map((schedule) => (
                <div key={schedule.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{schedule.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">Pickup window</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              No schedules have been assigned to this zone yet.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
