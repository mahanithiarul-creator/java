import { apiClient, normalizeApiError } from './axios'
import type { CreatePickupRequest, PickupLogResponse } from '../types/api'

export const pickupsApi = {
  getAll: async (): Promise<PickupLogResponse[]> => {
    try {
      const response = await apiClient.get<PickupLogResponse[]>('/api/pickups')
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getByHousehold: async (householdId: number): Promise<PickupLogResponse[]> => {
    try {
      const response = await apiClient.get<PickupLogResponse[]>(`/api/pickups/household/${householdId}`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  create: async (payload: CreatePickupRequest): Promise<PickupLogResponse> => {
    try {
      const response = await apiClient.post<PickupLogResponse>('/api/pickups', payload)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },
}
