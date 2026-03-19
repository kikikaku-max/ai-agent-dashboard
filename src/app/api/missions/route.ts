import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { listMissions, createMission, getChildMissions } from '@/lib/db'
import { executeMission } from '@/lib/mission-runner'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('agent_id') || undefined
    const parentId = searchParams.get('parent_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (parentId) {
      const missions = await getChildMissions(parentId)
      return NextResponse.json({ missions })
    }

    const missions = await listMissions(limit, agentId)
    return NextResponse.json({ missions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list missions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, title, input, priority = 5, description = '' } = body

    if (!agent_id || !title || !input) {
      return NextResponse.json(
        { error: 'agent_id, title, and input are required' },
        { status: 400 }
      )
    }

    const missionId = uuid()
    await createMission({
      id: missionId,
      title,
      description,
      agent_id,
      input,
      priority,
      status: 'pending',
    })

    executeMission(missionId).catch(console.error)

    return NextResponse.json({
      mission_id: missionId,
      status: 'pending',
      message: 'Mission created and execution started',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create mission' },
      { status: 500 }
    )
  }
}
