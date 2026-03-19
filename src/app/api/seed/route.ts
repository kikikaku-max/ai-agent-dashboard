import { NextResponse } from 'next/server'
import { seedAgents } from '@/lib/seed-agents'

export async function POST() {
  try {
    const count = await seedAgents()
    return NextResponse.json({ success: true, count, message: `Seeded ${count} agents` })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed' },
      { status: 500 }
    )
  }
}
