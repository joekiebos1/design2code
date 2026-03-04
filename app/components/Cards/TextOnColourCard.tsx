'use client'

import { SurfaceProvider } from '@marcelinodzn/ds-react'
import type { CardSurface } from './Card.types'

export type TextOnColourCardAspectRatio = '4:5' | '8:5' | '2:1'

export type TextOnColourCardSize = 'compact' | 'large'

export type TextOnColourCardProps = {
  title?: string | null
  description?: string | null
  surface?: CardSurface
  /** Matches MediaCard aspect ratios for carousel parity. Default 4:5. */
  aspectRatio?: TextOnColourCardAspectRatio
  /** compact: smaller typography (h5 + label-s). large: larger (h4 + label-m). */
  size?: TextOnColourCardSize
}

const ASPECT_MAP = { '4:5': '4/5' as const, '8:5': '8/5' as const, '2:1': '2/1' as const }

export function TextOnColourCard({
  title,
  description,
  surface = 'bold',
  aspectRatio = '4:5',
  size = 'compact',
}: TextOnColourCardProps) {
  const hasBoldBackground = surface === 'bold'
  const isLarge = size === 'large'
  const titleFontSize = isLarge ? 'var(--ds-typography-h4)' : 'var(--ds-typography-h5)'
  const descFontSize = isLarge ? 'var(--ds-typography-label-m)' : 'var(--ds-typography-label-s)'
  const titleWeight = isLarge ? 'var(--ds-typography-weight-low)' : 'var(--ds-typography-weight-medium)'

  const colouredDiv = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 'var(--ds-spacing-m)',
        padding: 'var(--ds-spacing-2xl)',
        width: '100%',
        boxSizing: 'border-box',
        aspectRatio: ASPECT_MAP[aspectRatio],
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-card-m)',
        background: hasBoldBackground
          ? 'var(--ds-color-surface-bold)'
          : 'var(--ds-color-block-background-subtle)',
        textAlign: 'left',
      }}
    >
      {title && (
        <p
          style={{
            margin: 0,
            width: '100%',
            fontSize: titleFontSize,
            fontWeight: titleWeight,
            color: hasBoldBackground ? 'var(--local-color-text-on-overlay)' : 'var(--ds-color-text-high)',
            lineHeight: 1.4,
          }}
        >
          {title}
        </p>
      )}
      {description && (
        <p
          style={{
            margin: 0,
            width: '100%',
            fontSize: descFontSize,
            fontWeight: 'var(--ds-typography-weight-low)',
            color: hasBoldBackground ? 'var(--local-color-text-on-overlay-subtle)' : 'var(--ds-color-text-low)',
            lineHeight: 1.4,
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </p>
      )}
    </div>
  )

  return <SurfaceProvider level={1} hasBoldBackground={hasBoldBackground}>{colouredDiv}</SurfaceProvider>
}
