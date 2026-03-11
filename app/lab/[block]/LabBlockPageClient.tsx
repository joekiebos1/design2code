'use client'

/**
 * Lab block page – renders one block type with all layout variants stacked.
 * URL: /lab/[block-slug]
 * Data comes from Sanity (labBlockPage sections).
 */

import { DsProvider } from '@marcelinodzn/ds-react'
import { TopNavBlock } from '../blocks'
import { LabBlockRenderer, getBlockLayoutTitle } from '../LabBlockRenderer'

type LabBlockPageClientProps = {
  title: string
  blocks: unknown[]
}

export function LabBlockPageClient({ title, blocks }: LabBlockPageClientProps) {
  const blockList = Array.isArray(blocks) ? blocks : []
  const variantLabels = blockList.map((b) =>
    getBlockLayoutTitle(b as { _type: string; _key?: string; [key: string]: unknown })
  )

  return (
    <DsProvider platform="Desktop (1440)" colorMode="Light" density="Default" theme="MyJio">
      <TopNavBlock />
      <main className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
        <div style={{ marginBottom: 'var(--ds-spacing-3xl)' }}>
          <h1
            style={{
              fontSize: 'var(--ds-typography-h2)',
              fontWeight: 'var(--ds-typography-weight-high)',
              marginBottom: 'var(--ds-spacing-m)',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 'var(--ds-typography-body-m)',
              color: 'var(--ds-color-text-low)',
              margin: 0,
            }}
          >
            {blockList.length} layout variant{blockList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <LabBlockRenderer blocks={blockList as { _type: string; _key?: string; [key: string]: unknown }[]} variantLabels={variantLabels} />
      </main>
    </DsProvider>
  )
}
