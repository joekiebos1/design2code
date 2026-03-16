'use client'

import { useEdgeToEdgeMediaStyles } from './edge-to-edge'
import { useGridBreakpoint } from './use-grid-breakpoint'

/**
 * Block-level surface and accent utilities.
 *
 * ## Schema fields (Sanity)
 * - **emphasis**: ghost | minimal | subtle | bold — block background strength
 * - **surfaceColour**: primary | secondary | sparkle | neutral — colour theme
 * - **theme**: design system theme (optional, per block)
 *
 * ## Renderer mapping
 * BlockRenderer and LabBlockRenderer pass block.emphasis and block.surfaceColour directly to block props.
 * Queries fetch emphasis and surfaceColour only (no legacy field names).
 *
 * ## Block props
 * All blocks receive: emphasis, surfaceColour (and theme where applicable).
 *
 * DS terminology (from @marcelinodzn/ds-tokens colors.appearance):
 * - Primary = brand primary (Background/Minimal, Background/Subtle, Background/Bold)
 * - Secondary = brand secondary
 * - Neutral = neutral grey scale
 *
 * Context/theme coupling: BlockSurfaceProvider uses useDsContext() from ds-react to get tokenContext.
 * Colors are resolved at runtime via colors.appearance(), so they stay in sync with DsProvider (platform,
 * colorMode, theme). If you add dark mode or responsive platform to DsProvider, block backgrounds adapt.
 */

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { SurfaceProvider, useDsContext } from '@marcelinodzn/ds-react'
import { colors } from '@marcelinodzn/ds-tokens'

/** Block emphasis: ghost, minimal, subtle, bold. Maps to SurfaceProvider level + hasBoldBackground. */
export type Emphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'

/** Surface colour: primary, secondary, sparkle, neutral. Maps to DS appearance tokens. */
export type SurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use Emphasis instead. */
export type BlockSurface = Emphasis

/** @deprecated Use SurfaceColour instead. */
export type BlockAccent = SurfaceColour

/** SurfaceProvider props derived from block emphasis. */
export type SurfaceProviderProps = {
  level: 0 | 1
  hasBoldBackground: boolean
  /** Colored (non-bold) background; enables high-tinted typography/icons. */
  hasColoredBackground?: boolean
}

/**
 * Maps block emphasis to SurfaceProvider props.
 * Content author chooses emphasis; DS components adapt automatically from context.
 * - minimal/subtle: level 1, hasColoredBackground for tinted adaptation
 * - bold: level 1, hasBoldBackground for on-bold text/icons
 */
export function getSurfaceProviderProps(emphasis: Emphasis | 'none' | null | undefined): SurfaceProviderProps {
  switch (emphasis) {
    case 'minimal':
    case 'subtle':
      return { level: 1, hasBoldBackground: false, hasColoredBackground: true }
    case 'bold':
      return { level: 1, hasBoldBackground: true, hasColoredBackground: false }
    case 'ghost':
    case 'none':
    default:
      return { level: 0, hasBoldBackground: false, hasColoredBackground: false }
  }
}

/**
 * Resolve block background color from DS at runtime.
 * Uses tokenContext from DsProvider — platform, colorMode, theme flow through automatically.
 */
function resolveBlockBackgroundColor(
  emphasis: Emphasis | 'none' | null | undefined,
  surfaceColour: SurfaceColour | null | undefined,
  tokenContext: Record<string, string> | undefined
): string | undefined {
  const accent = surfaceColour
  if (!emphasis || emphasis === 'ghost' || emphasis === 'none' || !tokenContext || !accent) return undefined

  const appearanceMap: Record<SurfaceColour, 'Primary' | 'Secondary' | 'Sparkle' | 'Neutral'> = {
    primary: 'Primary',
    secondary: 'Secondary',
    sparkle: 'Sparkle',
    neutral: 'Neutral',
  }
  const variantMap = {
    minimal: 'Background/Minimal',
    subtle: 'Background/Subtle',
    bold: 'Background/Bold',
  } as const
  const variant = variantMap[emphasis]
  if (!variant) return undefined
  let value = colors.appearance(appearanceMap[accent], variant, tokenContext)
  // Fallback: Sparkle may not be in all themes; use Primary if undefined
  if (value == null && accent === 'sparkle') {
    value = colors.appearance('Primary', variant, tokenContext)
  }
  return value != null ? String(value) : undefined
}

