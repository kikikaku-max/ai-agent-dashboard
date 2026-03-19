'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SSEChunk {
  type: string
  content?: string
  error?: string
  status?: string
}

export function useSSE(missionId: string | null) {
  const [chunks, setChunks] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!missionId) return

    setChunks([])
    setIsStreaming(true)
    setError(null)
    setIsDone(false)

    const es = new EventSource(`/api/missions/${missionId}/stream`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data: SSEChunk = JSON.parse(event.data)

        if (data.type === 'chunk' && data.content) {
          setChunks((prev) => [...prev, data.content!])
        } else if (data.type === 'complete') {
          setIsStreaming(false)
          setIsDone(true)
          es.close()
        } else if (data.type === 'error') {
          setError(data.error || 'Unknown error')
          setIsStreaming(false)
          es.close()
        }
      } catch {
        // Ignore parse errors
      }
    }

    es.onerror = () => {
      setIsStreaming(false)
      es.close()
    }
  }, [missionId])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [connect])

  const fullText = chunks.join('')

  return { chunks, fullText, isStreaming, error, isDone }
}
