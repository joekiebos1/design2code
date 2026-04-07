'use client'

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        width: '100%',
        fontSize: 'var(--ds-typography-h5)',
        fontWeight: 'var(--ds-typography-weight-medium)',
        color: 'var(--ds-color-text-high)',
        lineHeight: 1.4,
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        width: '100%',
        fontSize: 'var(--ds-typography-label-s)',
        lineHeight: 1.4,
        color: 'var(--ds-color-text-low)',
        fontWeight: 'var(--ds-typography-weight-low)',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}

export function CardOverlayTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 'var(--ds-typography-h5)',
        fontWeight: 'var(--ds-typography-weight-medium)',
        color: 'var(--local-color-text-on-overlay)',
        lineHeight: 1.4,
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}

export function CardOverlayDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 'var(--ds-spacing-xs) 0 0',
        fontSize: 'var(--ds-typography-label-s)',
        lineHeight: 1.4,
        color: 'var(--local-color-text-on-overlay-subtle)',
        fontWeight: 'var(--ds-typography-weight-low)',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}
