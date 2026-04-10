'use client'

import { useEffect, useRef, useState } from 'react'
import { inspirationHasMedia } from '../../../lib/studio-inspiration-media'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'
import { BenchmarkGalleryTile } from './BenchmarkGalleryTile'
import { BenchmarkIframeTile } from './BenchmarkIframeTile'
import { BenchmarkDetailView } from './BenchmarkDetailView'
import { BenchmarkAddUrlModal } from './BenchmarkAddUrlModal'
import { BenchmarkAddMediaModal } from './BenchmarkAddMediaModal'

const GAP_PX = 40

type Modal = 'url' | 'media' | null

async function postEntry(entry: BenchmarkEntry): Promise<BenchmarkEntry> {
  const fd = new FormData()
  fd.append('title', entry.title ?? '')
  fd.append('inspirationType', 'benchmark')
  if (entry.url) fd.append('linkUrl', entry.url)
  if (entry.description) fd.append('description', entry.description)
  if (entry.viewport) fd.append('viewport', entry.viewport)
  if (entry._file) fd.append('file', entry._file, entry._file.name)

  const res = await fetch('/api/studio-inspiration', { method: 'POST', body: fd })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Upload failed (${res.status})`)
  }
  const data = await res.json() as { id: string; title: string; url: string; mediaUrl: string; mimeType: string; description?: string; viewport?: string }
  return {
    id: data.id,
    title: data.title,
    url: data.url || undefined,
    mediaUrl: data.mediaUrl || undefined,
    mimeType: data.mimeType || undefined,
    description: data.description,
    viewport: data.viewport as BenchmarkEntry['viewport'],
  }
}

export function BenchmarksBrowseClient() {
  const [entries, setEntries] = useState<BenchmarkEntry[] | null>(null)
  const [active, setActive] = useState<BenchmarkEntry | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const res = await fetch('/api/studio-inspiration?type=benchmark')
      if (cancelled) return
      if (res.status === 503) {
        setLoadError('Strapi is not configured. Set STRAPI_URL and STRAPI_API_TOKEN in your environment.')
        setEntries([])
        return
      }
      if (!res.ok) {
        setLoadError('Could not load benchmarks.')
        setEntries([])
        return
      }
      const data = (await res.json()) as {
        items: Array<{ id: string; title: string; url: string; mediaUrl: string; mimeType: string; description?: string; viewport?: string }>
      }
      if (cancelled) return
      setEntries(
        data.items.map((i) => ({
          id: i.id,
          title: i.title,
          url: i.url || undefined,
          mediaUrl: i.mediaUrl || undefined,
          mimeType: i.mimeType || undefined,
          description: i.description,
          viewport: i.viewport as BenchmarkEntry['viewport'],
        }))
      )
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    function handler(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node) && !addBtnRef.current?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  async function handleAddUrl(tempEntry: BenchmarkEntry) {
    setEntries((prev) => [tempEntry, ...(prev ?? [])])
    try {
      const real = await postEntry(tempEntry)
      setEntries((prev) => prev?.map((e) => e.id === tempEntry.id ? real : e) ?? [])
    } catch (err) {
      setEntries((prev) => prev?.filter((e) => e.id !== tempEntry.id) ?? [])
      throw err
    }
  }

  async function handleAddMedia(tempEntries: BenchmarkEntry[]) {
    setUploadError(null)

    // Create blob URLs owned by the browse client so they survive modal unmount
    const blobUrls = new Map<string, string>()
    const enriched = tempEntries.map((e) => {
      if (e._file) {
        const blobUrl = URL.createObjectURL(e._file)
        blobUrls.set(e.id, blobUrl)
        return { ...e, mediaUrl: blobUrl, mimeType: e._file.type }
      }
      return e
    })

    setEntries((prev) => [...enriched, ...(prev ?? [])])

    const results = await Promise.allSettled(
      tempEntries.map(async (tempEntry) => {
        try {
          const real = await postEntry(tempEntry)
          setEntries((prev) => prev?.map((e) => e.id === tempEntry.id ? real : e) ?? [])
        } catch (err) {
          setEntries((prev) => prev?.filter((e) => e.id !== tempEntry.id) ?? [])
          throw err
        } finally {
          const blobUrl = blobUrls.get(tempEntry.id)
          if (blobUrl) URL.revokeObjectURL(blobUrl)
        }
      })
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) {
      const msg = failed[0].status === 'rejected' && failed[0].reason instanceof Error
        ? failed[0].reason.message : 'Upload failed'
      setUploadError(`${failed.length} file(s) failed to upload: ${msg}`)
    }
  }

  if (entries === null) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-6 md:p-8">
        <p className="m-0 text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  const hasAny = entries.length > 0 && !loadError

  const AddButton = (
    <div className="relative">
      <button
        ref={addBtnRef}
        type="button"
        onClick={() => setShowDropdown((s) => !s)}
        className="inline-flex shrink-0 items-center gap-1.5 justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer border-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Add
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-40 mt-1.5 w-36 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => { setShowDropdown(false); setModal('url') }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-0 bg-transparent"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-gray-400"><path d="M7 1.5A5.5 5.5 0 117 12.5 5.5 5.5 0 017 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M1.5 7h11M7 1.5c1.5 2 2.5 3.5 2.5 5.5S8.5 11 7 12.5M7 1.5C5.5 3.5 4.5 5 4.5 7S5.5 11 7 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            URL
          </button>
          <button
            type="button"
            onClick={() => { setShowDropdown(false); setModal('media') }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-0 bg-transparent"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-gray-400"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 9l3-3 2.5 2.5L10 5l2.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="5.5" r="1" fill="currentColor"/></svg>
            Media
          </button>
        </div>
      )}
    </div>
  )

  const isUploading = entries?.some((e) => e.pending) ?? false

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {active ? (
        /* Detail header — same height as gallery header */
        <div className="flex shrink-0 items-center gap-4 px-6 pb-4 pt-6 sm:justify-between md:px-8 md:pt-8">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          <div className="min-w-0 flex-1">
            {active.title && <p className="m-0 truncate text-sm font-medium text-gray-900">{active.title}</p>}
            {active.description && <p className="m-0 truncate text-xs text-gray-400">{active.description}</p>}
          </div>
          {active.url && (
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
            >
              Open link
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          )}
        </div>
      ) : (
        /* Gallery header */
        <div className="flex shrink-0 flex-col gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pt-8">
          <h1 className="m-0 text-2xl font-semibold text-gray-900">Benchmarks</h1>
          {AddButton}
        </div>
      )}

      {/* Upload progress bar */}
      {isUploading && (
        <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-gray-100">
          <div className="h-full animate-[uploading_1.4s_ease-in-out_infinite] bg-primary" />
        </div>
      )}

      {loadError && !active && (
        <div className="px-6 md:px-8">
          <p className="m-0 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>
        </div>
      )}

      {uploadError && (
        <div className="px-6 md:px-8">
          <p className="m-0 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">
            {uploadError}
            <button type="button" onClick={() => setUploadError(null)} className="ml-3 underline cursor-pointer border-0 bg-transparent text-red-800">Dismiss</button>
          </p>
        </div>
      )}

      {!hasAny && !loadError && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center gap-4">
          <p className="m-0 text-sm text-gray-500">No benchmarks yet. Add a URL or upload media.</p>
          {AddButton}
        </div>
      )}

      {hasAny && (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className="min-h-0 flex-1 overflow-auto px-6 md:px-8"
            style={{ paddingTop: GAP_PX, paddingBottom: GAP_PX }}
          >
            <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: GAP_PX, columnFill: 'auto' }}>
              {entries.map((entry) => (
                <div key={entry.id} className="group break-inside-avoid" style={{ marginBottom: GAP_PX }}>
                  <button
                    type="button"
                    onClick={() => setActive(entry)}
                    className="relative block w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {inspirationHasMedia(entry) ? (
                      <BenchmarkGalleryTile entry={entry} />
                    ) : (
                      <BenchmarkIframeTile entry={entry} />
                    )}
                    <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors duration-150 group-hover:bg-black/10 pointer-events-none" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {active && (
            <BenchmarkDetailView
              entry={active}
              onClose={() => setActive(null)}
            />
          )}
        </div>
      )}

      {modal === 'url' && (
        <BenchmarkAddUrlModal onClose={() => setModal(null)} onAdd={handleAddUrl} />
      )}
      {modal === 'media' && (
        <BenchmarkAddMediaModal onClose={() => setModal(null)} onAdd={handleAddMedia} />
      )}
    </main>
  )
}
