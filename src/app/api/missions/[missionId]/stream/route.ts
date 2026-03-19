import { NextRequest } from 'next/server'
import { getMission, getMissionChunks } from '@/lib/db'
import { missionEvents } from '@/lib/mission-runner'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params
  const mission = await getMission(missionId)

  if (!mission) {
    return new Response('Mission not found', { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const existingChunks = await getMissionChunks(missionId)

      for (const chunk of existingChunks) {
        const data = JSON.stringify({
          type: 'chunk',
          content: String(chunk.content),
          chunk_type: String(chunk.chunk_type),
          index: Number(chunk.chunk_index),
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      if (['completed', 'failed', 'cancelled'].includes(String(mission.status))) {
        const data = JSON.stringify({
          type: mission.status === 'completed' ? 'complete' : 'error',
          status: String(mission.status),
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        controller.close()
        return
      }

      const handler = (event: { type: string; content?: string; error?: string }) => {
        try {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

          if (event.type === 'complete' || event.type === 'error') {
            missionEvents.removeListener(`mission:${missionId}`, handler)
            controller.close()
          }
        } catch {
          missionEvents.removeListener(`mission:${missionId}`, handler)
        }
      }

      missionEvents.on(`mission:${missionId}`, handler)

      _req.signal.addEventListener('abort', () => {
        missionEvents.removeListener(`mission:${missionId}`, handler)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
