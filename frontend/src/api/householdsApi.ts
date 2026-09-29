import { apiClient, normalizeApiError } from './axios'
import type { CreateHouseholdRequest, HouseholdResponse } from '../types/api'

export const householdsApi = {
  getAll: async (): Promise<HouseholdResponse[]> => {
    try {
      const response = await apiClient.get<HouseholdResponse[]>('/api/households')
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getById: async (id: number): Promise<HouseholdResponse> => {
    try {
      const response = await apiClient.get<HouseholdResponse>(`/api/households/${id}`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getByZone: async (zoneId: number): Promise<HouseholdResponse[]> => {
    try {
      const response = await apiClient.get<HouseholdResponse[]>(`/api/households/zone/${zoneId}`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getFlagged: async (): Promise<HouseholdResponse[]> => {
    try {
      const response = await apiClient.get<HouseholdResponse[]>('/api/households/flagged')
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  create: async (payload: CreateHouseholdRequest): Promise<HouseholdResponse> => {
    try {
      const response = await apiClient.post<HouseholdResponse>('/api/households', payload)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },
}
