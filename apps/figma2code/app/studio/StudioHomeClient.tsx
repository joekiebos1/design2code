'use client'

import Link from 'next/link'
import { Headline, Text, SurfaceProvider, Card, CardBody } from '@marcelinodzn/ds-react'
import styles from './studio-home.module.css'

const TOOLS = [
  {
    href: '/studio/storytelling-inspiration',
    title: 'Storytelling Inspiration',
    description: 'Narrative arc and block structure from a product brief — buyer modalities, arc, and exportable blocks.',
  },
  {
    href: '/studio/block-inspiration',
    title: 'Block Inspiration',
    description: 'Browse production blocks and variants — layout, spacing, and visual reference for page composition.',
  },
] as const

export function StudioHomeClient() {
  return (
    <SurfaceProvider level={0}>
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: 'var(--ds-spacing-2xl)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Headline
            level={1}
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-s)',
              fontSize: 'var(--ds-typography-display-s)',
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: 'var(--ds-color-text-high)',
              letterSpacing: '-0.02em',
            }}
          >
            Jio.com Design Studio
          </Headline>
          <Text
            size="M"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2xl)',
              fontWeight: 'var(--ds-typography-weight-low)',
              color: 'rgba(0, 0, 0, 0.48)',
              fontSize: 'var(--ds-typography-body-m)',
            }}
          >
            Choose a tool to open.
          </Text>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--ds-spacing-xl)',
            }}
          >
            {TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href} className={styles.cardLink}>
                <div className={styles.cardWrap}>
                  <Card
                    surface="minimal"
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <CardBody style={{ padding: 'var(--ds-spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                    <Headline
                      level={2}
                      style={{
                        margin: 0,
                        fontSize: 'var(--ds-typography-headline-s)',
                        fontWeight: 'var(--ds-typography-weight-medium)',
                        color: 'var(--ds-color-text-high)',
                      }}
                    >
                      {tool.title}
                    </Headline>
                    <Text
                      size="M"
                      style={{
                        margin: 0,
                        fontWeight: 'var(--ds-typography-weight-low)',
                        color: 'rgba(0, 0, 0, 0.48)',
                        lineHeight: 1.5,
                        fontSize: 'var(--ds-typography-body-m)',
                      }}
                    >
                      {tool.description}
                    </Text>
                    </CardBody>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </SurfaceProvider>
  )
}
