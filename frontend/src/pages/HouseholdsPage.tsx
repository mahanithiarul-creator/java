import { AlertCircle, ArrowRight, House, Plus, RefreshCcw, Search, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/axios'
import { householdsApi, zonesApi } from '../api/index'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, ZoneResponse } from '../types/api'

export function HouseholdsPage() {
  usePageTitle('Households')
  const { status } = useBackendStatus()

  const [households, setHouseholds] = useState<HouseholdResponse[]>([])
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formState, setFormState] = useState({ householdName: '', address: '', zoneId: '' })

  useEffect(() => {
    if (status !== 'connected') {
      setHouseholds([])
      setZones([])
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadHouseholds = async () => {
      setLoading(true)
      setError(null)

      try {
        const [householdsResult, zonesResult] = await Promise.all([
          householdsApi.getAll(),
          zonesApi.getAll(),
        ])

        if (!alive) return

        setHouseholds(householdsResult)
        setZones(zonesResult)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadHouseholds()

    return () => {
      alive = false
    }
  }, [refreshKey, status])

  const zoneLookup = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.zoneName])),
    [zones],
  )

  const filteredHouseholds = useMemo(() => {
    const term = search.trim().toLowerCase()

    return households.filter((household) => {
      const matchesZone = zoneFilter === 'all' || String(household.zoneId) === zoneFilter
      const matchesSearch =
        !term ||
        household.householdName.toLowerCase().includes(term) ||
        household.address.toLowerCase().includes(term)

      return matchesZone && matchesSearch
    })
  }, [households, search, zoneFilter])

  const handleCreateHousehold = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const householdName = formState.householdName.trim()
    const address = formState.address.trim()
    const zoneId = Number(formState.zoneId)

    if (!householdName || !address || !zoneId) {
      setSubmitError('Please complete all fields before creating a household.')
      return
    }

    try {
      setSaving(true)
      setSubmitError(null)
      await householdsApi.create({ householdName, address, zoneId })
      setFormState({ householdName: '', address: '', zoneId: '' })
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
          <p className="mt-3 text-sm leading-6 text-slate-500">Household data requires the Spring Boot backend to be online.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Service Households</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Households</h1>
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
            Add Household
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {showForm ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Create a new household</h2>
            <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="text-sm text-slate-500 hover:text-slate-700">
              Close
            </button>
          </div>

          <form onSubmit={handleCreateHousehold} className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label htmlFor="household-name" className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input id="household-name" value={formState.householdName} onChange={(event) => setFormState((value) => ({ ...value, householdName: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:bg-white" placeholder="Green Residence" />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="household-address" className="mb-2 block text-sm font-medium text-slate-700">Address</label>
              <input id="household-address" value={formState.address} onChange={(event) => setFormState((value) => ({ ...value, address: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:bg-white" placeholder="12 Maple Street" />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="household-zone" className="mb-2 block text-sm font-medium text-slate-700">Zone</label>
              <select id="household-zone" value={formState.zoneId} onChange={(event) => setFormState((value) => ({ ...value, zoneId: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:bg-white">
                <option value="">Select zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.zoneName}</option>
                ))}
              </select>
            </div>

            {submitError ? <div className="md:col-span-3 text-sm text-rose-600">{submitError}</div> : null}

            <div className="md:col-span-3 flex items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? 'Saving…' : 'Save household'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
            />
          </div>

          <select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white">
            <option value="all">All zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={String(zone.id)}>{zone.zoneName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading households…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredHouseholds.length ? (
            filteredHouseholds.map((household) => (
              <div key={household.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                      <House size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{household.householdName}</h2>
                      <p className="text-sm text-slate-500">{zoneLookup.get(household.zoneId) ?? `Zone ${household.zoneId}`}</p>
                    </div>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${household.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {household.flagged ? 'Flagged' : 'Healthy'}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{household.address}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                    {household.flagged ? <TriangleAlert size={14} className="text-rose-500" /> : null}
                    {household.flagged ? 'Attention required' : 'In compliance'}
                  </div>

                  <Link to={`/households/${household.id}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                    View details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 shadow-sm">
              No households match the current search.
            </div>
          )}
        </div>
      )}
    </section>
  )
}
