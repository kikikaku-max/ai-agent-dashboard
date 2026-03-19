import { NextResponse } from 'next/server'
import { listAgents, getStats } from '@/lib/db'

export async function GET() {
  try {
    const agents = await listAgents()
    const stats = await getStats()
    return NextResponse.json({ agents, stats })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list agents' },
      { status: 500 }
    )
  }
}
