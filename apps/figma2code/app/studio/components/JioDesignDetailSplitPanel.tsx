'use client'

import { useEffect, useState } from 'react'
import { jioDesignDetailDisplayWidthPx } from '../../../lib/jio-designs/image-layout'
import type { InspirationDetailPrimary } from './StudioInspirationDetailMedia'

/**
 * Jio Designs detail: media column (360px or 1440px logical width) scrolls if needed; copy column is sticky.
 */
export function JioDesignDetailSplitPanel({
  primary,
  title,
  brand,
  whatToSteal,
  url,
  titleAs = 'h2',
}: {
  primary: InspirationDetailPrimary
  title: string
  brand?: string | null
  whatToSteal?: string | null
  url?: string | null
  /** Standalone detail page uses `h1`; gallery overlay uses `h2`. */
  titleAs?: 'h1' | 'h2'
}) {
  const [naturalW, setNaturalW] = useState<number | null>(null)

  useEffect(() => {
    setNaturalW(null)
  }, [primary?.kind, primary?.src])

  const columnWidthPx = naturalW != null ? jioDesignDetailDisplayWidthPx(naturalW) : 360

  const headingClass = 'm-0 text-2xl font-semibold text-gray-900'
  const titleEl =
    titleAs === 'h1' ? (
      <h1 className={headingClass}>{title}</h1>
    ) : (
      <h2 className={headingClass}>{title}</h2>
    )

  if (!primary) {
    return (
      <div className="flex min-h-0 flex-1 flex-row items-start justify-start gap-10">
        <div
          className="shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-[0_2px_14px_rgba(15,23,42,0.06)]"
          style={{ width: 360 }}
        >
          <div className="aspect-[4/5] min-h-[200px]" aria-hidden />
        </div>
        <aside className="sticky top-28 w-72 shrink-0 self-start md:w-80">{titleEl}</aside>
      </div>
    )
  }

  const mediaNode =
    primary.kind === 'image' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={primary.src}
        alt=""
        className="block h-auto max-w-none bg-gray-50"
        style={{ width: columnWidthPx, height: 'auto' }}
        onLoad={(e) => setNaturalW(e.currentTarget.naturalWidth)}
      />
    ) : (
      <video
        src={primary.src}
        muted
        playsInline
        autoPlay
        loop
        controls={false}
        className="block h-auto max-w-none bg-gray-50"
        style={{ width: columnWidthPx, height: 'auto' }}
        onLoadedMetadata={(e) => setNaturalW(e.currentTarget.videoWidth)}
        aria-label=""
      />
    )

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-row items-start justify-start gap-8 md:gap-10 lg:gap-12">
      <div
        className="shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_2px_14px_rgba(15,23,42,0.06)]"
        style={{ width: columnWidthPx, maxWidth: '100%' }}
      >
        <div className="studio-scrollbar-hide max-h-[min(calc(100vh-7.5rem),900px)] min-h-0 overflow-x-hidden overflow-y-auto">
          {mediaNode}
        </div>
      </div>
      <aside className="sticky top-28 w-72 min-w-0 shrink-0 self-start md:w-80">
        {titleEl}
        {brand ? <p className="mt-2 text-sm text-gray-500">{brand}</p> : null}
        {whatToSteal ? <p className="mt-4 text-base leading-relaxed text-gray-700">{whatToSteal}</p> : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Open in Figma →
          </a>
        ) : (
          <p className="mt-6 text-sm text-gray-400">No Figma link on file</p>
        )}
      </aside>
    </div>
  )
}
