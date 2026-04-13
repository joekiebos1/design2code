'use client'

import { useState, useEffect } from 'react'
import { BlockRenderer } from '../components/BlockRenderer'
import { ContentDsProvider } from '@design2code/ds'

export default function PreviewPage() {
  const [blocks, setBlocks] = useState<unknown[] | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_PREVIEW') {
        setBlocks(e.data.blocks ?? null)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <ContentDsProvider>
      <BlockRenderer blocks={blocks} />
    </ContentDsProvider>
  )
}
