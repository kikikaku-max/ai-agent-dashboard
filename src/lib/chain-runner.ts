import { v4 as uuid } from 'uuid'
import { createMission, getMission, getChildMissions, updateMission } from './db'
import { executeMission, missionEvents } from './mission-runner'

interface Subtask {
  agent: string
  title: string
  input: string
  depends_on?: number // index of subtask to wait for
}

interface ChainPlan {
  analysis: string
  subtasks: Subtask[]
}

/**
 * Parse subtasks JSON from secretary's output.
 * Looks for a JSON block in the output text.
 */
export function parseSubtasks(output: string): ChainPlan | null {
  try {
    // Try to find JSON block in the output
    const jsonMatch = output.match(/```json\s*([\s\S]*?)```/) ||
                      output.match(/\{[\s\S]*"subtasks"[\s\S]*\}/)

    if (!jsonMatch) return null

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonStr)

    if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) return null
    if (parsed.subtasks.length === 0) return null

    // Validate each subtask has required fields
    for (const task of parsed.subtasks) {
      if (!task.agent || !task.title || !task.input) return null
    }

    return parsed as ChainPlan
  } catch {
    return null
  }
}

/**
 * Execute a chain of sub-missions from a parent (secretary) mission.
 * Handles dependencies: if subtask has depends_on, waits for that subtask to complete
 * and injects its output as additional context.
 */
export async function executeChain(parentMissionId: string) {
  const parentMission = await getMission(parentMissionId)
  if (!parentMission) return

  const plan = parseSubtasks(String(parentMission.output))
  if (!plan) return

  // Create all sub-missions first
  const subMissionIds: string[] = []

  for (let i = 0; i < plan.subtasks.length; i++) {
    const task = plan.subtasks[i]
    const missionId = uuid()
    subMissionIds.push(missionId)

    await createMission({
      id: missionId,
      title: task.title,
      description: `Sub-task ${i + 1} ของ "${String(parentMission.title)}"`,
      agent_id: task.agent,
      input: task.input,
      priority: Number(parentMission.priority) || 5,
      status: 'pending',
      parent_id: parentMissionId,
    })
  }

  // Emit event so UI can show sub-missions immediately
  missionEvents.emit(`mission:${parentMissionId}`, {
    type: 'chain_created',
    subtask_count: plan.subtasks.length,
    subtask_ids: subMissionIds,
  })

  // Execute sub-missions respecting dependencies
  for (let i = 0; i < plan.subtasks.length; i++) {
    const task = plan.subtasks[i]
    const missionId = subMissionIds[i]

    // If this task depends on another, wait for it and inject its output
    if (task.depends_on !== undefined && task.depends_on >= 0 && task.depends_on < i) {
      const depMissionId = subMissionIds[task.depends_on]
      const depMission = await waitForMission(depMissionId)

      if (depMission) {
        // Inject dependency output as additional context
        const enrichedInput = `${task.input}\n\n---\nข้อมูลจาก "${plan.subtasks[task.depends_on].title}":\n${String(depMission.output)}`
        await updateMission(missionId, { input: enrichedInput })
      }
    }

    // Execute this sub-mission
    await executeMission(missionId)
  }

  // Update parent mission status
  await updateMission(parentMissionId, {
    status: 'completed',
    output: String(parentMission.output) + `\n\n---\n✅ สร้าง ${plan.subtasks.length} sub-missions เสร็จสิ้น`,
  })
}

/**
 * Wait for a mission to complete (poll every 2 seconds, max 5 minutes)
 */
async function waitForMission(missionId: string, timeoutMs = 300000) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const mission = await getMission(missionId)
    if (!mission) return null

    const status = String(mission.status)
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      return mission
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return null
}
