import { NextRequest, NextResponse } from 'next/server'
import { getMission, getMissionChunks, updateMission } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params
  try {
    const mission = await getMission(missionId)
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }
    const chunks = await getMissionChunks(missionId)
    return NextResponse.json({ mission, chunks })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get mission' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params
  try {
    const body = await req.json()
    if (body.status === 'cancelled') {
      await updateMission(missionId, {
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
    }
    const mission = await getMission(missionId)
    return NextResponse.json({ mission })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update mission' },
      { status: 500 }
    )
  }
}
