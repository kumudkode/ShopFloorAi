import type { Worker, Workstation, EventType } from './types'
import {
  initializeDatabase,
  createWorker,
  createWorkstation,
  createEvent,
  clearAllData,
  getWorkerCount,
  getWorkstationCount,
  getEventCount
} from './database'

// Sample workers
const sampleWorkers: Worker[] = [
  { worker_id: 'W1', name: 'Maria Garcia', created_at: new Date().toISOString() },
  { worker_id: 'W2', name: 'James Chen', created_at: new Date().toISOString() },
  { worker_id: 'W3', name: 'Sarah Johnson', created_at: new Date().toISOString() },
  { worker_id: 'W4', name: 'Michael Brown', created_at: new Date().toISOString() },
  { worker_id: 'W5', name: 'Emily Davis', created_at: new Date().toISOString() },
  { worker_id: 'W6', name: 'David Wilson', created_at: new Date().toISOString() },
]

// Sample workstations
const sampleWorkstations: Workstation[] = [
  { station_id: 'S1', name: 'Assembly Line A', type: 'Assembly', created_at: new Date().toISOString() },
  { station_id: 'S2', name: 'Assembly Line B', type: 'Assembly', created_at: new Date().toISOString() },
  { station_id: 'S3', name: 'Quality Check 1', type: 'QC', created_at: new Date().toISOString() },
  { station_id: 'S4', name: 'Packaging Station', type: 'Packaging', created_at: new Date().toISOString() },
  { station_id: 'S5', name: 'Welding Bay', type: 'Welding', created_at: new Date().toISOString() },
  { station_id: 'S6', name: 'CNC Machine 1', type: 'CNC', created_at: new Date().toISOString() },
]

// Generate realistic events for a shift (8 hours)
function generateShiftEvents() {
  const baseDate = new Date()
  baseDate.setHours(6, 0, 0, 0) // Start of shift at 6 AM

  const events: Array<{
    timestamp: string
    worker_id: string
    workstation_id: string
    event_type: EventType
    confidence: number
    count?: number
  }> = []

  // Assign workers to stations with some movement
  const workerStationAssignments = [
    { worker: 'W1', stations: ['S1', 'S3'] },
    { worker: 'W2', stations: ['S2'] },
    { worker: 'W3', stations: ['S3', 'S4'] },
    { worker: 'W4', stations: ['S4', 'S5'] },
    { worker: 'W5', stations: ['S5'] },
    { worker: 'W6', stations: ['S6', 'S1'] },
  ]

  // Generate events for each worker throughout the shift
  for (const assignment of workerStationAssignments) {
    let currentTime = new Date(baseDate)
    const shiftEnd = new Date(baseDate)
    shiftEnd.setHours(14, 0, 0, 0) // 8-hour shift

    let stationIndex = 0
    let currentStation = assignment.stations[stationIndex]

    while (currentTime < shiftEnd) {
      // Determine event type based on time and randomness
      const hour = currentTime.getHours()
      const random = Math.random()

      let eventType: EventType
      let count: number | undefined

      // Break times: 10:00-10:15, 12:00-12:30
      const isBreakTime =
        (hour === 10 && currentTime.getMinutes() < 15) ||
        (hour === 12 && currentTime.getMinutes() < 30)

      if (isBreakTime) {
        eventType = 'idle'
      } else if (random < 0.75) {
        eventType = 'working'
      } else if (random < 0.85) {
        eventType = 'idle'
      } else if (random < 0.95) {
        eventType = 'product_count'
        count = Math.floor(Math.random() * 5) + 1
      } else {
        // Small chance of being absent/away
        eventType = 'absent'
      }

      // Add the event
      events.push({
        timestamp: currentTime.toISOString(),
        worker_id: assignment.worker,
        workstation_id: currentStation,
        event_type: eventType,
        confidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
        count: count,
      })

      // Move time forward (5-15 minute intervals)
      const minutesToAdd = 5 + Math.floor(Math.random() * 10)
      currentTime.setMinutes(currentTime.getMinutes() + minutesToAdd)

      // Occasionally switch stations (every ~2 hours)
      if (Math.random() < 0.05 && assignment.stations.length > 1) {
        stationIndex = (stationIndex + 1) % assignment.stations.length
        currentStation = assignment.stations[stationIndex]
      }
    }
  }

  // Sort events by timestamp
  return events.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

export function seedDatabase() {
  // Ensure tables exist but DON'T wipe them in initializeDatabase
  initializeDatabase()

  // Explicitly wipe data for a fresh seed (intended behavior for "Refresh Data")
  clearAllData()

  // Create workers
  for (const worker of sampleWorkers) {
    createWorker(worker)
  }

  // Create workstations
  for (const station of sampleWorkstations) {
    createWorkstation(station)
  }

  // Generate and insert events
  const events = generateShiftEvents()
  for (const event of events) {
    createEvent(event)
  }

  return {
    success: true,
    message: 'Database seeded successfully',
    workers_created: getWorkerCount(),
    workstations_created: getWorkstationCount(),
    events_created: getEventCount()
  }
}

export function refreshData() {
  return seedDatabase()
}
