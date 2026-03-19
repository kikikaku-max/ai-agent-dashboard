import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb, initDb, listSkills } from '@/lib/db'

export async function GET() {
  try {
    const skills = await listSkills()
    return NextResponse.json({ skills })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list skills' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description = '', instructions, category = 'general' } = body

    if (!name || !instructions) {
      return NextResponse.json({ error: 'name and instructions are required' }, { status: 400 })
    }

    await initDb()
    const id = body.id || uuid()
    const db = getDb()
    await db.execute({
      sql: 'INSERT INTO skills (id, name, description, instructions, category) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, description, instructions, category],
    })

    const result = await db.execute({ sql: 'SELECT * FROM skills WHERE id = ?', args: [id] })
    return NextResponse.json({ skill: result.rows[0] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create skill' },
      { status: 500 }
    )
  }
}
