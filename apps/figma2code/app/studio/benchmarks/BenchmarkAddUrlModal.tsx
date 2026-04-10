'use client'

import { useEffect, useRef, useState } from 'react'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'

type Props = {
  onClose: () => void
  onAdd: (entry: BenchmarkEntry) => Promise<void>
}

export function BenchmarkAddUrlModal({ onClose, onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [viewport, setViewport] = useState<'360' | '1440'>('1440')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    urlRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!url.trim()) return setError('URL is required.')
    if (!name.trim()) return setError('Name is required.')
    try {
      new URL(url.trim())
    } catch {
      return setError('Enter a valid URL starting with http:// or https://')
    }

    setSaving(true)
    try {
      const tempEntry: BenchmarkEntry = {
        id: `pending-${Date.now()}`,
        url: url.trim(),
        title: name.trim(),
        description: description.trim() || undefined,
        viewport,
        pending: true,
      }
      await onAdd(tempEntry)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="m-0 text-base font-semibold text-gray-900">Add URL</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700" htmlFor="bench-url">URL</label>
            <input
              ref={urlRef}
              id="bench-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Viewport */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-700">Viewport</span>
            <div className="flex gap-3">
              {(['360', '1440'] as const).map((v) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="viewport"
                    value={v}
                    checked={viewport === v}
                    onChange={() => setViewport(v)}
                    className="accent-primary"
                  />
                  {v}px
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700" htmlFor="bench-name">Name</label>
            <input
              id="bench-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apple iPhone 15 Pro"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700" htmlFor="bench-desc">Description</label>
            <textarea
              id="bench-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's worth noting about this page?"
              rows={3}
              className="resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="m-0 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60 cursor-pointer border-0"
          >
            {saving ? 'Adding…' : 'Add to Inspiration'}
          </button>
        </form>
      </div>
    </div>
  )
}
