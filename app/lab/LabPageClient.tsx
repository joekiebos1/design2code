'use client'

/**
 * Lab – Overview page. Renders sections from Sanity (labOverview).
 * Uses List block for the block links. Links open in new tab.
 */

import { DsProvider } from '@marcelinodzn/ds-react'
import { TopNavBlock } from './blocks'
import { LabBlockRenderer } from './LabBlockRenderer'

type LabPageClientProps = {
  sections: unknown[]
}

export function LabPageClient({ sections }: LabPageClientProps) {
  const blocks = Array.isArray(sections) ? sections : []

  return (
    <DsProvider platform="Desktop (1440)" colorMode="Light" density="Default" theme="MyJio">
      <TopNavBlock />
      <main className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
        <LabBlockRenderer
          blocks={blocks as { _type: string; _key?: string; [key: string]: unknown }[]}
          clean
          listBlockOpenLinksInNewTab
        />
      </main>
    </DsProvider>
  )
}
