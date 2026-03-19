export interface Agent {
  id: string
  name_th: string
  name_en: string
  role: string
  personality: string
  system_prompt: string
  model: string
  effort_level: 'low' | 'medium' | 'high'
  team: 'CORE' | 'TECH' | 'CREATIVE' | 'BUSINESS' | 'FINANCE'
  avatar_url: string | null
  status: 'idle' | 'busy' | 'offline'
  skills: string // JSON array of skill IDs
  config: string // JSON extra config
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  title: string
  description: string
  agent_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: number
  input: string
  output: string
  tokens_used: number
  duration_ms: number
  parent_id: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface MissionChunk {
  id: number
  mission_id: string
  chunk_index: number
  content: string
  chunk_type: 'text' | 'thinking' | 'tool_use' | 'error'
  created_at: string
}

export interface Memory {
  id: string
  agent_id: string
  content: string
  memory_type: 'observation' | 'instruction' | 'summary' | 'fact'
  importance: number
  mission_id: string | null
  created_at: string
}

export interface Skill {
  id: string
  name: string
  description: string
  instructions: string
  category: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  from_agent: string
  to_agent: string
  content: string
  msg_type: 'request' | 'response' | 'delegate' | 'notify'
  mission_id: string | null
  status: 'pending' | 'read' | 'processed'
  created_at: string
}

export interface Artifact {
  id: string
  mission_id: string | null
  agent_id: string | null
  title: string
  content: string
  mime_type: string
  created_at: string
}

// Team colors for UI
export const TEAM_COLORS: Record<Agent['team'], string> = {
  CORE: '#f59e0b',     // amber
  TECH: '#3b82f6',     // blue
  CREATIVE: '#a855f7', // purple
  BUSINESS: '#10b981', // emerald
  FINANCE: '#ef4444',  // red
}

export const TEAM_LABELS: Record<Agent['team'], string> = {
  CORE: 'แกนหลัก',
  TECH: 'เทคนิค',
  CREATIVE: 'ครีเอทีฟ',
  BUSINESS: 'ธุรกิจ',
  FINANCE: 'การเงิน',
}

export const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
]

export const STATUS_LABELS: Record<Agent['status'], string> = {
  idle: 'ว่าง',
  busy: 'กำลังทำงาน',
  offline: 'ออฟไลน์',
}
