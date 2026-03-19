import { NextRequest, NextResponse } from 'next/server'
import { getAgent, updateAgent, listMissions } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  try {
    const agent = await getAgent(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    const missions = await listMissions(20, agentId)
    return NextResponse.json({ agent, missions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get agent' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  try {
    const body = await req.json()
    const allowedFields = ['personality', 'system_prompt', 'model', 'effort_level', 'skills', 'config', 'status', 'avatar_url']
    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key]
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    await updateAgent(agentId, updates)
    const agent = await getAgent(agentId)
    return NextResponse.json({ agent })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update agent' },
      { status: 500 }
    )
  }
}
