import { apiClient, normalizeApiError } from './axios'
import type { AverageScoreResponse } from '../types/api'

export const analyticsApi = {
  getHouseholdAverageScore: async (householdId: number): Promise<AverageScoreResponse> => {
    try {
      const response = await apiClient.get<AverageScoreResponse>(`/api/analytics/households/${householdId}/average-score`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },

  getZoneAverageScore: async (zoneId: number): Promise<AverageScoreResponse> => {
    try {
      const response = await apiClient.get<AverageScoreResponse>(`/api/analytics/zones/${zoneId}/average-score`)
      return response.data
    } catch (error) {
      throw normalizeApiError(error)
    }
  },
}
