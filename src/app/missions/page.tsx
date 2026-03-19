'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Send } from 'lucide-react'
import Link from 'next/link'
import type { Agent, Mission } from '@/lib/types'
import { TEAM_COLORS } from '@/lib/types'

export default function MissionsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [selectedAgent, setSelectedAgent] = useState('')
  const [title, setTitle] = useState('')
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState(5)

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/missions?limit=50').then(r => r.json()),
    ]).then(([agentsData, missionsData]) => {
      setAgents(agentsData.agents || [])
      setMissions(missionsData.missions || [])
      if (agentsData.agents?.length > 0) {
        setSelectedAgent(agentsData.agents[0].id)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!selectedAgent || !title || !input) return
    setCreating(true)
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgent,
          title,
          input,
          priority,
        }),
      })
      const data = await res.json()
      if (data.mission_id) {
        router.push(`/missions/${data.mission_id}`)
      }
    } catch (err) {
      console.error('Failed to create mission:', err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">สร้างภารกิจให้ AI agents ทำงาน</p>
          <Button onClick={() => setShowCreator(!showCreator)}>
            <Plus className="h-4 w-4 mr-1" />
            สร้างภารกิจใหม่
          </Button>
        </div>

        {/* Mission Creator */}
        {showCreator && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">สร้างภารกิจใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Agent Select */}
                <div>
                  <label className="text-sm font-medium mb-1 block">เลือก Agent</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name_th} ({agent.name_en}) — {agent.team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อภารกิจ</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น: วิเคราะห์ตลาดทองวันนี้"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {/* Input */}
                <div>
                  <label className="text-sm font-medium mb-1 block">คำสั่ง / รายละเอียด</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="บอกรายละเอียดงานที่ต้องการให้ agent ทำ..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium mb-1 block">ความสำคัญ: {priority}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Selected Agent Preview */}
                {selectedAgent && (
                  <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                    <p className="text-muted-foreground">
                      Agent ที่เลือก:{' '}
                      <span className="text-foreground font-medium">
                        {agents.find(a => a.id === selectedAgent)?.name_th}
                      </span>
                      {' · '}
                      Model: {agents.find(a => a.id === selectedAgent)?.model.replace('claude-', '')}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCreate}
                  disabled={creating || !title || !input}
                  className="w-full"
                >
                  {creating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> กำลังสร้าง...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> สั่งงาน</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mission List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ภารกิจทั้งหมด ({missions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {missions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีภารกิจ</p>
            ) : (
              <div className="space-y-2">
                {missions.map((mission) => {
                  const agent = agents.find(a => a.id === mission.agent_id)
                  return (
                    <Link
                      key={mission.id}
                      href={`/missions/${mission.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {agent && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: TEAM_COLORS[agent.team] + '80' }}
                          >
                            {agent.name_th.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent?.name_th || mission.agent_id}
                            {' · '}
                            {new Date(mission.created_at).toLocaleString('th-TH')}
                            {mission.duration_ms > 0 && ` · ${(mission.duration_ms / 1000).toFixed(1)}s`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          mission.status === 'completed' ? 'default' :
                          mission.status === 'running' ? 'secondary' :
                          mission.status === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {mission.status === 'completed' ? 'สำเร็จ' :
                         mission.status === 'running' ? 'กำลังทำ' :
                         mission.status === 'failed' ? 'ล้มเหลว' :
                         mission.status === 'pending' ? 'รอ' : mission.status}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
