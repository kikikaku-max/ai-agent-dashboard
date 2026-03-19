'use client'

import { useEffect, useState } from 'react'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText } from 'lucide-react'
import type { Mission } from '@/lib/types'

export default function WorkspacePage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  useEffect(() => {
    fetch('/api/missions?limit=50')
      .then(r => r.json())
      .then(data => {
        const completed = (data.missions || []).filter(
          (m: Mission) => m.status === 'completed' && m.output
        )
        setMissions(completed)
      })
      .finally(() => setLoading(false))
  }, [])

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
        <p className="text-sm text-muted-foreground">
          ผลลัพธ์จากภารกิจที่สำเร็จ — ดูได้ทุก output ที่ agents สร้าง
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* File List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">ผลลัพธ์ ({missions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {missions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMission(m)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      selectedMission?.id === m.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.agent_id} · {new Date(m.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {missions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    ยังไม่มีผลลัพธ์
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Viewer */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {selectedMission ? (
                  <>
                    {selectedMission.title}
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedMission.agent_id}
                    </Badge>
                  </>
                ) : (
                  'เลือกรายการเพื่อดูเนื้อหา'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMission ? (
                <div className="p-4 rounded-lg bg-[hsl(222,47%,4%)] text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                  {selectedMission.output}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                  เลือกรายการจากด้านซ้ายเพื่อดูเนื้อหา
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
