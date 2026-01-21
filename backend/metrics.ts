import type { 
  WorkerMetrics, 
  WorkstationMetrics, 
  FactoryMetrics, 
  DashboardData 
} from './types'
import { 
  getWorkers, 
  getWorkstations, 
  getEvents, 
  getLatestEventByWorker,
  getLatestEventByStation
} from './database'

// Constants for metrics calculation
const SHIFT_DURATION_HOURS = 8
const SHIFT_DURATION_MINUTES = SHIFT_DURATION_HOURS * 60

/**
 * Calculate metrics for a single worker
 * 
 * Assumptions:
 * - Time between events represents the duration of the previous event's state
 * - If last event is 'working', assume still working until current time or shift end
 * - Product count events are instantaneous and don't affect time calculations
 */
export function computeWorkerMetrics(workerId: string): WorkerMetrics | null {
  const workers = getWorkers()
  const worker = workers.find(w => w.worker_id === workerId)
  if (!worker) return null

  const events = getEvents({ worker_id: workerId })
  
  if (events.length === 0) {
    return {
      worker_id: workerId,
      name: worker.name,
      total_active_time_minutes: 0,
      total_idle_time_minutes: 0,
      utilization_percentage: 0,
      total_units_produced: 0,
      units_per_hour: 0,
      status: 'absent',
      current_station: undefined
    }
  }

  let activeTimeMs = 0
  let idleTimeMs = 0
  let totalUnits = 0

  // Process events to calculate time spent in each state
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const nextEvent = events[i + 1]
    
    // Count production
    if (event.event_type === 'product_count' && event.count) {
      totalUnits += event.count
      continue // Product count doesn't affect time calculation
    }

    // Calculate duration until next event or current time
    const eventTime = new Date(event.timestamp).getTime()
    const endTime = nextEvent 
      ? new Date(nextEvent.timestamp).getTime()
      : Date.now()
    
    const duration = endTime - eventTime

    if (event.event_type === 'working') {
      activeTimeMs += duration
    } else if (event.event_type === 'idle' || event.event_type === 'absent') {
      idleTimeMs += duration
    }
  }

  const activeTimeMinutes = Math.round(activeTimeMs / (1000 * 60))
  const idleTimeMinutes = Math.round(idleTimeMs / (1000 * 60))
  const totalTimeMinutes = activeTimeMinutes + idleTimeMinutes
  
  // Calculate utilization as percentage of active time vs total tracked time
  const utilization = totalTimeMinutes > 0 
    ? (activeTimeMinutes / totalTimeMinutes) * 100 
    : 0

  // Units per hour calculation
  const hoursWorked = activeTimeMinutes / 60
  const unitsPerHour = hoursWorked > 0 ? totalUnits / hoursWorked : 0

  // Get current status from latest event
  const latestEvent = getLatestEventByWorker(workerId)
  const status = latestEvent?.event_type === 'working' ? 'active' 
    : latestEvent?.event_type === 'idle' ? 'idle' 
    : 'absent'

  return {
    worker_id: workerId,
    name: worker.name,
    total_active_time_minutes: activeTimeMinutes,
    total_idle_time_minutes: idleTimeMinutes,
    utilization_percentage: Math.round(utilization * 10) / 10,
    total_units_produced: totalUnits,
    units_per_hour: Math.round(unitsPerHour * 10) / 10,
    status,
    current_station: latestEvent?.workstation_id
  }
}

/**
 * Calculate metrics for a single workstation
 * 
 * Assumptions:
 * - Occupancy time is when any worker is at the station (working or idle)
 * - Utilization is active working time at the station
 * - Throughput is units produced at this station per hour of occupancy
 */
