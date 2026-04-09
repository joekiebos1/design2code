'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { studioInputClass } from '../../studio-ui'
import { StudioPasteThumbnailField } from '../../components/StudioPasteThumbnailField'
import { mediaInputToFile } from '../../../../lib/media-input-to-file'
import { isAllowedStudioMediaFile } from '../../../../lib/studio-inspiration-allowed-files'
import {
  STUDIO_INSPIRATION_MAX_FILE_BYTES,
  studioInspirationMaxFileMb,
} from '../../../../lib/studio-inspiration-limits'

export function BenchmarkAddClient() {
  const router = useRouter()
  const [preview, setPreview] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [mediaKind, setMediaKind] = useState<'image' | 'video'>('image')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function onBinaryFile(file: File) {
    setUploadFile(file)
    setMediaKind(file.type === 'video/mp4' ? 'video' : 'image')
  }

  function onPreviewChange(next: string) {
    setPreview(next)
    setUploadFile(null)
    if (next.startsWith('data:video/mp4')) setMediaKind('video')
    else if (next.startsWith('data:image/png')) setMediaKind('image')
    else if (/\.mp4(\?|#|$)/i.test(next.trim())) setMediaKind('video')
    else if (/\.png(\?|#|$)/i.test(next.trim())) setMediaKind('image')
    else setMediaKind('image')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const media = preview.trim()
    const t = title.trim()
    const link = url.trim()

    if (!media || !t || !link) {
      setError('Media, title, and page link are required.')
      return
    }

    if (
      !media.startsWith('data:') &&
      !media.startsWith('http://') &&
      !media.startsWith('https://') &&
      !media.startsWith('/') &&
      !media.startsWith('blob:')
    ) {
      setError('Media must be a pasted file, data URL, blob preview, http(s) URL, or path starting with /')
      return
    }

    try {
      const parsed = new URL(link)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setError('Page link must start with http:// or https://')
        return
      }
    } catch {
      setError('Invalid page link.')
      return
    }

    setSaving(true)
    try {
      let file: File
      if (uploadFile) {
        file = uploadFile
      } else {
        file = await mediaInputToFile(media, 'benchmark')
      }

      if (!isAllowedStudioMediaFile(file)) {
        setError('Only PNG or MP4 files are allowed.')
        setSaving(false)
        return
      }

      if (file.size > STUDIO_INSPIRATION_MAX_FILE_BYTES) {
        setError(`File must be ${studioInspirationMaxFileMb()} MB or smaller.`)
        setSaving(false)
        return
      }

      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', t)
      fd.append('linkUrl', link)
      fd.append('inspirationType', 'benchmark')

      const res = await fetch('/api/studio-inspiration', { method: 'POST', body: fd })
      const data = (await res.json()) as { error?: string; id?: string }
      if (!res.ok) {
        setError(data.error || 'Could not save to Sanity.')
        setSaving(false)
        return
      }
      if (data.id) {
        router.push(`/studio/benchmarks/${encodeURIComponent(data.id)}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 min-h-0 overflow-auto bg-white">
      <div className="max-w-lg mx-auto p-6 md:p-8">
        <Link
          href="/studio/benchmarks"
          className="inline-block text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 no-underline"
        >
          ← Benchmarks
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add</h1>
        <p className="text-sm text-gray-500 m-0 mb-6">
          Add one PNG or MP4 (upload, paste, drop, or URL). It is stored in Sanity when you save. Maximum{' '}
          {studioInspirationMaxFileMb()} MB.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm border border-amber-100">
              {error}
            </div>
          )}

          <div>
            <span className="block text-sm font-medium text-gray-900 mb-2">Media *</span>
            <StudioPasteThumbnailField
              value={preview}
              onChange={onPreviewChange}
              onBinaryFile={onBinaryFile}
              mediaKind={mediaKind}
            />
          </div>

          <div>
            <label htmlFor="bench-media-url" className="block text-sm font-medium text-gray-900 mb-1.5">
              Or media URL
            </label>
            <input
              id="bench-media-url"
              type="text"
              value={preview}
              onChange={(e) => onPreviewChange(e.target.value)}
              placeholder="https://… .png or .mp4 (optional if you uploaded above)"
              className={studioInputClass}
            />
          </div>

          <div>
            <label htmlFor="bench-title" className="block text-sm font-medium text-gray-900 mb-1.5">
              Title *
            </label>
            <input
              id="bench-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={studioInputClass}
            />
          </div>

          <div>
            <label htmlFor="bench-url" className="block text-sm font-medium text-gray-900 mb-1.5">
              Page link *
            </label>
            <input
              id="bench-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              required
              className={studioInputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-start px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </main>
  )
}
