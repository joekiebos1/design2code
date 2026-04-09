'use client'

import { useState } from 'react'
import { inspirationIsVideo, type InspirationMediaFields } from '../../../lib/studio-inspiration-media'

type Orientation = 'portrait' | 'landscape'

/**
 * Masonry tile: portrait media uses a 4:5 frame, landscape uses 5:4.
 */
export function BenchmarkGalleryTile({ entry }: { entry: InspirationMediaFields }) {
  const url =
    entry.mediaUrl?.trim() ||
    entry.imageUrl?.trim() ||
    entry.videoUrl?.trim() ||
    entry.screenshotUrl?.trim()
  const isVideo = inspirationIsVideo(entry)
  const [orientation, setOrientation] = useState<Orientation | null>(null)

  const aspectClass =
    orientation === 'landscape' ? 'aspect-[5/4]' : 'aspect-[4/5]'

  if (!url) {
    return (
      <div
        className={`w-full overflow-hidden rounded-xl bg-gray-100 ${aspectClass}`}
        aria-hidden
      />
    )
  }

  function setFromDimensions(w: number, h: number) {
    if (w > 0 && h > 0) {
      setOrientation(w >= h ? 'landscape' : 'portrait')
    }
  }

  const mediaFit = 'h-full w-full min-h-0 min-w-0 shrink object-contain'

  return (
    <div
      className={`flex min-h-0 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 ${aspectClass}`}
    >
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
          className={mediaFit}
          onLoadedMetadata={(e) => {
            setFromDimensions(e.currentTarget.videoWidth, e.currentTarget.videoHeight)
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          draggable={false}
          className={mediaFit}
          onLoad={(e) => {
            setFromDimensions(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
          }}
        />
      )}
    </div>
  )
}
