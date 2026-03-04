'use client'

import { useGridBreakpoint } from '../lib/use-grid-breakpoint'

type GridBlockProps = {
  children: React.ReactNode
  as?: 'section' | 'div'
}

/**
 * Shared grid wrapper – same logic as Hero block.
 * Uses foundation grid (columns, margin, gutter) from useGridBreakpoint.
 */
export function GridBlock({ children, as: Component = 'section' }: GridBlockProps) {
  const { columns, marginPx, gutterPx, gridMaxWidth } = useGridBreakpoint()
  return (
    <Component
      style={{
        width: '100%',
        maxWidth: gridMaxWidth,
        marginInline: gridMaxWidth ? 'auto' : undefined,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gutterPx,
        paddingLeft: marginPx,
        paddingRight: marginPx,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Component>
  )
}

/** Content width: XS (4), S (6), M (8), Default (10), Wide (12), edgeToEdge. */
export type ContentWidth = 'XS' | 'S' | 'M' | 'Default' | 'Wide' | 'edgeToEdge'

/** Cell spanning the given content width, centered. Desktop: XS=4, S=6, M=8, Default=10, Wide=12. Tablet: XS=4, S=6, M=6, Default=6, Wide=8. Mobile: all=4. */
export function useGridCell(contentWidth: ContentWidth = 'Default') {
  const { columns } = useGridBreakpoint()
  const isFull = contentWidth === 'Wide' || contentWidth === 'edgeToEdge'
  const span =
    columns === 12
      ? isFull
        ? 12
        : contentWidth === 'Default'
          ? 10
          : contentWidth === 'M'
            ? 8
            : contentWidth === 'S'
              ? 6
              : contentWidth === 'XS'
                ? 4
                : 12
      : columns === 8
        ? isFull
          ? 8
          : contentWidth === 'XS'
            ? 4
            : contentWidth === 'S'
              ? 6
              : 6
        : 4
  const start = Math.floor((columns - span) / 2) + 1
  return { gridColumn: `${start} / span ${span}` as const }
}
