'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Brain, Target, Settings } from 'lucide-react'
import type { Agent, Mission, Memory } from '@/lib/types'
import { TEAM_COLORS, TEAM_LABELS } from '@/lib/types'

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const [agent, setAgent] = useState<Agent | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'memory' | 'config'>('overview')

  useEffect(() => {
    Promise.all([
      fetch(`/api/agents/${agentId}`).then(r => r.json()),
      fetch(`/api/agents/${agentId}/memory`).then(r => r.json()),
    ]).then(([agentData, memoryData]) => {
      setAgent(agentData.agent)
      setMissions(agentData.missions || [])
      setMemories(memoryData.memories || [])
    }).finally(() => setLoading(false))
  }, [agentId])

  if (loading || !agent) {
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
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: TEAM_COLORS[agent.team] + '80' }}
            >
              {agent.name_th.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{agent.name_th}</h2>
              <p className="text-muted-foreground">{agent.name_en} · {agent.role}</p>
              <div className="flex gap-2 mt-1">
                <Badge
                  variant="outline"
                  style={{ borderColor: TEAM_COLORS[agent.team], color: TEAM_COLORS[agent.team] }}
                >
                  {TEAM_LABELS[agent.team]}
                </Badge>
                <Badge variant={agent.status === 'busy' ? 'default' : 'secondary'}>
                  {agent.status === 'idle' ? 'ว่าง' : agent.status === 'busy' ? 'ทำงาน' : 'ออฟไลน์'}
                </Badge>
                <Badge variant="secondary">{agent.model.replace('claude-', '')}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { key: 'overview', label: 'ภาพรวม', icon: Settings },
            { key: 'missions', label: 'ภารกิจ', icon: Target },
            { key: 'memory', label: 'ความจำ', icon: Brain },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">บุคลิกภาพ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {agent.personality || 'ไม่ได้กำหนด'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-10">
                  {agent.system_prompt || 'ไม่ได้กำหนด'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">การตั้งค่า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span>{agent.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Effort Level</span>
                    <span>{agent.effort_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skills</span>
                    <span>{JSON.parse(agent.skills || '[]').length} ทักษะ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'missions' && (
          <Card>
            <CardContent className="pt-6">
              {missions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีภารกิจ</p>
              ) : (
                <div className="space-y-2">
                  {missions.map((m) => (
                    <Link
                      key={m.id}
                      href={`/missions/${m.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleString('th-TH')}
                          {m.duration_ms > 0 && ` · ${(m.duration_ms / 1000).toFixed(1)}s`}
                          {m.tokens_used > 0 && ` · ${m.tokens_used} tokens`}
                        </p>
                      </div>
                      <Badge variant={m.status === 'completed' ? 'default' : m.status === 'failed' ? 'destructive' : 'secondary'}>
                        {m.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'memory' && (
          <Card>
            <CardContent className="pt-6">
              {memories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีความจำ</p>
              ) : (
                <div className="space-y-2">
                  {memories.map((mem) => (
                    <div key={mem.id} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{mem.memory_type}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          ความสำคัญ: {mem.importance}/10
                        </span>
                      </div>
                      <p className="text-sm">{mem.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(mem.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  )
}
