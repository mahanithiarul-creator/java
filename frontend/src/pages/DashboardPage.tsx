import { AlertTriangle, Home, Map as MapIcon, Recycle, RefreshCcw, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { analyticsApi, householdsApi, pickupsApi, zonesApi } from '../api/index'
import { FlaggedHouseholds } from '../components/dashboard/FlaggedHouseholds'
import { QuickActions } from '../components/dashboard/QuickActions'
import { RecentPickups } from '../components/dashboard/RecentPickups'
import { StatCard } from '../components/dashboard/StatCard'
import { ZonePerformanceChart } from '../components/dashboard/ZonePerformanceChart'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, PickupLogResponse, ZoneResponse } from '../types/api'

interface SectionErrors {
  zones?: string
  households?: string
  pickups?: string
  chart?: string
  flagged?: string
}

interface ZoneAnalyticsItem {
  id: number
  name: string
  averageScore: number | null
}

export function DashboardPage() {
  usePageTitle('Dashboard')
  const { status } = useBackendStatus()

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [households, setHouseholds] = useState<HouseholdResponse[]>([])
  const [pickups, setPickups] = useState<PickupLogResponse[]>([])
  const [flaggedHouseholds, setFlaggedHouseholds] = useState<HouseholdResponse[]>([])
  const [zoneAnalytics, setZoneAnalytics] = useState<ZoneAnalyticsItem[]>([])
  const [flaggedAverageScores, setFlaggedAverageScores] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState({ zones: true, households: true, pickups: true, chart: true, flagged: true })
  const [errors, setErrors] = useState<SectionErrors>({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status !== 'connected') {
      setZones([])
      setHouseholds([])
      setPickups([])
      setFlaggedHouseholds([])
      setZoneAnalytics([])
      setFlaggedAverageScores({})
      setLoading({ zones: false, households: false, pickups: false, chart: false, flagged: false })
      setErrors({})
      return
    }

    let cancelled = false

    const loadDashboard = async () => {
      setLoading({ zones: true, households: true, pickups: true, chart: true, flagged: true })
      setErrors({})

      const [zonesResult, householdsResult, pickupsResult, flaggedResult] = await Promise.allSettled([
        zonesApi.getAll(),
        householdsApi.getAll(),
        pickupsApi.getAll(),
        householdsApi.getFlagged(),
      ])

      if (cancelled) return

      if (zonesResult.status === 'fulfilled') {
        setZones(zonesResult.value)
      } else {
        setErrors((prev) => ({ ...prev, zones: zonesResult.reason?.message ?? 'Unable to load zones.' }))
      }

      if (householdsResult.status === 'fulfilled') {
        setHouseholds(householdsResult.value)
      } else {
        setErrors((prev) => ({ ...prev, households: householdsResult.reason?.message ?? 'Unable to load households.' }))
      }

      if (pickupsResult.status === 'fulfilled') {
        setPickups(pickupsResult.value)
      } else {
        setErrors((prev) => ({ ...prev, pickups: pickupsResult.reason?.message ?? 'Unable to load pickup activity.' }))
      }

      if (flaggedResult.status === 'fulfilled') {
        setFlaggedHouseholds(flaggedResult.value)
      } else {
        setErrors((prev) => ({ ...prev, flagged: flaggedResult.reason?.message ?? 'Unable to load flagged households.' }))
      }

      setLoading((prev) => ({ ...prev, zones: false, households: false, pickups: false, flagged: false }))

      const chartZones = zonesResult.status === 'fulfilled' ? zonesResult.value : []
      if (chartZones.length) {
        const chartResults = await Promise.allSettled(
          chartZones.map(async (zone) => {
            const analytics = await analyticsApi.getZoneAverageScore(zone.id)
            return {
              id: zone.id,
              name: zone.zoneName,
              averageScore: analytics.averageScore,
            }
          }),
        )

        if (!cancelled) {
          const resolved = chartResults
            .filter((result): result is PromiseFulfilledResult<ZoneAnalyticsItem> => result.status === 'fulfilled')
            .map((result) => result.value)

          setZoneAnalytics(resolved)

          const rejected = chartResults.find((result) => result.status === 'rejected')
          if (rejected) {
            setErrors((prev) => ({ ...prev, chart: rejected.reason?.message ?? 'Unable to load zone analytics.' }))
          }
        }
      } else {
        setZoneAnalytics([])
      }

      setLoading((prev) => ({ ...prev, chart: false }))

      if (flaggedResult.status === 'fulfilled' && flaggedResult.value.length) {
        const flaggedAnalyticsResults = await Promise.allSettled(
          flaggedResult.value.map(async (household) => {
            const analytics = await analyticsApi.getHouseholdAverageScore(household.id)
            return { id: household.id, averageScore: analytics.averageScore }
          }),
        )

        if (!cancelled) {
          const averages: Record<number, number | null> = {}
          flaggedAnalyticsResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              averages[result.value.id] = result.value.averageScore
            }
          })
          setFlaggedAverageScores(averages)

          const rejected = flaggedAnalyticsResults.find((result) => result.status === 'rejected')
          if (rejected) {
            setErrors((prev) => ({ ...prev, flagged: rejected.reason?.message ?? 'Unable to load flagged household analytics.' }))
          }
        }
      } else {
        setFlaggedAverageScores({})
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [status, refreshKey])

  const householdNames = useMemo(
    () => new Map(households.map((household) => [household.id, household.householdName])),
    [households],
  )

  const recentPickups = useMemo(
    () =>
      [...pickups]
        .sort((a, b) => new Date(b.pickupDateTime).getTime() - new Date(a.pickupDateTime).getTime())
        .slice(0, 6)
        .map((pickup) => ({
          ...pickup,
          householdName: householdNames.get(pickup.householdId) ?? `Household ${pickup.householdId}`,
        })),
    [householdNames, pickups],
  )

  const averageScore = useMemo(() => {
    if (!pickups.length) return null
    const total = pickups.reduce((sum, pickup) => sum + pickup.segregationScore, 0)
    return total / pickups.length
  }, [pickups])

  const chartData = useMemo(
    () => zoneAnalytics.map((item) => ({ zone: item.name, score: item.averageScore ?? 0 })),
    [zoneAnalytics],
  )

  const flaggedList = useMemo(
    () =>
      flaggedHouseholds.map((household) => ({
        ...household,
        averageScore: flaggedAverageScores[household.id] ?? null,
      })),
    [flaggedAverageScores, flaggedHouseholds],
  )

  if (status !== 'connected') {
    return (
      <section className="page-enter flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Backend unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Make sure Spring Boot is running on http://localhost:8080.</p>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Smart Waste Collection &amp; Segregation Tracker</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Waste Management Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor collection activity, segregation performance, and households requiring attention.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Zones"
          value={loading.zones ? 'Loading…' : String(zones.length)}
          detail={zones.length ? 'Operational coverage areas' : 'No zones available'}
          icon={MapIcon}
          loading={loading.zones}
        />
        <StatCard
          title="Total Households"
          value={loading.households ? 'Loading…' : String(households.length)}
          detail={households.length ? 'Tracked service households' : 'No households available'}
          icon={Home}
          loading={loading.households}
        />
        <StatCard
          title="Total Pickups"
          value={loading.pickups ? 'Loading…' : String(pickups.length)}
          detail={pickups.length ? 'Pickup records collected' : 'No pickup records yet'}
          icon={Truck}
          loading={loading.pickups}
        />
        <StatCard
          title="Average Segregation Score"
          value={loading.pickups ? 'Loading…' : averageScore == null ? 'Unavailable' : `${averageScore.toFixed(1)}%`}
          detail={averageScore == null ? 'No pickup score data yet' : 'Across all recorded pickups'}
          icon={Recycle}
          loading={loading.pickups}
        />
        <StatCard
          title="Flagged Households"
          value={loading.flagged ? 'Loading…' : String(flaggedHouseholds.length)}
          detail={flaggedHouseholds.length ? 'Require follow-up review' : 'No flagged households'}
          icon={AlertTriangle}
          loading={loading.flagged}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <ZonePerformanceChart
          data={chartData}
          loading={loading.chart}
          error={errors.chart}
          onRetry={() => setRefreshKey((value) => value + 1)}
        />
        <QuickActions />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1.1fr]">
        <RecentPickups
          pickups={recentPickups}
          loading={loading.pickups}
          error={errors.pickups}
          onRetry={() => setRefreshKey((value) => value + 1)}
        />
        <FlaggedHouseholds
          flagged={flaggedList}
          loading={loading.flagged}
          error={errors.flagged}
          onRetry={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    </section>
  )
}
