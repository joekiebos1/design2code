'use client'

/**
 * Lab overview – renders sections from Sanity (labOverview).
 * List block with links to each block page. Links open in new tab.
 */

import { LabBlockRenderer } from './LabBlockRenderer'

type LabOverviewClientProps = {
  sections: unknown[]
}

export function LabOverviewClient({ sections }: LabOverviewClientProps) {
  const blocks = Array.isArray(sections) ? sections : []

  return (
    <main style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
      <LabBlockRenderer
        blocks={blocks as { _type: string; _key?: string; [key: string]: unknown }[]}
        clean
        listBlockOpenLinksInNewTab
      />
    </main>
  )
}
