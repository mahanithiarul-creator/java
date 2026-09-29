import { apiClient, normalizeApiError } from './axios'
import type { CreateZoneRequest, ZoneResponse } from '../types/api'

export const zonesApi = {
  getAll: async (): Promise<ZoneResponse[]> => {
    try {
      const response = await apiClient.get<ZoneResponse[]>('/api/zones')
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getById: async (id: number): Promise<ZoneResponse> => {
    try {
      const response = await apiClient.get<ZoneResponse>(`/api/zones/${id}`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  create: async (payload: CreateZoneRequest): Promise<ZoneResponse> => {
    try {
      const response = await apiClient.post<ZoneResponse>('/api/zones', payload)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },
}
