'use client'

import { useCallback, useEffect } from 'react'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'

type Props = {
  entry: BenchmarkEntry
  onClose: () => void
}

/**
 * Full-screen interactive iframe preview.
 * The iframe is rendered at the entry's native viewport width (360 or 1440px),
 * centered in the overlay, and is fully interactive.
 */
export function BenchmarkUrlPreview({ entry, onClose }: Props) {
  const iframeWidth = entry.viewport === '360' ? 360 : 1440
  const domain = (() => {
    try { return new URL(entry.url ?? '').hostname.replace(/^www\./, '') } catch { return entry.url ?? '' }
  })()

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [onKeyDown])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950" role="dialog" aria-modal="true">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-gray-900 px-4 py-2.5">
        {/* Traffic light spacer / close */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
          aria-label="Close preview"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>

        {/* URL bar */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-white/10 px-3 py-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-white/40">
            <rect x="1.5" y="4.5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M4 4.5V3.5a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span className="truncate text-xs text-white/60">{entry.url}</span>
        </div>

        {/* Viewport badge */}
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60">
          {entry.viewport ?? '1440'}px
        </span>

        {/* Open in tab */}
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 no-underline transition-colors hover:bg-white/20 hover:text-white"
          >
            Open in tab ↗
          </a>
        )}
      </div>

      {/* iframe area — scrollable, iframe centered at native width */}
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-gray-950">
        {entry.url ? (
          <iframe
            src={entry.url}
            title={entry.title ?? domain}
            width={iframeWidth}
            style={{
              border: 'none',
              display: 'block',
              flexShrink: 0,
              height: '100%',
              minHeight: '100%',
              backgroundColor: '#fff',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <div className="flex items-center justify-center text-sm text-white/40">No URL on file</div>
        )}
      </div>
    </div>
  )
}
