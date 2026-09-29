import { AlertCircle, BarChart3, House, MapPinned, Recycle, TrendingUp, TriangleAlert, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { analyticsApi, householdsApi, pickupsApi, zonesApi } from '../api/index'
import { getApiErrorMessage } from '../api/axios'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, PickupLogResponse, ZoneResponse } from '../types/api'

interface ZoneMetrics {
  id: number
  name: string
  averageScore: number | null
}

const scoreBucket = (score: number) => {
  if (score >= 80) return { label: 'Excellent', bucket: '80–100', color: '#10b981', className: 'bg-emerald-100 text-emerald-700' }
  if (score >= 60) return { label: 'Good', bucket: '60–79', color: '#f59e0b', className: 'bg-amber-100 text-amber-700' }
  if (score >= 40) return { label: 'Needs Improvement', bucket: '40–59', color: '#f97316', className: 'bg-orange-100 text-orange-700' }
  return { label: 'Low', bucket: '0–39', color: '#f87171', className: 'bg-rose-100 text-rose-700' }
}

const formatDateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export function AnalyticsPage() {
  usePageTitle('Analytics')
  const { status } = useBackendStatus()

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [households, setHouseholds] = useState<HouseholdResponse[]>([])
  const [pickups, setPickups] = useState<PickupLogResponse[]>([])
  const [flagged, setFlagged] = useState<HouseholdResponse[]>([])
  const [zoneMetrics, setZoneMetrics] = useState<ZoneMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected') {
      setZones([])
      setHouseholds([])
      setPickups([])
      setFlagged([])
      setZoneMetrics([])
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadAnalytics = async () => {
      setLoading(true)
      setError(null)

      try {
        const [zonesResult, householdsResult, pickupsResult, flaggedResult] = await Promise.all([
          zonesApi.getAll(),
          householdsApi.getAll(),
          pickupsApi.getAll(),
          householdsApi.getFlagged(),
        ])

        if (!alive) return

        setZones(zonesResult)
        setHouseholds(householdsResult)
        setPickups(pickupsResult)
        setFlagged(flaggedResult)

        const analyticsResults = await Promise.allSettled(
          zonesResult.map(async (zone) => ({
            id: zone.id,
            name: zone.zoneName,
            averageScore: (await analyticsApi.getZoneAverageScore(zone.id)).averageScore,
          })),
        )

        if (!alive) return

        const resolved = analyticsResults
          .filter((result): result is PromiseFulfilledResult<ZoneMetrics> => result.status === 'fulfilled')
          .map((result) => result.value)

        setZoneMetrics(resolved)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadAnalytics()

    return () => {
      alive = false
    }
  }, [status])

  const zoneLookup = useMemo(() => new Map(zones.map((zone) => [zone.id, zone.zoneName])), [zones])

  const averageScore = useMemo(() => {
    if (!pickups.length) return null
    const total = pickups.reduce((sum, pickup) => sum + pickup.segregationScore, 0)
    return total / pickups.length
  }, [pickups])

  const householdMetrics = useMemo(
    () =>
      households.map((household) => {
        const householdPickups = pickups.filter((pickup) => pickup.householdId === household.id)
        const average = householdPickups.length
          ? householdPickups.reduce((sum, pickup) => sum + pickup.segregationScore, 0) / householdPickups.length
          : null

        return {
          id: household.id,
          name: household.householdName,
          zoneName: zoneLookup.get(household.zoneId) ?? `Zone ${household.zoneId}`,
          averageScore: average,
          flagged: household.flagged,
        }
      }),
    [households, pickups, zoneLookup],
  )

  const distributionData = useMemo(() => {
    const distribution = {
      '0–39': 0,
      '40–59': 0,
      '60–79': 0,
      '80–100': 0,
    }

    pickups.forEach((pickup) => {
      const score = pickup.segregationScore
      if (score >= 80) distribution['80–100'] += 1
      else if (score >= 60) distribution['60–79'] += 1
      else if (score >= 40) distribution['40–59'] += 1
      else distribution['0–39'] += 1
    })

    return Object.entries(distribution).map(([bucket, count]) => ({
      bucket,
      count,
      fill: bucket === '80–100' ? '#10b981' : bucket === '60–79' ? '#f59e0b' : bucket === '40–59' ? '#f97316' : '#f87171',
    }))
  }, [pickups])

  const recentActivity = useMemo(
    () =>
      [...pickups]
        .sort((a, b) => new Date(b.pickupDateTime).getTime() - new Date(a.pickupDateTime).getTime())
        .slice(0, 5)
        .map((pickup) => ({
          ...pickup,
          householdName: households.find((household) => household.id === pickup.householdId)?.householdName ?? `Household ${pickup.householdId}`,
          status: scoreBucket(pickup.segregationScore),
        })),
    [households, pickups],
  )

  const metricCards = [
    {
      label: 'Total Zones',
      value: zones.length,
      detail: zones.length ? 'Operational areas' : 'No zones available',
      icon: MapPinned,
    },
    {
      label: 'Total Households',
      value: households.length,
      detail: households.length ? 'Tracked service households' : 'No households available',
      icon: House,
    },
    {
      label: 'Total Pickups',
      value: pickups.length,
      detail: pickups.length ? 'Recorded pickups' : 'No pickups yet',
      icon: Truck,
    },
    {
      label: 'Average Segregation Score',
      value: averageScore == null ? 'N/A' : `${averageScore.toFixed(1)}%`,
      detail: averageScore == null ? 'No pickup data available yet' : 'Across all pickup records',
      icon: Recycle,
    },
    {
      label: 'Flagged Households',
      value: flagged.length,
      detail: flagged.length ? 'Require review' : 'No flagged households',
      icon: TriangleAlert,
    },
  ]

  if (status !== 'connected') {
    return (
      <section className="page-enter flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Backend unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Analytics cannot load until the Spring Boot API is running.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Performance Insights</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Analytics</h1>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading analytics…</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {metricCards.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-moss">
                    <Icon size={16} />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2 text-slate-800">
                <BarChart3 size={18} className="text-moss" />
                <h2 className="text-xl font-semibold">Zone performance</h2>
              </div>

              {zoneMetrics.length ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zoneMetrics.map((zone) => ({ name: zone.name, score: zone.averageScore ?? 0 }))} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average segregation score']}
                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#0d615b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No zone analytics are available yet.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2 text-slate-800">
                <TrendingUp size={18} className="text-moss" />
                <h2 className="text-xl font-semibold">Score distribution</h2>
              </div>

              {pickups.length ? (
                <div className="space-y-4">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distributionData} dataKey="count" nameKey="bucket" innerRadius={44} outerRadius={72} paddingAngle={4}>
                          {distributionData.map((entry) => (
                            <Cell key={entry.bucket} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} pickups`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    {distributionData.map((entry) => (
                      <div key={entry.bucket} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span className="text-sm text-slate-700">{entry.bucket}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Insufficient pickup data for score distribution.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Household score analytics</h2>

              {householdMetrics.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-3 py-3 font-semibold">Household</th>
                        <th className="px-3 py-3 font-semibold">Zone</th>
                        <th className="px-3 py-3 font-semibold">Average score</th>
                        <th className="px-3 py-3 font-semibold">Flagged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {householdMetrics.map((household) => (
                        <tr key={household.id}>
                          <td className="px-3 py-3 text-sm font-medium text-slate-900">
                            <Link to={`/households/${household.id}`} className="text-emerald-700 hover:text-emerald-800">
                              {household.name}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">{household.zoneName}</td>
                          <td className="px-3 py-3 text-sm text-slate-700">
                            {household.averageScore == null ? 'N/A' : `${household.averageScore.toFixed(1)}%`}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${household.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {household.flagged ? 'Flagged' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No household analytics available.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>

              {recentActivity.length ? (
                <div className="mt-5 space-y-3">
                  {recentActivity.map((pickup) => (
                    <div key={pickup.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">{pickup.householdName}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${pickup.status.className}`}>{pickup.status.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(pickup.pickupDateTime)}</p>
                      <p className="mt-2 text-sm font-medium text-slate-700">{pickup.segregationScore}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No recent pickup activity.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
