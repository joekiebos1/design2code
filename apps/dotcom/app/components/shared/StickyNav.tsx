'use client'

import Link from 'next/link'
import { Text, Button } from '@marcelinodzn/ds-react'
import { WidthCap } from '@design2code/block-library'

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
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#fff',
        borderBottom: '1px solid var(--ds-color-stroke-divider)',
      }}
    >
      <WidthCap
        as="div"
        contentWidth="XL"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--ds-spacing-l)',
          paddingBlock: 'var(--ds-spacing-s)',
          paddingInline: 'var(--ds-grid-margin)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-l)',
          }}
        >
          <Text size="S" weight="medium" as="span" color="high">
            {pageTitle}
          </Text>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-s)',
            }}
          >
            {SECONDARY_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: 'var(--ds-color-text-medium)',
                  textDecoration: 'none',
                  fontSize: 'var(--ds-typography-label-s)',
                  fontWeight: 'var(--ds-typography-weight-low)',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <Button appearance="primary" attention="high" size="XS">
          Shop now
        </Button>
      </WidthCap>
    </nav>
  )
}
