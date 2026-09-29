import { apiClient, normalizeApiError } from './axios'
import type { CreateScheduleRequest, ScheduleResponse } from '../types/api'

export const schedulesApi = {
  getAll: async (): Promise<ScheduleResponse[]> => {
    try {
      const response = await apiClient.get<ScheduleResponse[]>('/api/schedules')
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getByZone: async (zoneId: number): Promise<ScheduleResponse[]> => {
    try {
      const response = await apiClient.get<ScheduleResponse[]>(`/api/schedules/zone/${zoneId}`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  create: async (payload: CreateScheduleRequest): Promise<ScheduleResponse> => {
    try {
      const response = await apiClient.post<ScheduleResponse>('/api/schedules', payload)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },
}
