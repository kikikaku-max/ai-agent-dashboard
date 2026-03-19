import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb, getSkill } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params
  try {
    const skill = await getSkill(skillId)
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    return NextResponse.json({ skill })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params
  try {
    const body = await req.json()
    const allowedFields = ['name', 'description', 'instructions', 'category']
    const updates: string[] = []
    const values: (string | number | null)[] = []

    for (const key of allowedFields) {
      if (key in body) {
        updates.push(`${key} = ?`)
        values.push(body[key])
      }
    }
    if (updates.length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })

    await initDb()
    values.push(skillId)
    await getDb().execute({
      sql: `UPDATE skills SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      args: values,
    })

    const skill = await getSkill(skillId)
    return NextResponse.json({ skill })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params
  try {
    await initDb()
    await getDb().execute({ sql: 'DELETE FROM skills WHERE id = ?', args: [skillId] })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}
