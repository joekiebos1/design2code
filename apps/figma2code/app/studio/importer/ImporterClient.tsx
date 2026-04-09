'use client'

import { useState } from 'react'
import {
  studioInputClass,
  studioPreviewColumn,
  studioTitleBlockBottom,
  studioToolInputColumn,
} from '../studio-ui'

type JsonResult = {
  title: string
  slug: string
  blockSummary: string[]
  warnings: string[]
  sectionCount: number
  imageCount: number
  ndjson: string
}

type ZipResult = {
  slug: string
  blob: Blob
}

export function ImporterClient() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jsonResult, setJsonResult] = useState<JsonResult | null>(null)
  const [zipResult, setZipResult] = useState<ZipResult | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    setError(null)
    setJsonResult(null)
    setZipResult(null)
    setCopied(false)
  }

  async function handleParseZip() {
    if (!url.trim()) return
    setLoading(true)
    reset()
    setLoadingPhase('Parsing Figma design…')

    try {
      setLoadingPhase('Rendering images from Figma…')
      const res = await fetch('/api/figma-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }))
        setError(data.error || `Request failed (${res.status})`)
        return
      }

      const contentType = res.headers.get('Content-Type') ?? ''
      if (contentType.includes('application/zip')) {
        const disposition = res.headers.get('Content-Disposition') ?? ''
        const filenameMatch = disposition.match(/filename="([^"]+)"/)
        const zipSlug = filenameMatch?.[1]?.replace(/\.zip$/, '') ?? 'figma-import'
        const blob = await res.blob()
        setZipResult({ slug: zipSlug, blob })
      } else {
        const data = await res.json()
        setError(data.error || 'Unexpected response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
      setLoadingPhase(null)
    }
  }

  async function handleParseJson() {
    if (!url.trim()) return
    setLoading(true)
    reset()
    setLoadingPhase('Parsing Figma design…')

    try {
      const res = await fetch('/api/figma-import?format=json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`)
        return
      }
      setJsonResult(data as JsonResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
      setLoadingPhase(null)
    }
  }

  function handleDownloadZip() {
    if (!zipResult) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipResult.blob)
    a.download = `${zipResult.slug}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function handleDownloadNdjson() {
    if (!jsonResult) return
    const blob = new Blob([jsonResult.ndjson], { type: 'application/x-ndjson' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${jsonResult.slug}.ndjson`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleCopy() {
    if (!jsonResult) return
    await navigator.clipboard.writeText(jsonResult.ndjson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasPreviewContent = Boolean(error || zipResult || jsonResult || loading)

  const primaryButtonClass =
    'w-full px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
  const secondaryButtonClass =
    'w-full px-4 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'

  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Panel 2: tool input — 320px */}
      <div
        className={`${studioToolInputColumn} border-r border-gray-200 overflow-y-auto studio-scrollbar bg-white p-6`}
      >
        <div className={studioTitleBlockBottom}>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Figma2CMS
          </h1>
          <p className="text-sm text-gray-500 m-0 leading-relaxed">
            Paste a Figma URL to produce a ZIP with NDJSON blocks, images, and a manifest.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="figma-url" className="block text-sm font-medium text-gray-900 mb-1.5">
              Figma URL *
            </label>
            <input
              id="figma-url"
              type="text"
              placeholder="https://www.figma.com/design/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={studioInputClass}
            />
          </div>

          <div>
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-900 mb-1.5">
              Page title
            </label>
            <input
              id="page-title"
              type="text"
              placeholder="Auto-detected from Figma"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={studioInputClass}
            />
          </div>

          <div>
            <label htmlFor="page-slug" className="block text-sm font-medium text-gray-900 mb-1.5">
              URL slug
            </label>
            <input
              id="page-slug"
              type="text"
              placeholder="auto-generated"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={studioInputClass}
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleParseZip}
              disabled={loading || !url.trim()}
              className={primaryButtonClass}
            >
              {loading && loadingPhase ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span className="text-left">{loadingPhase}</span>
                </span>
              ) : (
                'Parse & download ZIP'
              )}
            </button>
            <button
              type="button"
              onClick={handleParseJson}
              disabled={loading || !url.trim()}
              className={secondaryButtonClass}
            >
              JSON only
            </button>
          </div>
        </div>
      </div>

      {/* Panel 3: Preview — flexible */}
      <div className={`${studioPreviewColumn} bg-gray-50`}>
        <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto studio-scrollbar p-4 md:p-6 flex flex-col gap-6">
          {!hasPreviewContent && (
            <p className="text-sm text-gray-500 m-0">Parse results will appear here.</p>
          )}

          {loading && (
            <p className="text-sm text-gray-600 m-0">{loadingPhase ?? 'Working…'}</p>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}

          {zipResult && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-2">ZIP ready</h3>
              <p className="text-sm text-gray-500 mb-1">
                {zipResult.slug}.zip ({(zipResult.blob.size / 1024).toFixed(0)} KB)
              </p>
              <p className="text-sm text-gray-500 mb-4">Contains data.ndjson + images/ + manifest.json</p>
              <button
                type="button"
                onClick={handleDownloadZip}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Download ZIP
              </button>
            </div>
          )}

          {jsonResult && (
            <>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{jsonResult.title}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {jsonResult.sectionCount} block{jsonResult.sectionCount !== 1 ? 's' : ''} parsed
                  {' · '}{jsonResult.imageCount} image slot{jsonResult.imageCount !== 1 ? 's' : ''}
                  {' · '}slug: <code className="text-gray-700">{jsonResult.slug}</code>
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {jsonResult.blockSummary.map((block, i) => (
                    <span key={i} className="px-3 py-1 rounded-md bg-gray-100 text-sm text-gray-700">
                      {block}
                    </span>
                  ))}
                </div>

                {jsonResult.warnings.length > 0 && (
                  <ul className="text-sm text-gray-500 list-disc pl-5 mb-4">
                    {jsonResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadNdjson}
                    className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Download .ndjson
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    {copied ? 'Copied' : 'Copy to clipboard'}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  NDJSON
                </span>
                <pre className="m-0 p-4 rounded-lg border border-gray-200 bg-white text-xs font-mono text-gray-800 whitespace-pre-wrap break-words leading-relaxed overflow-x-auto">
                  {jsonResult.ndjson}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
