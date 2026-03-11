'use client'

/**
 * Block-level surface and accent utilities.
 * Content managers set these per block via Sanity; blocks use them for SurfaceProvider and background colours.
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

/** Block surface/background: ghost, minimal, subtle, bold. Maps to SurfaceProvider level + hasBoldBackground. */
export type BlockSurface = 'ghost' | 'minimal' | 'subtle' | 'bold'

/** Block accent/colour theme: primary, secondary, neutral. Maps to DS appearance tokens. */
export type BlockAccent = 'primary' | 'secondary' | 'neutral'

/** SurfaceProvider props derived from block surface. */
export type SurfaceProviderProps = {
  level: 0 | 1
  hasBoldBackground: boolean
  /** Colored (non-bold) background; enables high-tinted typography/icons. */
  hasColoredBackground?: boolean
}

/**
 * Maps block surface to SurfaceProvider props.
 * Content author chooses surface; DS components adapt automatically from context.
 * - minimal/subtle: level 1, hasColoredBackground for tinted adaptation
 * - bold: level 1, hasBoldBackground for on-bold text/icons
 */
export function getSurfaceProviderProps(blockSurface: BlockSurface | 'none' | null | undefined): SurfaceProviderProps {
  switch (blockSurface) {
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
  blockSurface: BlockSurface | 'none' | null | undefined,
  blockAccent: BlockAccent | null | undefined,
  tokenContext: Record<string, string> | undefined
): string | undefined {
  const accent = blockAccent ?? 'primary'
  if (!blockSurface || blockSurface === 'ghost' || blockSurface === 'none' || !tokenContext) return undefined

  const appearanceMap: Record<BlockAccent, 'Primary' | 'Secondary' | 'Neutral'> = {
    primary: 'Primary',
    secondary: 'Secondary',
    neutral: 'Neutral',
  }
  const variantMap = {
    minimal: 'Background/Minimal',
    subtle: 'Background/Subtle',
    bold: 'Background/Bold',
  } as const
  const variant = variantMap[blockSurface]
  if (!variant) return undefined
  const value = colors.appearance(appearanceMap[accent], variant, tokenContext)
  return value != null ? String(value) : undefined
}

/**
 * Hook to resolve block background color from DS at runtime.
 * Use when you need the color outside BlockSurfaceProvider (e.g. MediaTextBlock).
 * Requires DsProvider — uses useDsContext() for platform, colorMode, theme.
 */
export function useBlockBackgroundColor(
  blockSurface: BlockSurface | 'none' | null | undefined,
  blockAccent: BlockAccent | null | undefined = 'primary'
): string | undefined {
  const { tokenContext } = useDsContext()
  return useMemo(
    () => resolveBlockBackgroundColor(blockSurface, blockAccent, tokenContext),
    [blockSurface, blockAccent, tokenContext]
  )
}

/** Minimal background style: block (solid) or gradient (white to minimal). Only applies when blockSurface is minimal. */
export type MinimalBackgroundStyle = 'block' | 'gradient'

export type BlockSurfaceProviderProps = {
  blockSurface?: BlockSurface | 'none' | null
  blockAccent?: BlockAccent | null
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
  blockSurface = 'ghost',
  blockAccent = 'primary',
  minimalBackgroundStyle = 'block',
  children,
  fullWidth = false,
  flushTop = false,
  flushBottom = false,
}: BlockSurfaceProviderProps) {
  const surfaceProps = getSurfaceProviderProps(blockSurface)
  const bgColor = useBlockBackgroundColor(blockSurface, blockAccent)

  const content = <SurfaceProvider {...surfaceProps}>{children}</SurfaceProvider>

  if (bgColor) {
    const useGradient =
      blockSurface === 'minimal' && minimalBackgroundStyle === 'gradient'
    const background = useGradient
      ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
      : bgColor

        /** Coloured padding: Large (4xl) by default. flushTop/flushBottom omit padding for symmetric alignment (sideBySide edgeToEdge Hero). */
    return (
      <div
        style={{
          width: fullWidth ? '100vw' : '100%',
          maxWidth: fullWidth ? '100vw' : undefined,
          marginLeft: fullWidth ? 'calc(50% - 50vw)' : undefined,
          marginRight: fullWidth ? 'calc(50% - 50vw)' : undefined,
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
