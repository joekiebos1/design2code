'use client'

/**
 * Lab overview – renders a link list from the shared block catalogue.
 * Each link goes to the block's lab detail page.
 */

import { BLOCK_CATALOGUE } from '@design2code/block-library'
import Link from 'next/link'

export function LabOverviewClient() {
  const production = BLOCK_CATALOGUE.filter((b) => b.tier === 'production')
  const lab = BLOCK_CATALOGUE.filter((b) => b.tier === 'lab')

  return (
    <main style={{ padding: 'var(--ds-spacing-2xl) var(--ds-spacing-xl)', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab</h1>
      <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', marginBottom: 'var(--ds-spacing-xl)' }}>
        Browse and preview all block types available in the design system.
      </p>

      <Section title="Production" blocks={production} />
      <Section title="Lab" blocks={lab} />
    </main>
  )
}

function Section({ title, blocks }: { title: string; blocks: typeof BLOCK_CATALOGUE }) {
  return (
    <section style={{ marginBottom: 'var(--ds-spacing-2xl)' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--ds-spacing-sm)' }}>{title}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {blocks.map((block) => (
          <li key={block.id}>
            <Link
              href={`/lab/${block.labSlug}`}
              style={{
                display: 'block',
                padding: '10px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{block.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
