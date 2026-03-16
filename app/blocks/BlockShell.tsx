'use client'

/**
 * BlockShell — Layer 2: Pattern (Band/Overlay/Contained) + vertical spacing.
 *
 * Single place for block width pattern and spacing. BlockRenderer passes pattern
 * and spacing; BlockShell applies them. Blocks render content only.
 *
 * See lib/blocks/layout-rules.md
 */

import React, { type ReactNode } from 'react'
import { BlockSurfaceProvider } from '../../lib/utils/block-surface'
import type { Emphasis, SurfaceColour } from '../../lib/utils/block-surface'

export type BlockPattern = 'band' | 'overlay' | 'contained'

export type BlockSpacing = 'none' | 'medium' | 'large'

export const SPACING_VAR: Record<BlockSpacing, string> = {
  none: '0',
  medium: 'var(--ds-spacing-3xl)',
  large: 'var(--ds-spacing-4xl)',
}

function normalizeSpacing(v: unknown): BlockSpacing {
  const s = (v as string)?.toLowerCase?.()
  if (s === 'small') return 'none'
  if (s === 'none' || s === 'medium' || s === 'large') return s
  return 'large'
}

export type BlockShellProps = {
  pattern: BlockPattern
  spacingTop?: BlockSpacing | string | null
  spacingBottom?: BlockSpacing | string | null
  /** For Band pattern only */
  emphasis?: Emphasis | null
  surfaceColour?: SurfaceColour | null
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  /** Omit BlockSurfaceProvider band padding (e.g. hero top-to-bottom). */
  flushTop?: boolean
  flushBottom?: boolean
  children: ReactNode
  style?: React.CSSProperties
}

function BandShell({
  emphasis,
  surfaceColour,
  minimalBackgroundStyle,
  paddingStyle,
  flushTop,
  flushBottom,
  children,
}: {
  emphasis: Emphasis | null | undefined
  surfaceColour: SurfaceColour | null | undefined
  minimalBackgroundStyle: 'block' | 'gradient' | null
  paddingStyle: React.CSSProperties
  flushTop?: boolean
  flushBottom?: boolean
  children: ReactNode
}) {
  return (
    <div style={paddingStyle}>
      <BlockSurfaceProvider
        emphasis={emphasis ?? undefined}
        surfaceColour={surfaceColour ?? undefined}
        minimalBackgroundStyle={minimalBackgroundStyle ?? 'block'}
        fullWidth
        flushTop={flushTop}
        flushBottom={flushBottom}
      >
        {children}
      </BlockSurfaceProvider>
    </div>
  )
}

function OverlayShell({ paddingStyle, children }: { paddingStyle: React.CSSProperties; children: ReactNode }) {
  /** Block renders overlay (breakout + media). Shell only applies spacing. */
  return (
    <div style={{ overflow: 'visible', ...paddingStyle }}>
      {children}
    </div>
  )
}

function ContainedShell({
  emphasis,
  surfaceColour,
  minimalBackgroundStyle,
  paddingStyle,
  flushTop,
  flushBottom,
  children,
}: {
  emphasis: Emphasis | null | undefined
  surfaceColour: SurfaceColour | null | undefined
  minimalBackgroundStyle: 'block' | 'gradient' | null
  paddingStyle: React.CSSProperties
  flushTop?: boolean
  flushBottom?: boolean
  children: ReactNode
}) {
  const hasSurface = emphasis && !['ghost', 'none'].includes(emphasis)

  if (hasSurface) {
    return (
      <div
        style={{
          position: 'relative',
          overflow: 'visible',
          ...paddingStyle,
        }}
      >
        <BlockSurfaceProvider
          emphasis={emphasis ?? undefined}
          surfaceColour={surfaceColour ?? undefined}
          minimalBackgroundStyle={minimalBackgroundStyle ?? 'block'}
          fullWidth={false}
          flushTop={flushTop}
          flushBottom={flushBottom}
        >
          {children}
        </BlockSurfaceProvider>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'visible',
        ...paddingStyle,
      }}
    >
      {children}
    </div>
  )
}

export function BlockShell({
  pattern,
  spacingTop,
  spacingBottom,
  emphasis,
  surfaceColour,
  minimalBackgroundStyle = 'block',
  flushTop,
  flushBottom,
  children,
  style,
}: BlockShellProps) {
  const topNorm = spacingTop ? normalizeSpacing(spacingTop) : 'large'
  const bottomNorm = spacingBottom ? normalizeSpacing(spacingBottom) : 'large'
  const topVal = SPACING_VAR[topNorm]
  const bottomVal = SPACING_VAR[bottomNorm]

  const paddingStyle: React.CSSProperties = {
    paddingBlockStart: topVal !== '0' ? topVal : undefined,
    paddingBlockEnd: bottomVal !== '0' ? bottomVal : undefined,
  }

  if (pattern === 'band') {
    return (
      <BandShell
        emphasis={emphasis}
        surfaceColour={surfaceColour}
        minimalBackgroundStyle={minimalBackgroundStyle ?? 'block'}
        paddingStyle={paddingStyle}
        flushTop={flushTop}
        flushBottom={flushBottom}
      >
        <div style={style}>{children}</div>
      </BandShell>
    )
  }

  if (pattern === 'overlay') {
    return (
      <OverlayShell paddingStyle={paddingStyle}>
        <div style={style}>{children}</div>
      </OverlayShell>
    )
  }

  return (
    <ContainedShell
      emphasis={emphasis}
      surfaceColour={surfaceColour}
      minimalBackgroundStyle={minimalBackgroundStyle ?? 'block'}
      paddingStyle={paddingStyle}
      flushTop={flushTop}
      flushBottom={flushBottom}
    >
      <div style={style}>{children}</div>
    </ContainedShell>
  )
}
