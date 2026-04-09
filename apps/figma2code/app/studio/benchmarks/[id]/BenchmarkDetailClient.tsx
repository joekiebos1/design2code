'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { benchmarkDetailPrimary, type BenchmarkEntry } from '../../../../lib/benchmarks/types'
import { StudioInspirationDetailMedia } from '../../components/StudioInspirationDetailMedia'

export function BenchmarkDetailClient({ id }: { id: string }) {
  const [entry, setEntry] = useState<BenchmarkEntry | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const res = await fetch(`/api/studio-inspiration/${encodeURIComponent(id)}`)
      if (cancelled) return
      if (res.status === 503) {
        setLoadError('Sanity is not configured.')
        setEntry(null)
        return
      }
      if (res.status === 404) {
        setEntry(null)
        return
      }
      if (!res.ok) {
        setEntry(null)
        return
      }
      const data = (await res.json()) as {
        id: string
        title: string
        url: string
        mediaUrl: string
        mimeType: string
        inspirationType?: string
      }
      if (data.inspirationType && data.inspirationType !== 'benchmark') {
        setEntry(null)
        return
      }
      if (cancelled) return
      setEntry({
        id: data.id,
        title: data.title,
        url: data.url,
        mediaUrl: data.mediaUrl,
        mimeType: data.mimeType,
      })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (entry === undefined) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <p className="m-0 text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <Link href="/studio/benchmarks" className="text-sm font-medium text-primary no-underline">
          ← Benchmarks
        </Link>
        <p className="mt-6 m-0 text-sm text-amber-800">{loadError}</p>
      </main>
    )
  }

  if (entry === null) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <Link href="/studio/benchmarks" className="text-sm font-medium text-primary no-underline">
          ← Benchmarks
        </Link>
        <p className="mt-6 m-0 text-sm text-gray-600">Not found.</p>
      </main>
    )
  }

  const primary = benchmarkDetailPrimary(entry)
  const title = entry.title?.trim() || 'Benchmark'
  const media = <StudioInspirationDetailMedia primary={primary} />

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-white">
      <div className="mx-auto flex w-full max-w-[min(100%,1440px)] flex-col gap-6 p-6 md:p-8">
        <Link href="/studio/benchmarks" className="w-fit shrink-0 text-sm font-medium text-gray-600 no-underline hover:text-gray-900">
          ← Benchmarks
        </Link>

        {entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded-xl"
          >
            {media}
          </a>
        ) : (
          media
        )}

        <div>
          <h1 className="m-0 mb-2 text-2xl font-semibold text-gray-900">{title}</h1>
          {entry.brand ? (
            <p className="m-0 mb-4 text-sm text-gray-500">{entry.brand}</p>
          ) : null}
          {entry.whatToSteal ? (
            <p className="m-0 mb-4 text-base leading-relaxed text-gray-700">{entry.whatToSteal}</p>
          ) : null}
          {entry.url ? (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open link →
            </a>
          ) : null}
        </div>
      </div>
    </main>
  )
}
