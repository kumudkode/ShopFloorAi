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
  throughput_rate: number
  current_worker?: string
  status: 'occupied' | 'vacant'
}

export interface FactoryMetrics {
  total_productive_time_minutes: number
  total_production_count: number
  average_production_rate: number
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

export interface DashboardFilters {
  search: string
  workerId: string | null
  stationId: string | null
}
