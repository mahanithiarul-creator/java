import { AlertCircle, CalendarClock, CheckCircle2, Plus, RefreshCcw, Search, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/axios'
import { householdsApi, pickupsApi } from '../api/index'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { HouseholdResponse, PickupLogResponse } from '../types/api'

const scoreCategory = (score: number) => {
  if (score >= 80) return { label: 'Excellent', className: 'bg-emerald-100 text-emerald-700' }
  if (score >= 60) return { label: 'Good', className: 'bg-amber-100 text-amber-700' }
  if (score >= 40) return { label: 'Needs Improvement', className: 'bg-orange-100 text-orange-700' }
  return { label: 'Low', className: 'bg-rose-100 text-rose-700' }
}

const formatDateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export function PickupsPage() {
  usePageTitle('Pickups')
  const { status } = useBackendStatus()

  const [pickups, setPickups] = useState<PickupLogResponse[]>([])
  const [households, setHouseholds] = useState<HouseholdResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState({ householdId: '', pickupDateTime: '', segregationScore: '' })

  useEffect(() => {
    if (status !== 'connected') {
      setPickups([])
      setHouseholds([])
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadPickups = async () => {
      setLoading(true)
      setError(null)

      try {
        const [pickupsResult, householdsResult] = await Promise.all([pickupsApi.getAll(), householdsApi.getAll()])

        if (!alive) return

        setPickups(pickupsResult)
        setHouseholds(householdsResult)
      } catch (loadError) {
        if (!alive) return
        setError(getApiErrorMessage(loadError))
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    void loadPickups()

    return () => {
      alive = false
    }
  }, [refreshKey, status])

  const householdMap = useMemo(
    () => new Map(households.map((household) => [household.id, household.householdName])),
    [households],
  )

  const filteredPickups = useMemo(() => {
    const term = search.trim().toLowerCase()

    return pickups.filter((pickup) => {
      if (!term) return true

      const householdName = householdMap.get(pickup.householdId) ?? `Household ${pickup.householdId}`
      return householdName.toLowerCase().includes(term) || String(pickup.id).includes(term)
    })
  }, [householdMap, pickups, search])

  const handleCreatePickup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const householdId = Number(formState.householdId)
    const segregationScore = Number(formState.segregationScore)

    if (!householdId || !formState.pickupDateTime) {
      setSubmitError('Household and pickup date/time are required.')
      return
    }

    if (!Number.isInteger(segregationScore) || segregationScore < 0 || segregationScore > 100) {
      setSubmitError('Segregation score must be an integer between 0 and 100.')
      return
    }

    try {
      setSaving(true)
      setSubmitError(null)
      setSuccessMessage(null)

      await pickupsApi.create({
        householdId,
        pickupDateTime: `${formState.pickupDateTime}:00`,
        segregationScore,
      })

      setShowForm(false)
      setFormState({ householdId: '', pickupDateTime: '', segregationScore: '' })
      setSuccessMessage('Pickup recorded successfully.')
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
          <p className="mt-3 text-sm leading-6 text-slate-500">Pickup records cannot load until the Spring Boot API is running.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Collection Records</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Pickup Logs</h1>
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
            Record Pickup
          </button>
        </div>
      </div>

      {successMessage ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {successMessage}
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {showForm ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Record pickup</h2>
            <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="text-sm text-slate-500 hover:text-slate-700">
              Close
            </button>
          </div>

          <form onSubmit={handleCreatePickup} className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="pickup-household" className="mb-2 block text-sm font-medium text-slate-700">Household</label>
              <select
                id="pickup-household"
                value={formState.householdId}
                onChange={(event) => setFormState((current) => ({ ...current, householdId: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option value="">Select household</option>
                {households.map((household) => (
                  <option key={household.id} value={household.id}>{household.householdName}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pickup-datetime" className="mb-2 block text-sm font-medium text-slate-700">Pickup date &amp; time</label>
              <input
                id="pickup-datetime"
                type="datetime-local"
                value={formState.pickupDateTime}
                onChange={(event) => setFormState((current) => ({ ...current, pickupDateTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="pickup-score" className="mb-2 block text-sm font-medium text-slate-700">Segregation score</label>
              <input
                id="pickup-score"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formState.segregationScore}
                onChange={(event) => setFormState((current) => ({ ...current, segregationScore: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="80"
              />
            </div>

            {submitError ? <div className="md:col-span-3 text-sm text-rose-600">{submitError}</div> : null}

            <div className="md:col-span-3 flex items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? 'Saving…' : 'Save pickup'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by household or pickup ID"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading pickup records…</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pickup ID</th>
                  <th className="px-4 py-3 font-semibold">Household</th>
                  <th className="px-4 py-3 font-semibold">Pickup Date/Time</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredPickups.length ? (
                  filteredPickups.map((pickup) => {
                    const householdName = householdMap.get(pickup.householdId) ?? `Household ${pickup.householdId}`
                    const category = scoreCategory(pickup.segregationScore)

                    return (
                      <tr key={pickup.id} className="align-middle">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">#{pickup.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <UserRound size={14} className="text-moss" />
                            {householdName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(pickup.pickupDateTime)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{pickup.segregationScore}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.className}`}>{category.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/households/${pickup.householdId}`} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
                            <CalendarClock size={14} />
                            View household
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No pickup records match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
