import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import { getDb, initDb, updateAgent, updateMission, insertChunk, getSkill } from './db'
import { buildSystemPrompt, getAgentWithContext } from './agent-manager'
import { streamCompletion } from './ai-engine'
import type { Skill } from './types'

export const missionEvents = new EventEmitter()
missionEvents.setMaxListeners(100)

export async function executeMission(missionId: string) {
  await initDb()
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT * FROM missions WHERE id = ?', args: [missionId] })
  const mission = result.rows[0]

  if (!mission) throw new Error(`Mission ${missionId} not found`)

  const context = await getAgentWithContext(String(mission.agent_id))
  if (!context) throw new Error(`Agent ${mission.agent_id} not found`)

  const { agent, memories, skillIds } = context

  const skills: Skill[] = []
  for (const skillId of skillIds) {
    const skill = await getSkill(skillId)
    if (skill) skills.push(skill as unknown as Skill)
  }

  const systemPrompt = buildSystemPrompt(agent, skills, memories)

  await updateAgent(String(agent.id), { status: 'busy' })
  await updateMission(missionId, {
    status: 'running',
    started_at: new Date().toISOString(),
  })

  missionEvents.emit(`mission:${missionId}`, { type: 'status', status: 'running' })

  const startTime = Date.now()
  let chunkIndex = 0
  let fullOutput = ''
  let totalTokens = 0

  try {
    for await (const chunk of streamCompletion({
      model: String(agent.model),
      systemPrompt,
      userMessage: String(mission.input),
    })) {
      if (chunk.type === 'text') {
        fullOutput += chunk.content

        await insertChunk({
          mission_id: missionId,
          chunk_index: chunkIndex++,
          content: chunk.content,
          chunk_type: 'text',
        })

        missionEvents.emit(`mission:${missionId}`, {
          type: 'chunk',
          content: chunk.content,
          index: chunkIndex,
        })
      } else if (chunk.type === 'done') {
        if (chunk.usage) {
          totalTokens = chunk.usage.input_tokens + chunk.usage.output_tokens
        }
      }
    }

    const durationMs = Date.now() - startTime

    await updateMission(missionId, {
      status: 'completed',
      output: fullOutput,
      tokens_used: totalTokens,
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    })

    await updateAgent(String(agent.id), { status: 'idle' })

    missionEvents.emit(`mission:${missionId}`, {
      type: 'complete',
      output: fullOutput,
      tokens_used: totalTokens,
      duration_ms: durationMs,
    })

    try {
      const memId = uuid()
      const memContent = `งาน: ${String(mission.input).slice(0, 100)}... → ผลลัพธ์สำเร็จ (${fullOutput.length} ตัวอักษร)`
      await db.execute({
        sql: `INSERT INTO memory (id, agent_id, content, memory_type, importance, mission_id) VALUES (?, ?, ?, 'observation', 5, ?)`,
        args: [memId, String(agent.id), memContent, missionId],
      })
    } catch { /* non-critical */ }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    await updateMission(missionId, {
      status: 'failed',
      output: `Error: ${errorMsg}`,
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    })

    await updateAgent(String(agent.id), { status: 'idle' })

    missionEvents.emit(`mission:${missionId}`, { type: 'error', error: errorMsg })
  }
}
