import Link from 'next/link'
import type { Metadata } from 'next'
import { JioKarnaProvider } from './JioKarnaContext'

export const metadata: Metadata = {
  title: 'JioKarna',
}

export default function JioKarnaLayout({ children }: { children: React.ReactNode }) {
  return (
    <JioKarnaProvider>
      <main style={{ minHeight: '100vh', background: 'var(--ds-color-background-ghost)' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            paddingBlock: 'var(--ds-spacing-s)',
            paddingInline: 'var(--ds-spacing-m)',
            borderBottom: '1px solid var(--ds-color-stroke-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--ds-color-background-subtle)',
          }}
        >
          <Link
            href="/"
            style={{
              fontWeight: 'var(--ds-typography-weight-high)',
              color: 'var(--ds-color-text-high)',
              textDecoration: 'none',
              fontSize: 'var(--ds-typography-label-m)',
            }}
          >
            Page Architect
          </Link>
          <Link
            href="/jiokarna"
            style={{
              color: 'var(--ds-color-text-medium)',
              textDecoration: 'none',
              fontSize: 'var(--ds-typography-label-s)',
            }}
          >
            JioKarna
          </Link>
        </header>
        {children}
      </main>
    </JioKarnaProvider>
  )
}
