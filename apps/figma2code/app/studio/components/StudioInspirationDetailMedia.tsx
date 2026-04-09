'use client'

import { useEffect, useState } from 'react'
import { jioDesignDetailDisplayWidthPx } from '../../../lib/jio-designs/image-layout'

export type InspirationDetailPrimary =
  | { kind: 'image'; src: string }
  | { kind: 'video'; src: string }
  | null

/**
 * Detail page / overlay: PNG or MP4 at 360 / 1440 logical width (see `image-layout`). Video autoplays, no controls.
 */
export function StudioInspirationDetailMedia({ primary }: { primary: InspirationDetailPrimary }) {
  const [naturalW, setNaturalW] = useState<number | null>(null)

  useEffect(() => {
    setNaturalW(null)
  }, [primary?.kind, primary?.src])

  const detailWidthPx = naturalW != null ? jioDesignDetailDisplayWidthPx(naturalW) : null

  if (!primary) {
    return <div className="aspect-[4/5] w-full max-w-xl rounded-xl bg-gray-200/80" aria-hidden />
  }

  const mediaFit = 'h-full w-full min-h-0 min-w-0 shrink object-contain'

  if (primary.kind === 'image') {
    return (
      <div
        className={`flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100`}
        style={{ height: `min(70vh, 900px)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary.src}
          alt=""
          className={mediaFit}
          style={
            detailWidthPx != null
              ? { width: detailWidthPx, maxWidth: '100%' }
              : { maxWidth: '100%' }
          }
          onLoad={(e) => setNaturalW(e.currentTarget.naturalWidth)}
        />
      </div>
    )
  }

  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100"
      style={{ height: `min(70vh, 900px)` }}
    >
      <video
        src={primary.src}
        muted
        playsInline
        autoPlay
        loop
        controls={false}
        className={mediaFit}
        style={
          detailWidthPx != null
            ? { width: detailWidthPx, maxWidth: '100%' }
            : { maxWidth: '100%' }
        }
        onLoadedMetadata={(e) => setNaturalW(e.currentTarget.videoWidth)}
        aria-label=""
      />
    </div>
  )
}
