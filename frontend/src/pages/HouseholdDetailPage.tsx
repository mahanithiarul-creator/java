import { ArrowLeft, House, MapPinned, ShieldAlert, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { analyticsApi, householdsApi, pickupsApi, zonesApi } from '../api/index'
import { getApiErrorMessage } from '../api/axios'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, PickupLogResponse } from '../types/api'

const formatDate = (dateTime: string) => new Date(dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export function HouseholdDetailPage() {
  const { id } = useParams()
  usePageTitle('Household Details')
  const { status } = useBackendStatus()

  const householdId = Number(id)
  const [household, setHousehold] = useState<HouseholdResponse | null>(null)
  const [zoneName, setZoneName] = useState<string>('')
  const [pickups, setPickups] = useState<PickupLogResponse[]>([])
  const [averageScore, setAverageScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected' || !Number.isFinite(householdId)) {
      setLoading(false)
      setError('The requested household is unavailable.')
      return
    }

    let alive = true

    const loadHousehold = async () => {
      setLoading(true)
      setError(null)

      try {
        const [householdResult, pickupsResult, averageResult] = await Promise.all([
          householdsApi.getById(householdId),
          pickupsApi.getByHousehold(householdId),
          analyticsApi.getHouseholdAverageScore(householdId),
        ])

        if (!alive) return

        setHousehold(householdResult)
        setPickups(pickupsResult)
        setAverageScore(averageResult.averageScore)

        const zoneResult = await zonesApi.getById(householdResult.zoneId)
        if (!alive) return
        setZoneName(zoneResult.zoneName)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadHousehold()

    return () => {
      alive = false
    }
  }, [householdId, status])

  if (status !== 'connected') {
    return (
      <section className="page-enter rounded-3xl border border-rose-200 bg-white p-8 text-sm text-rose-700 shadow-sm">
        Backend connection is required to view household details.
      </section>
    )
  }

  if (loading) {
    return <section className="page-enter rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading household details…</section>
  }

  if (error || !household) {
    return (
      <section className="page-enter space-y-4 rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-rose-700">{error ?? 'Household not found.'}</p>
        <Link to="/households" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
          <ArrowLeft size={16} />
          Back to households
        </Link>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Household Details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{household.householdName}</h1>
        </div>

        <Link to="/households" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          <ArrowLeft size={16} />
          Back to households
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Zone</p>
          <div className="mt-3 flex items-center gap-2 text-slate-900">
            <MapPinned size={16} className="text-moss" />
            <span className="text-lg font-semibold">{zoneName || `Zone ${household.zoneId}`}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Average score</p>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {averageScore == null ? 'No score yet' : `${averageScore.toFixed(1)}%`}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
          <div className="mt-3 flex items-center gap-2 text-slate-900">
            <House size={16} className="text-moss" />
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${household.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {household.flagged ? 'Flagged' : 'Active'}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Pickup records</p>
          <div className="mt-3 flex items-center gap-2 text-slate-900">
            <TimerReset size={16} className="text-moss" />
            <span className="text-lg font-semibold">{pickups.length}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Address</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{household.address}</p>
        {household.flagged ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <ShieldAlert size={16} />
            This household is flagged and may require a review or follow-up inspection.
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Pickup history</h2>

        {pickups.length ? (
          <div className="mt-4 space-y-3">
            {[...pickups].sort((a, b) => new Date(b.pickupDateTime).getTime() - new Date(a.pickupDateTime).getTime()).map((pickup) => (
              <div key={pickup.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-900">{formatDate(pickup.pickupDateTime)}</p>
                  <p className="text-sm text-slate-500">Pickup log #{pickup.id}</p>
                </div>

                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {pickup.segregationScore}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No pickup logs have been recorded for this household yet.
          </div>
        )}
      </div>
    </section>
  )
}
