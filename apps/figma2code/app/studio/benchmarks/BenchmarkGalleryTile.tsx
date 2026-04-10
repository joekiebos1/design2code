'use client'

import { useState } from 'react'
import { inspirationIsVideo, type InspirationMediaFields } from '../../../lib/studio-inspiration-media'

export function BenchmarkGalleryTile({ entry }: { entry: InspirationMediaFields }) {
  const url =
    entry.mediaUrl?.trim() ||
    entry.imageUrl?.trim() ||
    entry.videoUrl?.trim() ||
    entry.screenshotUrl?.trim()
  const isVideo = inspirationIsVideo(entry)
  const [ratio, setRatio] = useState<number | null>(null)

  // Clamp to prevent absurdly extreme tiles (no taller than 1:2.5, no wider than 2.5:1)
  const clamp = (r: number) => Math.max(0.4, Math.min(2.5, r))

  const aspectRatio = ratio ? clamp(ratio) : 4 / 3
  const title = (entry as Record<string, unknown>).title as string | undefined

  if (!url) {
    return <div className="w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio }} aria-hidden />
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio }}>
      {isVideo ? (
        <video
          src={url}
          muted
          playsInline
          loop
          autoPlay
          controls={false}
          preload="metadata"
          draggable={false}
          className="h-full w-full object-cover object-top"
          onLoadedMetadata={(e) => {
            const { videoWidth: w, videoHeight: h } = e.currentTarget
            if (w > 0 && h > 0) setRatio(w / h)
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          draggable={false}
          className="h-full w-full object-cover object-top"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w > 0 && h > 0) setRatio(w / h)
          }}
        />
      )}

      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-8">
          <p className="m-0 truncate text-xs font-medium text-white">{title}</p>
        </div>
      )}
    </div>
  )
}
