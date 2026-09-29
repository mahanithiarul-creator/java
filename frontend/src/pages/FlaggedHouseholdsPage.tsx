import { AlertTriangle, MapPinned, ShieldAlert, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi, householdsApi, zonesApi } from '../api/index'
import { getApiErrorMessage } from '../api/axios'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, ZoneResponse } from '../types/api'

export function FlaggedHouseholdsPage() {
  usePageTitle('Flagged Households')
  const { status } = useBackendStatus()

  const [flagged, setFlagged] = useState<HouseholdResponse[]>([])
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [scores, setScores] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected') {
      setFlagged([])
      setZones([])
      setScores({})
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadFlagged = async () => {
      setLoading(true)
      setError(null)

      try {
        const [flaggedResult, zonesResult] = await Promise.all([householdsApi.getFlagged(), zonesApi.getAll()])

        if (!alive) return

        setFlagged(flaggedResult)
        setZones(zonesResult)

        const averages = await Promise.allSettled(
          flaggedResult.map(async (household) => ({
            householdId: household.id,
            averageScore: (await analyticsApi.getHouseholdAverageScore(household.id)).averageScore,
          })),
        )

        if (!alive) return

        const nextScores: Record<number, number | null> = {}
        averages.forEach((result) => {
          if (result.status === 'fulfilled') {
            nextScores[result.value.householdId] = result.value.averageScore
          }
        })

        setScores(nextScores)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadFlagged()

    return () => {
      alive = false
    }
  }, [status])

  const zoneMap = useMemo(() => new Map(zones.map((zone) => [zone.id, zone.zoneName])), [zones])

  if (status !== 'connected') {
    return (
      <section className="page-enter flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Backend unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Flagged household data requires the Spring Boot backend to be online.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Follow-up Queue</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Flagged Households</h1>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading flagged households…</div>
      ) : flagged.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {flagged.map((household) => (
            <div key={household.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{household.householdName}</h2>
                    <p className="text-sm text-slate-500">{zoneMap.get(household.zoneId) ?? `Zone ${household.zoneId}`}</p>
                  </div>
                </div>

                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Flagged</span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPinned size={14} className="text-slate-400" />
                  {household.address}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Average score</p>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {scores[household.id] == null ? 'N/A' : `${scores[household.id]?.toFixed(1)}%`}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Flagged status</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-rose-700">
                    <ShieldAlert size={14} />
                    Backend flagged
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link to={`/households/${household.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  View household
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldAlert size={24} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">No flagged households</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">All households are currently meeting the required segregation score.</p>
        </div>
      )}
    </section>
  )
}
