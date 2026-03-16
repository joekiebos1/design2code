'use client'

import { createTransition } from '@marcelinodzn/ds-tokens'
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
  /** compact: h3 + label-s. large: h2 + label-m. */
  size?: TextOnColourCardSize
  /** Override title font size (e.g. medium carousel 4:5). */
  titleFontSize?: string
  /** When false, text starts below and animates up on enter. Carousel context. */
  inView?: boolean
  /** When true, skip motion. */
  prefersReducedMotion?: boolean
}

const ASPECT_MAP = { '4:5': '4/5' as const, '8:5': '8/5' as const, '2:1': '2/1' as const }

export function TextOnColourCard({
  title,
  description,
  surface = 'bold',
  aspectRatio = '4:5',
  size = 'compact',
  titleFontSize: titleFontSizeProp,
  inView = true,
  prefersReducedMotion = false,
}: TextOnColourCardProps) {
  const hasBoldBackground = surface === 'bold'
  const isLarge = size === 'large'
  const is4_5 = aspectRatio === '4:5'
  const titleFontSize =
    titleFontSizeProp ??
    (is4_5 ? 'var(--ds-typography-h4)' : 'var(--ds-typography-h2)')
  const descFontSize = 'var(--ds-typography-label-s)'
  const titleWeight = isLarge ? 'var(--ds-typography-weight-low)' : 'var(--ds-typography-weight-medium)'

  const textTransform = inView ? 'translateY(0)' : 'translateY(var(--ds-spacing-m))'
  const textTransition = prefersReducedMotion ? undefined : createTransition('transform', 'xl', 'transition', 'moderate')

  /** Text stays visible; whole card fades via carousel wrapper. Text has vertical entrance on inView. */
  const colouredDiv = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: 'var(--ds-spacing-m)',
        padding: isLarge
          ? 'var(--ds-spacing-3xl) var(--ds-spacing-4xl) var(--ds-spacing-3xl) var(--ds-spacing-3xl)'
          : 'var(--ds-spacing-xl) var(--ds-spacing-2xl)',
        width: '100%',
        boxSizing: 'border-box',
        aspectRatio: ASPECT_MAP[aspectRatio],
        minHeight: 0,
        background: hasBoldBackground
          ? 'var(--ds-color-surface-bold)'
          : 'var(--ds-color-block-background-subtle)',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-m)',
          transform: textTransform,
          transition: textTransition,
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
              whiteSpace: 'pre-line',
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
    </div>
  )

  return <SurfaceProvider level={1} hasBoldBackground={hasBoldBackground}>{colouredDiv}</SurfaceProvider>
}
