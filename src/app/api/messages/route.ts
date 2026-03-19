import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb, initDb, listMessages } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('agent_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const messages = await listMessages(agentId, limit)
    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from_agent, to_agent, content, msg_type = 'request', mission_id = null } = body

    if (!from_agent || !to_agent || !content) {
      return NextResponse.json({ error: 'from_agent, to_agent, and content are required' }, { status: 400 })
    }

    await initDb()
    const id = uuid()
    await getDb().execute({
      sql: 'INSERT INTO messages (id, from_agent, to_agent, content, msg_type, mission_id) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, from_agent, to_agent, content, msg_type, mission_id],
    })

    return NextResponse.json({ id, status: 'pending' })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}
