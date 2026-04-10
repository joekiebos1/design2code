'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ALLOWED_MEDIA_ACCEPT, isAllowedStudioMediaFile } from '../../../lib/studio-inspiration-allowed-files'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'

type SelectedFile = {
  file: File
  objectUrl: string
  isVideo: boolean
}

type Props = {
  onClose: () => void
  onAdd: (entries: BenchmarkEntry[]) => Promise<void>
}

export function BenchmarkAddMediaModal({ onClose, onAdd }: Props) {
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.objectUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function addFiles(incoming: File[]) {
    setError(null)
    const valid = incoming.filter((f) => {
      if (!isAllowedStudioMediaFile(f)) {
        setError(`"${f.name}" is not a supported media type.`)
        return false
      }
      return true
    })
    if (!valid.length) return

    const newSelected: SelectedFile[] = valid.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
      isVideo: file.type.startsWith('video/'),
    }))

    setFiles((prev) => {
      URL.revokeObjectURL // keep for cleanup reference
      const updated = [...prev, ...newSelected]
      setActiveIndex(updated.length - 1)
      return updated
    })

    // Auto-fill name from first file if empty
    setName((prev) => {
      if (prev) return prev
      return valid[0].name.replace(/\.[^.]+$/, '')
    })
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    addFiles(picked)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl)
      const next = prev.filter((_, i) => i !== index)
      setActiveIndex((ai) => Math.min(ai, Math.max(0, next.length - 1)))
      return next
    })
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!files.length) return setError('Choose at least one file.')
    if (!name.trim()) return setError('Name is required.')

    setSaving(true)
    try {
      const tempEntries: BenchmarkEntry[] = files.map((sf, i) => ({
        id: `pending-${Date.now()}-${i}`,
        title: name.trim(),
        description: description.trim() || undefined,
        mediaUrl: sf.objectUrl,
        mimeType: sf.file.type,
        pending: true,
        _file: sf.file as unknown as undefined, // carry file for upload
      } as BenchmarkEntry & { _file: File }))
      await onAdd(tempEntries)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }, [files, name, description, onAdd, onClose])

  const hasFiles = files.length > 0
  const active = files[activeIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="m-0 text-base font-semibold text-gray-900">Add Media</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col overflow-y-auto">
          {/* Large carousel — only shown after files are selected */}
          {hasFiles && (
            <div className="relative shrink-0 bg-gray-950" style={{ height: 280 }}>
              {/* Main media */}
              <div className="flex h-full items-center justify-center overflow-hidden">
                {active?.isVideo ? (
                  <video
                    key={active.objectUrl}
                    src={active.objectUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={active?.objectUrl}
                    src={active?.objectUrl}
                    alt={active?.file.name ?? ''}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              {/* Navigation arrows — only if multiple files */}
              {files.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => (i - 1 + files.length) % files.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white border-0 cursor-pointer hover:bg-black/70 transition-colors"
                    aria-label="Previous"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => (i + 1) % files.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white border-0 cursor-pointer hover:bg-black/70 transition-colors"
                    aria-label="Next"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                    {activeIndex + 1} / {files.length}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Drop zone — shown when no files yet */}
            {!hasFiles && (
              <div
                ref={dropRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-gray-400"><path d="M14 4v14M7 11l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="20" width="20" height="4" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                <p className="m-0 text-sm font-medium text-gray-600">Drop files here or <span className="text-primary">browse</span></p>
                <p className="m-0 text-xs text-gray-400">Images and videos · Multiple files supported</p>
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700" htmlFor="media-name">Name</label>
              <input
                id="media-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spotify onboarding flow"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700" htmlFor="media-desc">Description</label>
              <textarea
                id="media-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's worth noting about this?"
                rows={2}
                className="resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Thumbnail strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {files.map((sf, i) => (
                <button
                  key={sf.objectUrl}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className="relative shrink-0 overflow-hidden rounded-lg border-0 bg-transparent p-0 cursor-pointer transition-opacity"
                  style={{ width: 40, height: 40 }}
                  aria-label={sf.file.name}
                  title={sf.file.name}
                >
                  {sf.isVideo ? (
                    <video src={sf.objectUrl} muted className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sf.objectUrl} alt={sf.file.name} className="h-full w-full object-cover" />
                  )}
                  {/* Active ring */}
                  {i === activeIndex && (
                    <span className="absolute inset-0 rounded-lg ring-2 ring-primary ring-inset pointer-events-none" />
                  )}
                  {/* Remove button */}
                  <span
                    role="button"
                    aria-label={`Remove ${sf.file.name}`}
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-black/60 text-white opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100 cursor-pointer"
                    style={{ fontSize: 9 }}
                  >
                    ✕
                  </span>
                </button>
              ))}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                style={{ width: 40, height: 40 }}
                aria-label="Add more files"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {error && (
              <p className="m-0 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving || !hasFiles}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60 cursor-pointer border-0"
            >
              {saving ? 'Adding…' : 'Add to Inspiration'}
            </button>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_MEDIA_ACCEPT}
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  )
}
