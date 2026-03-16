'use client'

/**
 * Grid — divides available space into columns (12/8/4 by breakpoint).
 * Owns the page margin (paddingInline) and gutter (gap) via DS tokens.
 *
 * CSS tokens handle columns, gutter, and margin — they update automatically
 * at breakpoints without JS. Only gridMaxWidth requires JS (caps grid at
 * the 1346px container max on desktop).
 *
 * See lib/blocks/layout-rules.md
 */

import { useGridBreakpoint } from '../../../lib/utils/use-grid-breakpoint'
import type { ContentWidth } from '../../blocks/WidthCap'

/**
 * Enable grid column debugging via .env.local:
 * NEXT_PUBLIC_DEBUG_GRID=true
 */
const DEBUG_GRID = process.env.NEXT_PUBLIC_DEBUG_GRID === 'true'

type GridProps = {
  children: React.ReactNode
  as?: 'section' | 'div' | 'main'
  style?: Omit<React.CSSProperties, 'gap'>
}

/**
 * Grid gap is always var(--ds-grid-gutter). It is never overridden.
 * To create space between content columns, use column shift, cell padding,
 * or explicit gridColumn placement. See lib/blocks/layout-rules.md.
 */
export function Grid({ children, as: Component = 'div', style }: GridProps) {
  // gridMaxWidth is the only JS value needed here.
  // It caps the grid at the 1346px container max on desktop.
  // All other values (columns, gutter, margin) come from CSS tokens.
  const { gridMaxWidth } = useGridBreakpoint()

  /**
   * Debug stripes aligned to actual columns only (not the margin/padding area).
   * Each stripe = one column width. Each gap = one gutter.
   *
   * background-clip: content-box + background-origin: content-box ensure
   * stripes paint only in the content area (between the paddings), not
   * in the page margin (paddingInline).
   *
   * Formula: column width = (100% - (cols-1)*gutter) / cols
   * (100% is content-box width; margin is excluded by clip.)
   */
  const debugBackground = DEBUG_GRID
    ? {
        backgroundImage: `repeating-linear-gradient(
          to right,
          rgba(255, 0, 0, 0.12) 0px,
          rgba(255, 0, 0, 0.12) calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns)),
          transparent calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns)),
          transparent calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns) + var(--ds-grid-gutter))
        )`,
        backgroundOrigin: 'content-box',
        backgroundClip: 'content-box',
        backgroundRepeat: 'repeat-x',
      }
    : {}

  return (
    <Component
      style={{
        width: '100%',
        maxWidth: gridMaxWidth,                 // JS — desktop container cap (1346px)
        marginInline: 'auto',                   // centres grid when maxWidth kicks in
        display: 'grid',
        gridTemplateColumns: 'repeat(var(--ds-grid-columns), 1fr)',
        paddingInline: 'var(--ds-grid-margin)', // page margin — viewport edge to grid edge
        boxSizing: 'border-box',
        ...debugBackground,
        ...style,
        gap: 'var(--ds-grid-gutter)',           // always last — never overridden
      }}
    >
      {children}
    </Component>
  )
}

/**
 * useCell — claims columns inside a Grid. Returns { gridColumn }.
 * Use inside Grid only. Never use standalone.
 *
 * Size → column span:
 *   XS      = 4 cols
 *   S       = 6 cols
 *   M       = 8 cols
 *   Default = 10 cols
 *   Wide    = 12 cols (full grid)
 *
 * Tablet (8 cols): XS=4, all others collapse to 6.
 * Mobile (4 cols): always full width (4 cols).
 *
 * Content is centred by calculating the start column from the span.
 * See lib/blocks/layout-rules.md
 */
export function useCell(contentWidth: ContentWidth = 'Default') {
  const { columns } = useGridBreakpoint()

  const span =
    columns === 12
      ? contentWidth === 'XS'
        ? 4
        : contentWidth === 'S'
          ? 6
          : contentWidth === 'M'
            ? 8
            : contentWidth === 'Default'
              ? 10
              : 12 // Wide, edgeToEdge, full
      : columns === 8
        ? contentWidth === 'XS'
          ? 4
          : 6   // S, M, Default, Wide collapse to 6 on tablet
        : 4     // mobile — always full width

  const start = Math.floor((columns - span) / 2) + 1

  return { gridColumn: `${start} / span ${span}` as const }
}
