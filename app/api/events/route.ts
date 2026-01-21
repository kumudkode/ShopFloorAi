import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getEvents, getWorkerById, getWorkstationById, getWorkerCount } from '@/backend/database'
import { seedDatabase } from '@/backend/seed'
import type { EventIngestionRequest, EventType } from '@/backend/types'

const VALID_EVENT_TYPES: EventType[] = ['working', 'idle', 'absent', 'product_count']

export async function POST(request: NextRequest) {
  try {
    const body: EventIngestionRequest = await request.json()
    
    // Validate required fields
    if (!body.timestamp || !body.worker_id || !body.workstation_id || !body.event_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: timestamp, worker_id, workstation_id, event_type' 
        },
        { status: 400 }
      )
    }

    // Validate event type
    if (!VALID_EVENT_TYPES.includes(body.event_type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validate confidence score
    if (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1) {
      return NextResponse.json(
        { success: false, error: 'Confidence must be a number between 0 and 1' },
        { status: 400 }
      )
    }

    // Validate count for product_count events
    if (body.event_type === 'product_count') {
      if (typeof body.count !== 'number' || body.count < 0) {
        return NextResponse.json(
          { success: false, error: 'product_count events require a non-negative count value' },
          { status: 400 }
        )
      }
    }

    // Auto-seed if database is empty (ensures workers/stations exist)
    if (getWorkerCount() === 0) {
      seedDatabase()
    }

    // Validate worker exists
    if (!getWorkerById(body.worker_id)) {
      return NextResponse.json(
        { success: false, error: `Worker ${body.worker_id} not found` },
        { status: 404 }
      )
    }

    // Validate workstation exists
    if (!getWorkstationById(body.workstation_id)) {
      return NextResponse.json(
        { success: false, error: `Workstation ${body.workstation_id} not found` },
        { status: 404 }
      )
    }

    // Create the event
    const event = createEvent({
      timestamp: body.timestamp,
      worker_id: body.worker_id,
      workstation_id: body.workstation_id,
      event_type: body.event_type,
      confidence: body.confidence,
      count: body.count
    })

    return NextResponse.json({
      success: true,
      event_id: event.id,
      message: 'Event ingested successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error ingesting event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to ingest event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      worker_id: searchParams.get('worker_id') || undefined,
      workstation_id: searchParams.get('workstation_id') || undefined,
      event_type: (searchParams.get('event_type') as EventType) || undefined,
      start_time: searchParams.get('start_time') || undefined,
      end_time: searchParams.get('end_time') || undefined
    }

    // Auto-seed if database is empty
    if (getWorkerCount() === 0) {
      seedDatabase()
    }

    const events = getEvents(filters)

    return NextResponse.json({
      success: true,
      count: events.length,
      events
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
