'use client'

/**
 * Lab – Block experiments
 *
 * Experimental blocks rendered with mock data. Same DS, tokens, and rules as production blocks.
 * Not in BlockRenderer or Sanity until promoted.
 */

import { Text, DsProvider } from '@marcelinodzn/ds-react'
import {
  TopNavBlock,
  HeroSplit50,
  HeroSplit50Reveal,
  HeroColourImage,
  HeroColourEdge,
} from './blocks'
import { mockHero } from './mock-data'

export default function LabPage() {
  return (
    <>
      <DsProvider platform="Desktop (1440)" colorMode="Light" density="Default" theme="MyJio">
        <TopNavBlock />
      </DsProvider>
      <main className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
        <div style={{ marginBottom: 'var(--ds-spacing-3xl)' }}>
          <h1 style={{ fontSize: 'var(--ds-typography-h2)', fontWeight: 'var(--ds-typography-weight-high)', marginBottom: 'var(--ds-spacing-m)' }}>
            Lab
          </h1>
          <Text size="M" weight="low" color="low" as="p" style={{ margin: 0 }}>
            Hero variants and TopNavBlock mega menu. Same elements as production blocks.
          </Text>
        </div>

      <section style={{ marginBottom: 'var(--ds-spacing-4xl)' }}>
        <h2 style={{ fontSize: 'var(--ds-typography-h4)', fontWeight: 'var(--ds-typography-weight-medium)', marginBottom: 'var(--ds-spacing-l)' }}>
          1. HeroSplit50 – 50/50 split
        </h2>
        <Text size="S" weight="low" color="low" as="p" style={{ margin: 0, marginBottom: 'var(--ds-spacing-l)' }}>
          Text and image side by side. Reduces visual weight by giving the image only half the space.
        </Text>
        <HeroSplit50 {...mockHero} />
      </section>

      <section style={{ marginBottom: 'var(--ds-spacing-4xl)' }}>
        <h2 style={{ fontSize: 'var(--ds-typography-h4)', fontWeight: 'var(--ds-typography-weight-medium)', marginBottom: 'var(--ds-spacing-l)' }}>
          2. HeroSplit50Reveal – 50/50 with scroll transition
        </h2>
        <Text size="S" weight="low" color="low" as="p" style={{ margin: 0, marginBottom: 'var(--ds-spacing-l)' }}>
          Same layout. Image fades and slides in when entering viewport.
        </Text>
        <HeroSplit50Reveal {...mockHero} />
      </section>

      <section style={{ marginBottom: 'var(--ds-spacing-4xl)' }}>
        <h2 style={{ fontSize: 'var(--ds-typography-h4)', fontWeight: 'var(--ds-typography-weight-medium)', marginBottom: 'var(--ds-spacing-l)' }}>
          3. HeroColourImage – Colour band + image
        </h2>
        <Text size="S" weight="low" color="low" as="p" style={{ margin: 0, marginBottom: 'var(--ds-spacing-l)' }}>
          Bold colour holds the text. Strong visual separation. Image feels contained.
        </Text>
        <HeroColourImage {...mockHero} />
      </section>

      <section style={{ marginBottom: 'var(--ds-spacing-4xl)' }}>
        <h2 style={{ fontSize: 'var(--ds-typography-h4)', fontWeight: 'var(--ds-typography-weight-medium)', marginBottom: 'var(--ds-spacing-l)' }}>
          4. HeroColourEdge – Full image with gradient overlay
        </h2>
        <Text size="S" weight="low" color="low" as="p" style={{ margin: 0, marginBottom: 'var(--ds-spacing-l)' }}>
          Image fills the hero. Soft gradient from one edge holds the text.
        </Text>
        <HeroColourEdge {...mockHero} />
      </section>
      </main>
    </>
  )
}
