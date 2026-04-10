'use client'

import type { BenchmarkEntry } from '../../../lib/benchmarks/types'
import { extractDomain } from '../utils/extract-domain'

type Props = {
  entry: BenchmarkEntry
}

export function BenchmarkIframeTile({ entry }: Props) {
  const domain = extractDomain(entry.url)

  const title = entry.title ?? domain
  // 1440px desktop: 16:9 — 360px phone: 9:19.5 (modern tall phone proportions)
  const aspectRatio = entry.viewport === '360' ? 9 / 19.5 : 16 / 9
  const screenshotUrl = entry.url
    ? `/api/og-preview?url=${encodeURIComponent(entry.url)}&viewport=${entry.viewport ?? '1440'}`
    : null

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio }}>
      {screenshotUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={screenshotUrl} alt={title} className="h-full w-full object-cover object-top" />
      ) : (
        <div className="h-full w-full animate-pulse bg-gray-100" />
      )}

      {/* Overlay label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-8">
        <p className="m-0 truncate text-xs font-medium text-white">{title}</p>
        {domain !== title && <p className="m-0 truncate text-xs text-white/60">{domain}</p>}
      </div>

      {/* Viewport badge */}
      {entry.viewport && (
        <div className="absolute right-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
          {entry.viewport}px
        </div>
      )}
    </div>
  )
}
