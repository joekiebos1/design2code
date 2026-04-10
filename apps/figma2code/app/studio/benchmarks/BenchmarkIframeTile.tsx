'use client'

import { useEffect, useRef, useState } from 'react'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'

type Props = {
  entry: BenchmarkEntry
  onClick: () => void
}

const VIEWPORT_HEIGHT: Record<string, number> = {
  '360': 780,
  '1440': 900,
}

/**
 * Scaled-down iframe thumbnail for the benchmarks gallery.
 * Renders the URL at its native viewport width, then CSS-scales it to fit the card.
 * pointer-events: none so the tile is a non-interactive thumbnail.
 * Hover dims the tile slightly. Clicking calls onClick.
 */
export function BenchmarkIframeTile({ entry, onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  const iframeWidth = entry.viewport === '360' ? 360 : 1440
  const iframeHeight = VIEWPORT_HEIGHT[entry.viewport ?? '1440'] ?? 900
  const aspectRatio = iframeHeight / iframeWidth

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 0) setScale(w / iframeWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [iframeWidth])

  const containerHeight = scale > 0 ? Math.round(iframeHeight * scale) : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl border-0 bg-gray-100 p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer"
      style={{ aspectRatio: scale > 0 ? undefined : `${iframeWidth} / ${iframeHeight}`, height: containerHeight }}
    >
      {/* Outer clipping container */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
      >
        {scale > 0 && entry.url && (
          <iframe
            src={entry.url}
            title={entry.title ?? entry.url}
            width={iframeWidth}
            height={iframeHeight}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
              display: 'block',
              border: 'none',
              flexShrink: 0,
            }}
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
      </div>

      {/* Hover dim overlay — also captures all pointer events so iframe stays inert */}
      <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors duration-150 group-hover:bg-black/20" />

      {/* Viewport badge */}
      <div className="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {entry.viewport ?? '1440'}px
      </div>
    </button>
  )
}
