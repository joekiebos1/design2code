'use client'

import { useState, useEffect } from 'react'
import { BlockRenderer } from '../components/BlockRenderer'
import { ContentDsProvider } from '@design2code/ds'
import type { ImageSlotState } from '../hooks/useImageStream'

export default function PreviewPage() {
  const [blocks, setBlocks] = useState<unknown[] | null>(null)
  const [images, setImages] = useState<Record<string, ImageSlotState>>({})

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_PREVIEW') {
        setBlocks(e.data.blocks ?? null)
        setImages(e.data.images ?? {})
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <ContentDsProvider>
      <BlockRenderer blocks={blocks} images={images} />
    </ContentDsProvider>
  )
}
