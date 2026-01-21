export interface Worker {
  worker_id: string
  name: string
  created_at: string
}

export interface Workstation {
  station_id: string
  name: string
  type: string
  created_at: string
}

export type EventType = 'working' | 'idle' | 'absent' | 'product_count'

export interface AIEvent {
  id?: number
  timestamp: string
  worker_id: string
  workstation_id: string
  event_type: EventType
  confidence: number
  count?: number // For product_count events
  created_at?: string
}

export interface WorkerMetrics {
  worker_id: string
  name: string
  total_active_time_minutes: number
  total_idle_time_minutes: number
  utilization_percentage: number
  total_units_produced: number
  units_per_hour: number
  status: 'active' | 'idle' | 'absent'
  current_station?: string
}

export interface WorkstationMetrics {
  station_id: string
  name: string
  type: string
  occupancy_time_minutes: number
  utilization_percentage: number
  total_units_produced: number
  throughput_rate: number // units per hour
  current_worker?: string
  status: 'occupied' | 'vacant'
}

export interface FactoryMetrics {
  total_productive_time_minutes: number
  total_production_count: number
  average_production_rate: number // units per hour across all
  average_worker_utilization: number
  active_workers: number
  total_workers: number
  occupied_stations: number
  total_stations: number
}

export interface DashboardData {
  factory: FactoryMetrics
  workers: WorkerMetrics[]
  workstations: WorkstationMetrics[]
  last_updated: string
}

export interface EventIngestionRequest {
  timestamp: string
  worker_id: string
  workstation_id: string
  event_type: EventType
  confidence: number
  count?: number
}

export interface EventIngestionResponse {
  success: boolean
  event_id?: number
  message?: string
}

export interface SeedDataResponse {
  success: boolean
  message: string
  workers_created: number
  workstations_created: number
  events_created: number
}
