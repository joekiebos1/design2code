'use client'

import { useGridBreakpoint } from '@design2code/ds'
import type { ContentWidth } from '../../production/WidthCap'

const DEBUG_GRID = process.env.NEXT_PUBLIC_DEBUG_GRID === 'true'

type GridProps = {
  children: React.ReactNode
  as?: 'section' | 'div' | 'main'
  style?: Omit<React.CSSProperties, 'gap'>
}

export function Grid({ children, as: Component = 'div', style }: GridProps) {
  const { gridMaxWidth } = useGridBreakpoint()

  const debugOverlayStyle: React.CSSProperties = DEBUG_GRID
    ? {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(
          to right,
          rgba(255, 0, 0, 0.2) 0px,
          rgba(255, 0, 0, 0.2) calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns)),
          transparent calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns)),
          transparent calc((100% - var(--ds-grid-gutter) * (var(--ds-grid-columns) - 1)) / var(--ds-grid-columns) + var(--ds-grid-gutter))
        )`,
        backgroundOrigin: 'content-box',
        backgroundClip: 'content-box',
        backgroundRepeat: 'repeat-x',
        paddingInline: 'var(--ds-grid-margin)',
        boxSizing: 'border-box',
        zIndex: 2,
      }
    : {}

  return (
    <Component
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: gridMaxWidth,
        marginInline: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(var(--ds-grid-columns), 1fr)',
        paddingInline: 'var(--ds-grid-margin)',
        boxSizing: 'border-box',
        ...style,
        gap: 'var(--ds-grid-gutter)',
      }}
    >
      {children}
      {DEBUG_GRID && <div aria-hidden style={debugOverlayStyle} />}
    </Component>
  )
}

export function useCell(contentWidth: ContentWidth = 'L') {
  const { columns } = useGridBreakpoint()

  const span =
    columns === 12
      ? contentWidth === 'XS'
        ? 4
        : contentWidth === 'S'
          ? 6
          : contentWidth === 'M'
            ? 8
            : contentWidth === 'L'
              ? 10
              : 12
      : columns === 8
        ? contentWidth === 'XS'
          ? 4
          : 6
        : 4

  const start = Math.floor((columns - span) / 2) + 1

  return { gridColumn: `${start} / span ${span}` as const }
}
