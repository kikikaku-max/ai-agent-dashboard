import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { createMission } from '@/lib/db'
import { executeMission } from '@/lib/mission-runner'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, input } = body

    if (!title || !input) {
      return NextResponse.json(
        { error: 'title and input are required' },
        { status: 400 }
      )
    }

    // Chain missions always start with secretary
    const missionId = uuid()
    await createMission({
      id: missionId,
      title: `🔗 ${title}`,
      description: 'Chain mission — เลขาจะวิเคราะห์และแบ่งงานให้ทีม',
      agent_id: 'secretary',
      input,
      priority: 7,
      status: 'pending',
    })

    // Execute secretary mission (which will trigger chain automatically)
    executeMission(missionId).catch(console.error)

    return NextResponse.json({
      mission_id: missionId,
      status: 'pending',
      type: 'chain',
      message: 'Chain mission created — secretary will analyze and delegate',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create chain mission' },
      { status: 500 }
    )
  }
}
