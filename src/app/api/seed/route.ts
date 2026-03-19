import { NextResponse } from 'next/server'
import { seedAgents } from '@/lib/seed-agents'
import { seedSkills } from '@/lib/seed-skills'

export async function POST() {
  try {
    const agentCount = await seedAgents()
    const skillCount = await seedSkills()
    return NextResponse.json({
      success: true,
      agents: agentCount,
      skills: skillCount,
      message: `Seeded ${agentCount} agents and ${skillCount} skills`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed' },
      { status: 500 }
    )
  }
}
