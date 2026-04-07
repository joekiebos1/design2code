'use client'

import { useState, useEffect, useMemo } from 'react'

type Block = { slot: string }

export type ImageSlotState = {
  url: string
  alt: string
  source: 'library' | 'generated' | 'stock'
  ready: boolean
}

export function useImageStream(
  jobId: string | null,
  blocks: Block[] | null
): {
  images: Record<string, ImageSlotState>
  readyCount: number
  totalCount: number
  allReady: boolean
} {
  const [images, setImages] = useState<Record<string, ImageSlotState>>({})

  const body = useMemo(() => {
    if (!jobId || !blocks?.length) return null
    return JSON.stringify({ jobId, blocks })
  }, [jobId, blocks])

  useEffect(() => {
    if (!jobId || !blocks?.length || !body) {
      setImages({})
      return
    }

    const initial: Record<string, ImageSlotState> = {}
    for (const b of blocks) {
      initial[b.slot] = { url: '', alt: '', source: 'library', ready: false }
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
                if (event.slot && event.url) {
                  setImages((prev) => ({
                    ...prev,
                    [event.slot]: {
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
        // aborted or network error — ignore
      })

    return () => abort.abort()
  }, [jobId, blocks, body])

  const totalCount = blocks?.length ?? 0
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
