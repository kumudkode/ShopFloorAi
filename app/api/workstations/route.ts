import { NextResponse } from 'next/server'
import { getWorkstations, getWorkerCount } from '@/backend/database'
import { seedDatabase } from '@/backend/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Auto-seed if database is empty
    if (getWorkerCount() === 0) {
      seedDatabase()
    }
    
    const workstations = getWorkstations()
    
    return NextResponse.json({
      success: true,
      count: workstations.length,
      workstations
    })
  } catch (error) {
    console.error('Error fetching workstations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workstations' },
      { status: 500 }
    )
  }
}
