'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { inspirationHasMedia, inspirationIsVideo } from '../../../lib/studio-inspiration-media'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'
import { BenchmarkGalleryTile } from './BenchmarkGalleryTile'
import { StudioInspirationLightbox } from '../components/StudioInspirationLightbox'

const GAP_PX = 40

export function BenchmarksBrowseClient() {
  const [entries, setEntries] = useState<BenchmarkEntry[] | null>(null)
  const [active, setActive] = useState<BenchmarkEntry | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const res = await fetch('/api/studio-inspiration?type=benchmark')
      if (cancelled) return
      if (res.status === 503) {
        setLoadError(
          'Sanity is not configured. Set SANITY_STUDIO_PROJECT_ID and SANITY_API_TOKEN in your environment (same as Studio).'
        )
        setEntries([])
        return
      }
      if (!res.ok) {
        setLoadError('Could not load benchmarks.')
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

  if (entries === null) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <p className="m-0 text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  const withMedia = entries.filter((e) => inspirationHasMedia(e))
  const hasGallery = withMedia.length > 0 && !loadError

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 flex-col gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pt-8">
        <h1 className="m-0 text-2xl font-semibold text-gray-900">Benchmarks</h1>
        <Link
          href="/studio/benchmarks/add"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
        >
          Add
        </Link>
      </div>

      {loadError ? (
        <div className="px-6 md:px-8">
          <p className="m-0 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>
        </div>
      ) : null}

      {!hasGallery && !loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center">
          <p className="mb-4 m-0 text-sm text-gray-500">No media yet.</p>
          <Link
            href="/studio/benchmarks/add"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
          >
            Add
          </Link>
        </div>
      ) : null}

      {hasGallery ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={`min-h-0 flex-1 overflow-auto px-6 md:px-8 ${active ? 'overflow-hidden' : ''}`}
            style={{ paddingTop: GAP_PX, paddingBottom: GAP_PX }}
          >
            <div
              className="columns-1 sm:columns-2 lg:columns-3"
              style={{ columnGap: GAP_PX }}
            >
              {withMedia.map((entry) => (
                <div key={entry.id} className="break-inside-avoid" style={{ marginBottom: GAP_PX }}>
                  <button
                    type="button"
                    onClick={() => setActive(entry)}
                    className="block w-full min-h-0 min-w-0 cursor-pointer rounded-xl border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <BenchmarkGalleryTile entry={entry} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <StudioInspirationLightbox
            open={active !== null}
            mediaUrl={active?.mediaUrl}
            isVideo={active ? inspirationIsVideo(active) : false}
            title={active?.title}
            href={active?.url}
            linkLabel="Open link"
            onClose={() => setActive(null)}
            overlay="panel"
          />
        </div>
      ) : null}
    </main>
  )
}
