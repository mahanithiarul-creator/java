import { AlertCircle, CalendarRange, CheckCircle2, Clock3, Plus, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../api/axios'
import { schedulesApi, zonesApi } from '../api/index'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import type { ScheduleResponse, ZoneResponse } from '../types/api'

const dayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const formatDay = (day: string) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()

export function SchedulesPage() {
  usePageTitle('Schedules')
  const { status } = useBackendStatus()

  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState({ zoneId: '', dayOfWeek: '', startTime: '', endTime: '' })

  useEffect(() => {
    if (status !== 'connected') {
      setSchedules([])
      setZones([])
      setLoading(false)
      setError(null)
      return
    }

    let alive = true

    const loadSchedules = async () => {
      setLoading(true)
      setError(null)

      try {
        const [schedulesResult, zonesResult] = await Promise.all([schedulesApi.getAll(), zonesApi.getAll()])

        if (!alive) return

        setSchedules(schedulesResult)
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

    void loadSchedules()

    return () => {
      alive = false
    }
  }, [refreshKey, status])

  const zoneMap = useMemo(() => new Map(zones.map((zone) => [zone.id, zone.zoneName])), [zones])

  const handleCreateSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const zoneId = Number(formState.zoneId)
    const startTime = formState.startTime
    const endTime = formState.endTime

    if (!zoneId || !formState.dayOfWeek || !startTime || !endTime) {
      setSubmitError('Zone, day, start time, and end time are required.')
      return
    }

    if (endTime < startTime) {
      setSubmitError('End time must not be earlier than the start time.')
      return
    }

    try {
      setSaving(true)
      setSubmitError(null)
      setSuccessMessage(null)

      await schedulesApi.create({
        zoneId,
        dayOfWeek: formState.dayOfWeek,
        startTime,
        endTime,
      })

      setShowForm(false)
      setFormState({ zoneId: '', dayOfWeek: '', startTime: '', endTime: '' })
      setSuccessMessage('Schedule created successfully.')
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
          <p className="mt-3 text-sm leading-6 text-slate-500">Schedule data cannot load until the Spring Boot API is running.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">Operational Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Schedules</h1>
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
            Add Schedule
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
            <h2 className="text-lg font-semibold text-slate-900">Add schedule</h2>
            <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="text-sm text-slate-500 hover:text-slate-700">
              Close
            </button>
          </div>

          <form onSubmit={handleCreateSchedule} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="schedule-zone" className="mb-2 block text-sm font-medium text-slate-700">Zone</label>
              <select
                id="schedule-zone"
                value={formState.zoneId}
                onChange={(event) => setFormState((current) => ({ ...current, zoneId: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option value="">Select zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.zoneName}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="schedule-day" className="mb-2 block text-sm font-medium text-slate-700">Day of week</label>
              <select
                id="schedule-day"
                value={formState.dayOfWeek}
                onChange={(event) => setFormState((current) => ({ ...current, dayOfWeek: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option value="">Select day</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>{formatDay(day)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="schedule-start" className="mb-2 block text-sm font-medium text-slate-700">Start time</label>
              <input
                id="schedule-start"
                type="time"
                value={formState.startTime}
                onChange={(event) => setFormState((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="schedule-end" className="mb-2 block text-sm font-medium text-slate-700">End time</label>
              <input
                id="schedule-end"
                type="time"
                value={formState.endTime}
                onChange={(event) => setFormState((current) => ({ ...current, endTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
            </div>

            {submitError ? <div className="md:col-span-2 xl:col-span-4 text-sm text-rose-600">{submitError}</div> : null}

            <div className="md:col-span-2 xl:col-span-4 flex items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? 'Saving…' : 'Save schedule'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSubmitError(null) }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading schedules…</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Schedule ID</th>
                  <th className="px-4 py-3 font-semibold">Zone</th>
                  <th className="px-4 py-3 font-semibold">Day</th>
                  <th className="px-4 py-3 font-semibold">Start Time</th>
                  <th className="px-4 py-3 font-semibold">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {schedules.length ? (
                  schedules.map((schedule) => (
                    <tr key={schedule.id} className="align-middle">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">#{schedule.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <CalendarRange size={14} className="text-moss" />
                          {zoneMap.get(schedule.zoneId) ?? `Zone ${schedule.zoneId}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDay(schedule.dayOfWeek)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={14} className="text-slate-400" />
                          {schedule.startTime}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{schedule.endTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No schedules are available yet.
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
