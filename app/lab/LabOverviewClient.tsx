'use client'

/**
 * Lab overview – sections from Sanity `labOverview` (e.g. Media + Text Asymmetric · links).
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
        asymmetricBlockOpenLinksInNewTab={false}
      />
    </main>
  )
}
