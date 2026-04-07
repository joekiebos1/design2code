'use client'

import { LAB_OVERLAY_TEXT, labPlainBodyStyle, labPlainSubtitleStyle } from '@design2code/ds'

/** Shared card typography — roles: subtitle (plain), body (plain) */
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        ...labPlainSubtitleStyle(),
        margin: 0,
        width: '100%',
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
        ...labPlainBodyStyle(),
        margin: 0,
        width: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}

/** Title/description for overlay (text-on-image) - light text */
export function CardOverlayTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        ...LAB_OVERLAY_TEXT.title,
        margin: 0,
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
        ...LAB_OVERLAY_TEXT.description,
        margin: 'var(--ds-spacing-xs) 0 0',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}
