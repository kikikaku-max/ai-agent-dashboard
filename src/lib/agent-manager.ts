import { getAgent, getAgentMemories } from './db'
import type { Agent, Memory, Skill } from './types'
import type { Row } from '@libsql/client'

export function buildSystemPrompt(
  agent: Row,
  skills: Skill[],
  memories: Row[]
): string {
  const parts: string[] = []

  parts.push(`คุณคือ "${agent.name_th}" (${agent.name_en}) — ${agent.role}`)
  parts.push(`ทีม: ${agent.team}`)
  parts.push('')

  if (agent.system_prompt) {
    parts.push(String(agent.system_prompt))
    parts.push('')
  }

  if (agent.personality) {
    parts.push(`## บุคลิกภาพ`)
    parts.push(String(agent.personality))
    parts.push('')
  }

  if (skills.length > 0) {
    parts.push(`## ทักษะพิเศษ`)
    for (const skill of skills) {
      parts.push(`### ${skill.name}`)
      parts.push(skill.instructions)
      parts.push('')
    }
  }

  if (memories.length > 0) {
    parts.push(`## สิ่งที่คุณจำได้จากงานก่อนหน้า`)
    for (const mem of memories) {
      parts.push(`- [${mem.memory_type}] ${mem.content}`)
    }
    parts.push('')
  }

  parts.push(`## ทีมของคุณ`)
  parts.push('คุณเป็นส่วนหนึ่งของทีม AI ที่ทำงานร่วมกัน')
  parts.push('')
  parts.push('## รูปแบบการตอบ')
  parts.push('- ตอบเป็นภาษาไทยเป็นหลัก')
  parts.push('- กระชับ ตรงประเด็น')
  parts.push('- ถ้าเป็นเรื่องการเงิน/การลงทุน ต้องมีคำเตือนความเสี่ยงเสมอ')

  return parts.join('\n')
}

export async function getAgentWithContext(agentId: string) {
  const agent = await getAgent(agentId)
  if (!agent) return null

  const memories = await getAgentMemories(agentId, 10)
  const skillIds: string[] = JSON.parse(String(agent.skills || '[]'))

  return { agent, memories, skillIds }
}
