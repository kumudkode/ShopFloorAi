import { NextResponse } from 'next/server'
import { getWorkers, getWorkerCount } from '@/backend/database'
import { seedDatabase } from '@/backend/seed'

export async function GET() {
  try {
    // Auto-seed if database is empty
    if (getWorkerCount() === 0) {
      seedDatabase()
    }
    
    const workers = getWorkers()
    
    return NextResponse.json({
      success: true,
      count: workers.length,
      workers
    })
  } catch (error) {
    console.error('Error fetching workers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workers' },
      { status: 500 }
    )
  }
}