/**
 * Hook to resolve block background color from DS at runtime.
 * Use when you need the color outside BlockSurfaceProvider (e.g. MediaTextBlock).
 * Requires DsProvider — uses useDsContext() for platform, colorMode, theme.
 */
export function useBlockBackgroundColor(
  emphasis: Emphasis | 'none' | null | undefined,
  surfaceColour: SurfaceColour | null | undefined
): string | undefined {
  const { tokenContext } = useDsContext()
  return useMemo(
    () => resolveBlockBackgroundColor(emphasis, surfaceColour, tokenContext),
    [emphasis, surfaceColour, tokenContext]
  )
}

/** Minimal background style: block (solid) or gradient (white to minimal). Only applies when emphasis is minimal. */
export type MinimalBackgroundStyle = 'block' | 'gradient'

export type BlockSurfaceProviderProps = {
  emphasis?: Emphasis | 'none' | null
  surfaceColour?: SurfaceColour | null
  /** When minimal: block = solid, gradient = white to minimal. Ignored for other surfaces. */
  minimalBackgroundStyle?: MinimalBackgroundStyle | null
  children: ReactNode
  /** When true, background spans full viewport width (100vw). Default false. */
  fullWidth?: boolean
  /** When true, omit top padding so content (e.g. media) sits flush at top. Used for sideBySide edgeToEdge Hero with minimal/subtle. */
  flushTop?: boolean
  /** When true, omit bottom padding. Use with flushTop for symmetric vertical alignment (sideBySide edgeToEdge). */
  flushBottom?: boolean
}

/**
 * Wraps children with SurfaceProvider and optionally a coloured background band.
 * Use when a block needs block-level surface + accent. For blocks with custom layout (e.g. MediaTextBlock),
 * use getSurfaceProviderProps and useBlockBackgroundColor directly.
 *
 * Uses useDsContext() for token resolution — stays in sync with DsProvider (platform, colorMode, theme).
 */
export function BlockSurfaceProvider({
  emphasis,
  surfaceColour,
  minimalBackgroundStyle = 'block',
  children,
  fullWidth = false,
  flushTop = false,
  flushBottom = false,
}: BlockSurfaceProviderProps) {
  const surfaceProps = getSurfaceProviderProps(emphasis)
  const bgColor = useBlockBackgroundColor(emphasis, surfaceColour)
  const edgeStyles = useEdgeToEdgeMediaStyles()
  const { contentMaxWide } = useGridBreakpoint()

  const content = <SurfaceProvider {...surfaceProps}>{children}</SurfaceProvider>

  if (bgColor) {
    const useGradient =
      emphasis === 'minimal' && minimalBackgroundStyle === 'gradient'
    const background = useGradient
      ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
      : bgColor

    /** fullWidth: band spans full viewport (100vw); content inside capped at 1920px. */
    if (fullWidth) {
      return (
        <div
          style={{
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            background,
            boxSizing: 'border-box',
            paddingBlockStart: flushTop ? 0 : 'var(--ds-spacing-4xl)',
            paddingBlockEnd: flushBottom ? 0 : 'var(--ds-spacing-4xl)',
          }}
        >
          <div style={{ ...edgeStyles.inner, overflowX: edgeStyles.isCapped ? 'hidden' : 'visible' }}>{content}</div>
        </div>
      )
    }

    /** Contained: band aligned to Wide content (contentMaxWide). */
    return (
      <div
        style={{
          width: '100%',
          maxWidth: contentMaxWide,
          marginInline: 'auto',
          background,
          boxSizing: 'border-box',
          paddingBlockStart: flushTop ? 0 : 'var(--ds-spacing-4xl)',
          paddingBlockEnd: flushBottom ? 0 : 'var(--ds-spacing-4xl)',
        }}
      >
        {content}
      </div>
    )
  }
  return content
}
