import { createClient, type Client } from '@libsql/client'
import { SCHEMA } from './db-schema'

let _db: Client | null = null
let _initialized = false

export function getDb(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./data/dashboard.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _db
}

export async function initDb() {
  if (_initialized) return
  const db = getDb()
  // Execute each statement separately (libsql doesn't support multiple statements in one call)
  const statements = SCHEMA.split(';').map(s => s.trim()).filter(s => s.length > 0)
  for (const stmt of statements) {
    await db.execute(stmt)
  }
  _initialized = true
}

// Ensure DB is initialized before any query
async function query(sql: string, args: unknown[] = []) {
  await initDb()
  return getDb().execute({ sql, args: args as (string | number | null)[] })
}

// Helper functions
export async function listAgents() {
  const result = await query('SELECT * FROM agents ORDER BY team, name_en')
  return result.rows
}

export async function getAgent(id: string) {
  const result = await query('SELECT * FROM agents WHERE id = ?', [id])
  return result.rows[0] || null
}

export async function updateAgent(id: string, updates: Record<string, unknown>) {
  const fields = Object.keys(updates)
  const setClause = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => updates[f] as string | number | null)
  await query(
    `UPDATE agents SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
    [...values, id]
  )
}

export async function listMissions(limit = 50, agentId?: string) {
  if (agentId) {
    const result = await query(
      'SELECT * FROM missions WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?',
      [agentId, limit]
    )
    return result.rows
  }
  const result = await query(
    'SELECT * FROM missions ORDER BY created_at DESC LIMIT ?',
    [limit]
  )
  return result.rows
}

export async function getMission(id: string) {
  const result = await query('SELECT * FROM missions WHERE id = ?', [id])
  return result.rows[0] || null
}

export async function createMission(mission: Record<string, unknown>) {
  const fields = Object.keys(mission)
  const placeholders = fields.map(() => '?').join(', ')
  const values = fields.map(f => mission[f] as string | number | null)
  await query(
    `INSERT INTO missions (${fields.join(', ')}) VALUES (${placeholders})`,
    values
  )
}

export async function updateMission(id: string, updates: Record<string, unknown>) {
  const fields = Object.keys(updates)
  const setClause = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => updates[f] as string | number | null)
  await query(
    `UPDATE missions SET ${setClause} WHERE id = ?`,
    [...values, id]
  )
}

export async function getMissionChunks(missionId: string) {
  const result = await query(
    'SELECT * FROM mission_chunks WHERE mission_id = ? ORDER BY chunk_index',
    [missionId]
  )
  return result.rows
}

export async function insertChunk(chunk: {
  mission_id: string
  chunk_index: number
  content: string
  chunk_type: string
}) {
  await query(
    `INSERT INTO mission_chunks (mission_id, chunk_index, content, chunk_type) VALUES (?, ?, ?, ?)`,
    [chunk.mission_id, chunk.chunk_index, chunk.content, chunk.chunk_type]
  )
}

export async function getAgentMemories(agentId: string, limit = 20) {
  const result = await query(
    'SELECT * FROM memory WHERE agent_id = ? ORDER BY importance DESC, created_at DESC LIMIT ?',
    [agentId, limit]
  )
  return result.rows
}

export async function insertMemory(memory: Record<string, unknown>) {
  const fields = Object.keys(memory)
  const placeholders = fields.map(() => '?').join(', ')
  const values = fields.map(f => memory[f] as string | number | null)
  await query(
    `INSERT INTO memory (${fields.join(', ')}) VALUES (${placeholders})`,
    values
  )
}

export async function listSkills() {
  const result = await query('SELECT * FROM skills ORDER BY category, name')
  return result.rows
}

export async function getSkill(id: string) {
  const result = await query('SELECT * FROM skills WHERE id = ?', [id])
  return result.rows[0] || null
}

export async function listMessages(agentId?: string, limit = 50) {
  if (agentId) {
    const result = await query(
      'SELECT * FROM messages WHERE to_agent = ? OR from_agent = ? ORDER BY created_at DESC LIMIT ?',
      [agentId, agentId, limit]
    )
    return result.rows
  }
  const result = await query(
    'SELECT * FROM messages ORDER BY created_at DESC LIMIT ?',
    [limit]
  )
  return result.rows
}

export async function getChildMissions(parentId: string) {
  const result = await query(
    'SELECT * FROM missions WHERE parent_id = ? ORDER BY created_at ASC',
    [parentId]
  )
  return result.rows
}

export async function getStats() {
  const [totalAgents, busyAgents, totalMissions, runningMissions, completedMissions, failedMissions] = await Promise.all([
    query('SELECT COUNT(*) as count FROM agents'),
    query("SELECT COUNT(*) as count FROM agents WHERE status = 'busy'"),
    query('SELECT COUNT(*) as count FROM missions'),
    query("SELECT COUNT(*) as count FROM missions WHERE status = 'running'"),
    query("SELECT COUNT(*) as count FROM missions WHERE status = 'completed'"),
    query("SELECT COUNT(*) as count FROM missions WHERE status = 'failed'"),
  ])
  return {
    totalAgents: Number(totalAgents.rows[0]?.count ?? 0),
    busyAgents: Number(busyAgents.rows[0]?.count ?? 0),
    totalMissions: Number(totalMissions.rows[0]?.count ?? 0),
    runningMissions: Number(runningMissions.rows[0]?.count ?? 0),
    completedMissions: Number(completedMissions.rows[0]?.count ?? 0),
    failedMissions: Number(failedMissions.rows[0]?.count ?? 0),
  }
}
