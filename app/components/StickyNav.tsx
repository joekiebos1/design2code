'use client'

import Link from 'next/link'
import { Text, Button } from '@marcelinodzn/ds-react'

type StickyNavProps = {
  pageTitle: string
}

const SECONDARY_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Tech specs', href: '#tech-specs' },
  { label: 'Resources', href: '#resources' },
] as const

export function StickyNav({ pageTitle }: StickyNavProps) {
  return (
    <nav
      className="ds-container"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--ds-spacing-xl)',
        paddingBlock: 'var(--ds-spacing-m)',
        background: 'var(--ds-color-background-subtle)',
        borderBottom: '1px solid var(--ds-color-stroke-divider)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-xl)',
        }}
      >
        <Text size="M" weight="medium" as="span" color="high">
          {pageTitle}
        </Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-m)',
          }}
        >
          {SECONDARY_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: 'var(--ds-color-text-medium)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-m)',
                fontWeight: 'var(--ds-typography-weight-low)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <Button appearance="primary" attention="high" size="M">
        Shop now
      </Button>
    </nav>
  )
}
