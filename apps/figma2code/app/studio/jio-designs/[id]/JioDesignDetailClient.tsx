'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { jioDesignDetailPrimary, type JioDesignEntry } from '../../../../lib/jio-designs/types'
import { JioDesignDetailSplitPanel } from '../../components/JioDesignDetailSplitPanel'

export function JioDesignDetailClient({ id }: { id: string }) {
  const [entry, setEntry] = useState<JioDesignEntry | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const res = await fetch(`/api/studio-inspiration/${encodeURIComponent(id)}`)
      if (cancelled) return
      if (res.status === 503) {
        setLoadError('Strapi is not configured.')
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
      if (data.inspirationType && data.inspirationType !== 'jioDesign') {
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
        <Link href="/studio/jio-designs" className="text-sm font-medium text-primary no-underline">
          ← Jio Designs
        </Link>
        <p className="mt-6 m-0 text-sm text-amber-800">{loadError}</p>
      </main>
    )
  }

  if (entry === null) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <Link href="/studio/jio-designs" className="text-sm font-medium text-primary no-underline">
          ← Jio Designs
        </Link>
        <p className="mt-6 m-0 text-sm text-gray-600">Not found.</p>
      </main>
    )
  }

  const primary = jioDesignDetailPrimary(entry)
  const title = entry.title?.trim() || 'Jio Design'

  return (
    <main className="min-h-0 flex-1 overflow-hidden bg-white">
      <div className="flex h-full min-h-0 flex-col gap-6 p-6 md:p-8">
        <Link href="/studio/jio-designs" className="w-fit shrink-0 text-sm font-medium text-gray-600 no-underline hover:text-gray-900">
          ← Jio Designs
        </Link>

        <div className="min-h-0 flex-1 overflow-hidden">
          <JioDesignDetailSplitPanel
            primary={primary}
            title={title}
            brand={entry.brand}
            whatToSteal={entry.whatToSteal}
            url={entry.url}
            titleAs="h1"
          />
        </div>
      </div>
    </main>
  )
}
