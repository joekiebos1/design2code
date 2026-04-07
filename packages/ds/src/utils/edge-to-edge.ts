'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { getBreakpoints } from '@marcelinodzn/ds-tokens'

const bp = getBreakpoints()
/** Max width for edge-to-edge media on large screens. From DS breakpoint desktop-lg. */
export const EDGE_TO_EDGE_MAX_PX = bp.desktopLarge

/** DS radius token for capped edge-to-edge media. */
export const EDGE_TO_EDGE_CAPPED_RADIUS = 'var(--ds-radius-card-m)'

/** Shared breakout styles for full viewport width. */
export const EDGE_TO_EDGE_BREAKOUT: React.CSSProperties = {
  marginLeft: 'calc(50% - 50vw)',
  marginRight: 'calc(50% - 50vw)',
  width: '100vw',
  maxWidth: '100vw',
  boxSizing: 'border-box',
}

export type EdgeToEdgeMediaStyles = {
  /** Universal edge-to-edge inner: caps at 1920px, centers, rounded corners when capped. Use for any edge-to-edge element (media, container, background). */
  inner: React.CSSProperties
  /** @deprecated Use inner. Same as inner for unified behavior. */
  innerContainer: React.CSSProperties
  /** True when viewport > 1920px (content is capped). */
  isCapped: boolean
}

/**
 * Universal edge-to-edge styles. Any element (container or media) that spans edge-to-edge
 * gets max-width 1920px and rounded corners when capped.
 */
export function useEdgeToEdgeMediaStyles(): EdgeToEdgeMediaStyles {
  const [viewportWidth, setViewportWidth] = useState(EDGE_TO_EDGE_MAX_PX)

  useEffect(() => {
    const update = () => {
      setViewportWidth(typeof window !== 'undefined' ? window.innerWidth : EDGE_TO_EDGE_MAX_PX)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isCapped = viewportWidth > EDGE_TO_EDGE_MAX_PX
  const inner = {
    width: '100%',
    maxWidth: `min(100vw, ${EDGE_TO_EDGE_MAX_PX}px)` as const,
    marginInline: 'auto' as const,
    borderRadius: isCapped ? EDGE_TO_EDGE_CAPPED_RADIUS : 0,
    overflow: isCapped ? 'hidden' : undefined,
  }
  return {
    isCapped,
    inner,
    innerContainer: inner,
  }
}
