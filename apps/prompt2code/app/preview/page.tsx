'use client'

import { useState, useEffect } from 'react'
import { BlockRenderer } from '../components/BlockRenderer'
import { ContentDsProvider } from '@design2code/ds'

export default function PreviewPage() {
  const [blocks, setBlocks] = useState<unknown[] | null>(null)

  useEffect(() => {
    // Tell the parent we're mounted and ready to receive blocks
    window.parent?.postMessage({ type: 'PREVIEW_READY' }, '*')

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_PREVIEW') {
        setBlocks(e.data.blocks ?? null)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Report page height to parent whenever content changes
  useEffect(() => {
    const report = () => {
      const h = document.documentElement.scrollHeight
      window.parent?.postMessage({ type: 'PREVIEW_HEIGHT', height: h }, '*')
    }
    report()
    const ro = new ResizeObserver(report)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [blocks])

  return (
    <ContentDsProvider>
      <BlockRenderer blocks={blocks} />
    </ContentDsProvider>
  )
}
