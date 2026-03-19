'use client'

import { useEffect, useState } from 'react'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import type { Agent, Mission } from '@/lib/types'
import { TEAM_COLORS, TEAM_LABELS } from '@/lib/types'

interface Stats {
  totalAgents: number
  busyAgents: number
  totalMissions: number
  runningMissions: number
  completedMissions: number
  failedMissions: number
}

export default function CommandCenterPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchData = async () => {
    try {
      const [agentsRes, missionsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/missions?limit=10'),
      ])
      const agentsData = await agentsRes.json()
      const missionsData = await missionsRes.json()
      setAgents(agentsData.agents || [])
      setStats(agentsData.stats || null)
      setMissions(missionsData.missions || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await fetch('/api/seed', { method: 'POST' })
      await fetchData()
    } catch (err) {
      console.error('Failed to seed:', err)
    } finally {
      setSeeding(false)
    }
  }

  const teamGroups = agents.reduce<Record<string, Agent[]>>((acc, agent) => {
    if (!acc[agent.team]) acc[agent.team] = []
    acc[agent.team].push(agent)
    return acc
  }, {})

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
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">ยังไม่มี agents ในระบบ</p>
          <Button onClick={handleSeed} disabled={seeding} size="lg">
            {seeding ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้างทีม...</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" /> สร้างทีม AI 15 ตัว</>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agents ทั้งหมด</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.busyAgents || 0} กำลังทำงาน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ภารกิจทั้งหมด</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMissions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.runningMissions || 0} กำลังดำเนินการ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">สำเร็จ</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats?.completedMissions || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ล้มเหลว</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats?.failedMissions || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {(['CORE', 'TECH', 'CREATIVE', 'BUSINESS', 'FINANCE'] as const).map((team) => (
              <Card key={team}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: TEAM_COLORS[team] }}
                    />
                    ทีม {TEAM_LABELS[team]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(teamGroups[team] || []).map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/agents/${agent.id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {agent.name_th.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{agent.name_th}</p>
                            <p className="text-xs text-muted-foreground">{agent.name_en}</p>
                          </div>
                        </div>
                        <Badge
                          variant={agent.status === 'busy' ? 'default' : 'secondary'}
                          className={agent.status === 'busy' ? 'animate-pulse-dot' : ''}
                        >
                          {agent.status === 'idle' ? 'ว่าง' : agent.status === 'busy' ? 'ทำงาน' : 'ออฟไลน์'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">กิจกรรมล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ยังไม่มีภารกิจ — ไปที่หน้า &quot;ภารกิจ&quot; เพื่อสร้างงานใหม่
                </p>
              ) : (
                <div className="space-y-2">
                  {missions.slice(0, 5).map((mission) => (
                    <Link
                      key={mission.id}
                      href={`/missions/${mission.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{mission.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Agent: {mission.agent_id} · {new Date(mission.created_at).toLocaleString('th-TH')}
                        </p>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Shell>
  )
}
