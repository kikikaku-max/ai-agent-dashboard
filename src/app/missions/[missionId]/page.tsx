'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Clock, Cpu, FileText } from 'lucide-react'
import { useSSE } from '@/hooks/use-sse'
import type { Mission } from '@/lib/types'

export default function MissionDetailPage() {
  const params = useParams()
  const missionId = params.missionId as string
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)

  const shouldStream = mission?.status === 'running' || mission?.status === 'pending'
  const { fullText, isStreaming, error, isDone } = useSSE(
    shouldStream ? missionId : null
  )

  const refreshMission = () => {
    fetch(`/api/missions/${missionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.mission) setMission(data.mission)
      })
  }

  useEffect(() => {
    refreshMission()
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId])

  // Poll for updates when mission is running (fallback if SSE misses events)
  useEffect(() => {
    if (mission?.status === 'running' || mission?.status === 'pending') {
      const interval = setInterval(refreshMission, 2000)
      return () => clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission?.status, missionId])

  // Refresh mission data when stream completes
  useEffect(() => {
    if (isDone) refreshMission()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone])

  if (loading || !mission) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    )
  }

  const displayOutput = isStreaming ? fullText : (mission.output || fullText)

  return (
    <Shell>
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <Link href="/missions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{mission.title}</h2>
              <Badge
                variant={
                  mission.status === 'completed' ? 'default' :
                  mission.status === 'running' ? 'secondary' :
                  mission.status === 'failed' ? 'destructive' : 'outline'
                }
              >
                {isStreaming ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> กำลังทำงาน</>
                ) : (
                  mission.status === 'completed' ? 'สำเร็จ' :
                  mission.status === 'failed' ? 'ล้มเหลว' :
                  mission.status === 'pending' ? 'รอ' : mission.status
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Agent: {mission.agent_id}
            </p>
          </div>
        </div>

        {/* Mission Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">ระยะเวลา</p>
                <p className="text-sm font-medium">
                  {mission.duration_ms > 0 ? `${(mission.duration_ms / 1000).toFixed(1)} วินาที` : 'กำลังทำงาน...'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Cpu className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tokens ที่ใช้</p>
                <p className="text-sm font-medium">
                  {mission.tokens_used > 0 ? mission.tokens_used.toLocaleString() : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">สร้างเมื่อ</p>
                <p className="text-sm font-medium">
                  {new Date(mission.created_at).toLocaleString('th-TH')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">คำสั่ง</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{mission.input}</p>
          </CardContent>
        </Card>

        {/* Output Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              ผลลัพธ์
              {isStreaming && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            ) : displayOutput ? (
              <div className="mission-stream p-4 rounded-lg bg-[hsl(222,47%,4%)] text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                {displayOutput}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {mission.status === 'pending' ? 'กำลังเตรียมการ...' : 'ไม่มีผลลัพธ์'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
