'use client'

import { useState, useEffect, useMemo } from 'react'
import type { PageBrief } from '../lib/types'
import { extractSlotIds } from '../lib/imageManifest'
import type { ImageSlotState } from '@design2code/block-library'

export type { ImageSlotState }

export function useImageStream(
  jobId: string | null,
  brief: PageBrief | null,
): {
  images: Record<string, ImageSlotState>
  readyCount: number
  totalCount: number
  allReady: boolean
} {
  const [images, setImages] = useState<Record<string, ImageSlotState>>({})

  const slotIds = useMemo(() => {
    if (!brief) return []
    return extractSlotIds(brief)
  }, [brief])

  const body = useMemo(() => {
    if (!jobId || !brief?.sections) return null
    return JSON.stringify({ jobId, brief })
  }, [jobId, brief])

  useEffect(() => {
    if (!jobId || !slotIds.length || !body) {
      setImages({})
      return
    }

    const initial: Record<string, ImageSlotState> = {}
    for (const id of slotIds) {
      initial[id] = { url: '', alt: '', source: 'library', ready: false }
    }
    setImages(initial)

    const abort = new AbortController()

    fetch('/api/images/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: abort.signal,
    })
      .then(async (res) => {
        if (!res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() ?? ''

          for (const chunk of chunks) {
            const match = chunk.match(/^data: (.+)$/m)
            if (match) {
              try {
                const event = JSON.parse(match[1])
                const id = event.slotId ?? event.slot
                if (id && event.url) {
                  setImages((prev) => ({
                    ...prev,
                    [id]: {
                      url: event.url,
                      alt: event.alt ?? '',
                      source: event.source ?? 'library',
                      ready: event.ready ?? true,
                    },
                  }))
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      })
      .catch(() => {
        // aborted or network error
      })

    return () => abort.abort()
  }, [jobId, slotIds, body])

  const totalCount = slotIds.length
  const readyCount = useMemo(
    () => Object.values(images).filter((i) => i.ready).length,
    [images]
  )
  const allReady = totalCount > 0 && readyCount === totalCount

  return {
    images,
    readyCount,
    totalCount,
    allReady,
  }
}
