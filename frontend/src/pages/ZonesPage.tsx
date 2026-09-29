import { AlertCircle, ArrowRight, MapPinned, Plus, RefreshCcw, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi, householdsApi, schedulesApi, zonesApi } from '../api/index'
import { getApiErrorMessage } from '../api/axios'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, ScheduleResponse, ZoneResponse } from '../types/api'

const formatDay = (day: string) =>
  day
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatSchedule = (schedules: ScheduleResponse[]) => {
  if (!schedules.length) return 'No schedule assigned'

  const next = [...schedules].sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek))[0]
  return `${formatDay(next.dayOfWeek)} · ${next.startTime}–${next.endTime}`
}

export function ZonesPage() {
  usePageTitle('Zones')
  const { status } = useBackendStatus()

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [schedulesByZone, setSchedulesByZone] = useState<Record<number, ScheduleResponse[]>>({})
  const [householdsByZone, setHouseholdsByZone] = useState<Record<number, HouseholdResponse[]>>({})
  const [averageScores, setAverageScores] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected') {
      setZones([])
      setSchedulesByZone({})
      setHouseholdsByZone({})
      setAverageScores({})
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadZones = async () => {
      setLoading(true)
      setError(null)

      try {
        const [zonesResult, schedulesResult, householdsResult] = await Promise.allSettled([
          zonesApi.getAll(),
          schedulesApi.getAll(),
          householdsApi.getAll(),
        ])

        if (!alive) return

        if (zonesResult.status === 'rejected') {
          throw zonesResult.reason
        }

        const resolvedZones = zonesResult.value
        const scheduleMap: Record<number, ScheduleResponse[]> = {}
        const householdMap: Record<number, HouseholdResponse[]> = {}

        if (schedulesResult.status === 'fulfilled') {
          schedulesResult.value.forEach((schedule) => {
            if (!scheduleMap[schedule.zoneId]) {
              scheduleMap[schedule.zoneId] = []
            }
            scheduleMap[schedule.zoneId].push(schedule)
          })
        }

        if (householdsResult.status === 'fulfilled') {
          householdsResult.value.forEach((household) => {
            if (!householdMap[household.zoneId]) {
              householdMap[household.zoneId] = []
            }
            householdMap[household.zoneId].push(household)
          })
        }

        const averages: Record<number, number | null> = {}
        if (resolvedZones.length) {
          const analyticsResults = await Promise.allSettled(
            resolvedZones.map(async (zone) => ({
              zoneId: zone.id,
              averageScore: (await analyticsApi.getZoneAverageScore(zone.id)).averageScore,
            })),
          )

          analyticsResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              averages[result.value.zoneId] = result.value.averageScore
            }
          })
        }

        setZones(resolvedZones)
        setSchedulesByZone(scheduleMap)
        setHouseholdsByZone(householdMap)
        setAverageScores(averages)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadZones()

    return () => {
      alive = false
    }
  }, [refreshKey, status])

  const zoneCards = useMemo(
    () =>
      zones.map((zone) => ({
        ...zone,
        households: householdsByZone[zone.id] ?? [],
        schedules: schedulesByZone[zone.id] ?? [],
        averageScore: averageScores[zone.id] ?? null,
      })),
    [averageScores, householdsByZone, schedulesByZone, zones],
  )

  const handleCreateZone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = zoneName.trim()
    if (!trimmed) {
      setSubmitError('Zone name is required.')
      return
    }

    try {
      setSaving(true)
      setSubmitError(null)
      await zonesApi.create({ zoneName: trimmed })
      setZoneName('')
      setShowForm(false)
      setRefreshKey((value) => value + 1)
    } catch (createError) {
      setSubmitError(getApiErrorMessage(createError))
    } finally {
      setSaving(false)
    }
  }

  if (status !== 'connected') {
    return (
      <section className="page-enter flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Backend unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">The zone list cannot load until the Spring Boot API is running.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Coverage Map</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Zones</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add Zone
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {showForm ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Create a new zone</h2>
            <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="text-sm text-slate-500 hover:text-slate-700">
              Close
            </button>
          </div>

          <form onSubmit={handleCreateZone} className="space-y-4 md:max-w-xl">
            <div>
              <label htmlFor="zone-name" className="mb-2 block text-sm font-medium text-slate-700">Zone name</label>
              <input
                id="zone-name"
                value={zoneName}
                onChange={(event) => setZoneName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="North City"
              />
            </div>

            {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? 'Saving…' : 'Save zone'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading zones…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {zoneCards.length ? (
            zoneCards.map((zone) => {
              const householdCount = zone.households.length
              const scoreText = zone.averageScore == null ? 'No score yet' : `${zone.averageScore.toFixed(1)}%`

              return (
                <div key={zone.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-moss">
                        <MapPinned size={18} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{zone.zoneName}</h2>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Zone {zone.id}</p>
                      </div>
                    </div>

                    <Link to={`/zones/${zone.id}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                      View details
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Households</p>
                      <div className="mt-2 flex items-center gap-2 text-slate-900">
                        <Users size={14} className="text-moss" />
                        <span className="text-lg font-semibold">{householdCount}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Avg score</p>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{scoreText}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Schedule</p>
                      <div className="mt-2 text-sm font-medium text-slate-700">{formatSchedule(zone.schedules)}</div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 shadow-sm">
              No zones have been created yet.
            </div>
          )}
        </div>
      )}
    </section>
  )
}
