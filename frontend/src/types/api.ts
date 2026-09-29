export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
}

export interface ZoneResponse {
  id: number
  zoneName: string
}

export interface CreateZoneRequest {
  zoneName: string
}

export interface HouseholdResponse {
  id: number
  householdName: string
  address: string
  flagged: boolean
  zoneId: number
}

export interface CreateHouseholdRequest {
  householdName: string
  address: string
  zoneId: number
}

export interface ScheduleResponse {
  id: number
  zoneId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface CreateScheduleRequest {
  zoneId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface PickupLogResponse {
  id: number
  householdId: number
  pickupDateTime: string
  segregationScore: number
}

export interface CreatePickupRequest {
  householdId: number
  pickupDateTime: string
  segregationScore: number
}

export interface AverageScoreResponse {
  id: number
  name: string
  averageScore: number | null
}
