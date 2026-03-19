import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getAgentMemories, insertMemory } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  try {
    const memories = await getAgentMemories(agentId, 50)
    return NextResponse.json({ memories })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get memories' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  try {
    const body = await req.json()
    const memory = {
      id: uuid(),
      agent_id: agentId,
      content: body.content,
      memory_type: body.memory_type || 'observation',
      importance: body.importance || 5,
      mission_id: body.mission_id || null,
    }
    await insertMemory(memory)
    return NextResponse.json({ memory })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add memory' },
      { status: 500 }
    )
  }
}