export function computeWorkstationMetrics(stationId: string): WorkstationMetrics | null {
  const stations = getWorkstations()
  const station = stations.find(s => s.station_id === stationId)
  if (!station) return null

  const events = getEvents({ workstation_id: stationId })
  
  if (events.length === 0) {
    return {
      station_id: stationId,
      name: station.name,
      type: station.type,
      occupancy_time_minutes: 0,
      utilization_percentage: 0,
      total_units_produced: 0,
      throughput_rate: 0,
      current_worker: undefined,
      status: 'vacant'
    }
  }

  let occupancyTimeMs = 0
  let activeTimeMs = 0
  let totalUnits = 0

  // Process events
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const nextEvent = events[i + 1]
    
    if (event.event_type === 'product_count' && event.count) {
      totalUnits += event.count
      continue
    }

    const eventTime = new Date(event.timestamp).getTime()
    const endTime = nextEvent 
      ? new Date(nextEvent.timestamp).getTime()
      : Date.now()
    
    const duration = endTime - eventTime

    // Station is occupied when worker is working or idle there
    if (event.event_type === 'working' || event.event_type === 'idle') {
      occupancyTimeMs += duration
    }
    
    if (event.event_type === 'working') {
      activeTimeMs += duration
    }
  }

  const occupancyMinutes = Math.round(occupancyTimeMs / (1000 * 60))
  const activeMinutes = Math.round(activeTimeMs / (1000 * 60))
  
  // Utilization as percentage of shift that station was productively used
  const utilization = SHIFT_DURATION_MINUTES > 0 
    ? (activeMinutes / SHIFT_DURATION_MINUTES) * 100 
    : 0

  // Throughput rate (units per hour of occupancy)
  const occupancyHours = occupancyMinutes / 60
  const throughputRate = occupancyHours > 0 ? totalUnits / occupancyHours : 0

  // Get current status
  const latestEvent = getLatestEventByStation(stationId)
  const isOccupied = latestEvent && 
    (latestEvent.event_type === 'working' || latestEvent.event_type === 'idle')

  return {
    station_id: stationId,
    name: station.name,
    type: station.type,
    occupancy_time_minutes: occupancyMinutes,
    utilization_percentage: Math.round(utilization * 10) / 10,
    total_units_produced: totalUnits,
    throughput_rate: Math.round(throughputRate * 10) / 10,
    current_worker: isOccupied ? latestEvent.worker_id : undefined,
    status: isOccupied ? 'occupied' : 'vacant'
  }
}

/**
 * Calculate factory-wide metrics
 */
export function computeFactoryMetrics(): FactoryMetrics {
  const workers = getWorkers()
  const stations = getWorkstations()
  
  const workerMetrics = workers
    .map(w => computeWorkerMetrics(w.worker_id))
    .filter((m): m is WorkerMetrics => m !== null)
  
  const stationMetrics = stations
    .map(s => computeWorkstationMetrics(s.station_id))
    .filter((m): m is WorkstationMetrics => m !== null)

  // Aggregate metrics
  const totalProductiveTime = workerMetrics.reduce(
    (sum, w) => sum + w.total_active_time_minutes, 0
  )
  
  const totalProduction = workerMetrics.reduce(
    (sum, w) => sum + w.total_units_produced, 0
  )
  
  const avgUtilization = workerMetrics.length > 0
    ? workerMetrics.reduce((sum, w) => sum + w.utilization_percentage, 0) / workerMetrics.length
    : 0

  const activeWorkers = workerMetrics.filter(w => w.status === 'active').length
  const occupiedStations = stationMetrics.filter(s => s.status === 'occupied').length

  // Average production rate across all workers (units/hour)
  const totalHoursWorked = totalProductiveTime / 60
  const avgProductionRate = totalHoursWorked > 0 
    ? totalProduction / totalHoursWorked 
    : 0

  return {
    total_productive_time_minutes: totalProductiveTime,
    total_production_count: totalProduction,
    average_production_rate: Math.round(avgProductionRate * 10) / 10,
    average_worker_utilization: Math.round(avgUtilization * 10) / 10,
    active_workers: activeWorkers,
    total_workers: workers.length,
    occupied_stations: occupiedStations,
    total_stations: stations.length
  }
}

/**
 * Get complete dashboard data
 */
export function getDashboardData(): DashboardData {
  const workers = getWorkers()
  const stations = getWorkstations()

  return {
    factory: computeFactoryMetrics(),
    workers: workers
      .map(w => computeWorkerMetrics(w.worker_id))
      .filter((m): m is WorkerMetrics => m !== null),
    workstations: stations
      .map(s => computeWorkstationMetrics(s.station_id))
      .filter((m): m is WorkstationMetrics => m !== null),
    last_updated: new Date().toISOString()
  }
}
