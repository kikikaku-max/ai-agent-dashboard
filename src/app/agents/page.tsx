'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { Agent } from '@/lib/types'
import { TEAM_COLORS, TEAM_LABELS } from '@/lib/types'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{ backgroundColor: TEAM_COLORS[agent.team] + '80' }}
                  >
                    {agent.name_th.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{agent.name_th}</h3>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          agent.status === 'busy'
                            ? 'bg-yellow-500 animate-pulse-dot'
                            : agent.status === 'idle'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.name_en}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {agent.role}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5"
                        style={{
                          borderColor: TEAM_COLORS[agent.team],
                          color: TEAM_COLORS[agent.team],
                        }}
                      >
                        {TEAM_LABELS[agent.team]}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {agent.model.replace('claude-', '').replace('-4-6', '')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  )
}
