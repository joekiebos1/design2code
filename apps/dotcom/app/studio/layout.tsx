import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', overflowX: 'hidden', background: 'var(--ds-color-background-ghost)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingBlock: 'var(--ds-spacing-s)',
          paddingInline: 'var(--ds-spacing-m)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
          <Link
            href="/"
            style={{
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: 'rgba(0, 0, 0, 0.65)',
              textDecoration: 'none',
              fontSize: 'var(--ds-typography-label-m)',
            }}
          >
            Page Architect
          </Link>
          <nav style={{ display: 'flex', gap: 'var(--ds-spacing-m)', alignItems: 'center' }}>
            <Link
              href="/studio"
              style={{
                color: 'rgba(0, 0, 0, 0.48)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-s)',
              }}
            >
              Studio home
            </Link>
            <Link
              href="/studio/storytelling-inspiration"
              style={{
                color: 'rgba(0, 0, 0, 0.48)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-s)',
              }}
            >
              Storytelling Inspiration
            </Link>
            <Link
              href="/studio/block-inspiration"
              style={{
                color: 'rgba(0, 0, 0, 0.48)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-s)',
              }}
            >
              Block Inspiration
            </Link>
            <Link
              href="/jiokarna"
              style={{
                color: 'rgba(0, 0, 0, 0.48)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-s)',
              }}
            >
            JioKarna
          </Link>
        </nav>
      </header>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', overflowX: 'hidden' }}>{children}</div>
    </div>
  )
}
