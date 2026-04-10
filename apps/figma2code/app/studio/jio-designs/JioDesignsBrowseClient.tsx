'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  jioDesignDetailPrimary,
  jioDesignGalleryVisual,
  jioDesignHasMedia,
  type JioDesignEntry,
} from '../../../lib/jio-designs/types'
import { jioDesignGalleryThumbWidthPx } from '../../../lib/jio-designs/image-layout'
import { JioDesignDetailSplitPanel } from '../components/JioDesignDetailSplitPanel'

const GAP_PX = 40
const THUMB_PLACEHOLDER_W = 180

function CarouselStripMedia({
  visual,
  onPick,
}: {
  visual: { kind: 'image'; src: string } | { kind: 'video'; src: string }
  onPick: () => void
}) {
  const [w, setW] = useState<number | null>(null)

  const shadowFrame = 'overflow-hidden rounded-xl bg-white shadow-[0_2px_14px_rgba(15,23,42,0.06)]'

  if (visual.kind === 'image') {
    return (
      <button
        type="button"
        onClick={onPick}
        className="relative flex shrink-0 flex-col items-start justify-start self-start border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        style={{ width: w ?? THUMB_PLACEHOLDER_W }}
      >
        <span className={`pointer-events-none block leading-none ${shadowFrame}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visual.src}
            alt=""
            draggable={false}
            className="pointer-events-none block h-auto max-w-none select-none"
            style={w ? { width: w, height: 'auto' } : { width: THUMB_PLACEHOLDER_W, height: 'auto' }}
            onLoad={(e) => {
              setW(jioDesignGalleryThumbWidthPx(e.currentTarget.naturalWidth))
            }}
          />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onPick}
      className="relative flex shrink-0 flex-col items-start justify-start self-start border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      style={{ width: w ?? THUMB_PLACEHOLDER_W }}
    >
      <span className={`pointer-events-none block leading-none ${shadowFrame}`}>
        <video
          src={visual.src}
          muted
          playsInline
          loop
          autoPlay
          controls={false}
          preload="metadata"
          draggable={false}
          className="pointer-events-none block h-auto max-w-none select-none"
          style={w ? { width: w, height: 'auto' } : { width: THUMB_PLACEHOLDER_W, height: 'auto' }}
          onLoadedMetadata={(e) => {
            setW(jioDesignGalleryThumbWidthPx(e.currentTarget.videoWidth))
          }}
        />
      </span>
    </button>
  )
}

function JioDesignDetailView({
  entry,
  onClose,
  visible,
}: {
  entry: JioDesignEntry
  onClose: () => void
  visible: boolean
}) {
  const primary = jioDesignDetailPrimary(entry)
  const title = entry.title?.trim() || 'Jio Design'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col bg-white transition-[opacity,transform] duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute left-6 top-6 z-30 cursor-pointer rounded-md border-0 bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
      >
        Back
      </button>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-20">
        <div className="flex min-h-0 flex-1 overflow-hidden px-6 md:px-10">
          <JioDesignDetailSplitPanel
            primary={primary}
            title={title}
            brand={entry.brand}
            whatToSteal={entry.whatToSteal}
            url={entry.url}
            titleAs="h2"
          />
        </div>
      </div>
    </div>
  )
}

export function JioDesignsBrowseClient() {
  const [entries, setEntries] = useState<JioDesignEntry[] | null>(null)
  const [selected, setSelected] = useState<JioDesignEntry | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const res = await fetch('/api/studio-inspiration?type=jioDesign')
      if (cancelled) return
      if (res.status === 503) {
        setLoadError(
          'Strapi is not configured. Set STRAPI_URL and STRAPI_API_TOKEN in your environment.'
        )
        setEntries([])
        return
      }
      if (!res.ok) {
        setLoadError('Could not load Jio Designs.')
        setEntries([])
        return
      }
      const data = (await res.json()) as {
        items: Array<{ id: string; title: string; url: string; mediaUrl: string; mimeType: string }>
      }
      if (cancelled) return
      setEntries(
        data.items.map((i) => ({
          id: i.id,
          title: i.title,
          url: i.url,
          mediaUrl: i.mediaUrl,
          mimeType: i.mimeType,
        }))
      )
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selected) {
      const id = requestAnimationFrame(() => setDetailVisible(true))
      return () => cancelAnimationFrame(id)
    }
    setDetailVisible(false)
  }, [selected])

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [entries])

  function openDetail(entry: JioDesignEntry) {
    setSelected(entry)
  }

  function closeDetail() {
    setDetailVisible(false)
    window.setTimeout(() => setSelected(null), 280)
  }

  const withMedia = entries?.filter((e) => jioDesignHasMedia(e)) ?? []

  if (entries === null) {
    return (
      <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <p className="m-0 p-6 text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  return (
    <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between gap-4 px-6 py-4 md:px-8">
        <h1 className="m-0 text-2xl font-semibold text-gray-900">Jio Designs</h1>
        <Link
          href="/studio/jio-designs/add"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
        >
          Add
        </Link>
      </div>

      {loadError ? (
        <div className="shrink-0 px-6 md:px-8">
          <p className="m-0 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>
        </div>
      ) : null}

      {withMedia.length === 0 && !loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center">
          <p className="mb-4 m-0 text-sm text-gray-500">No media yet.</p>
          <Link
            href="/studio/jio-designs/add"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
          >
            Add
          </Link>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <div
            ref={stripRef}
            className="studio-scrollbar-hide flex h-full min-h-0 w-full items-start overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 md:px-8"
            style={{ gap: GAP_PX }}
          >
            {withMedia.map((entry) => {
              const visual = jioDesignGalleryVisual(entry)
              if (!visual) return null
              return (
                <CarouselStripMedia key={entry.id} visual={visual} onPick={() => openDetail(entry)} />
              )
            })}
          </div>

          {selected ? (
            <JioDesignDetailView entry={selected} onClose={closeDetail} visible={detailVisible} />
          ) : null}
        </div>
      )}
    </main>
  )
}
