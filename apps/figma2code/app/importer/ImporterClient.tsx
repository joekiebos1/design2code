'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Headline, Text, Button, Card, CardBody, SurfaceProvider } from '@marcelinodzn/ds-react'
import styles from './importer.module.css'

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

  return (
    <SurfaceProvider level={0}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            paddingBlock: 'var(--ds-spacing-s)',
            paddingInline: 'var(--ds-spacing-m)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--ds-color-background-ghost)',
          }}
        >
          <Link
            href="/"
            style={{
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: 'rgba(0, 0, 0, 0.65)',
              textDecoration: 'none',
              fontSize: 'var(--ds-typography-label-m)',
            }}
          >
            Figma2Code
          </Link>
          <Text
            size="S"
            style={{
              margin: 0,
              color: 'rgba(0, 0, 0, 0.48)',
              fontSize: 'var(--ds-typography-label-s)',
            }}
          >
            Figma Importer
          </Text>
        </header>

        <div className={styles.container}>
          <Headline
            size="M"
            as="h1"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-s)',
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: 'var(--ds-color-text-high)',
            }}
          >
            Figma Importer
          </Headline>
          <Text
            size="M"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-xl)',
              color: 'rgba(0, 0, 0, 0.48)',
              fontSize: 'var(--ds-typography-body-m)',
            }}
          >
            Paste a Figma design URL to parse it into a CMS-ready ZIP containing
            page blocks (NDJSON), images, and a manifest.
          </Text>

          <div className={styles.form}>
            <div>
              <label
                htmlFor="figma-url"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-xs)',
                  fontSize: 'var(--ds-typography-label-s)',
                  fontWeight: 'var(--ds-typography-weight-medium)',
                  color: 'var(--ds-color-text-high)',
                }}
              >
                Figma URL *
              </label>
              <input
                id="figma-url"
                type="text"
                placeholder="https://www.figma.com/design/…?node-id=1005-652"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-s) var(--ds-spacing-m)',
                  borderRadius: 'var(--ds-spacing-xs)',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  fontSize: 'var(--ds-typography-body-m)',
                  background: 'var(--ds-color-background-ghost)',
                  color: 'var(--ds-color-text-high)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div>
                <label
                  htmlFor="page-title"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-xs)',
                    fontSize: 'var(--ds-typography-label-s)',
                    fontWeight: 'var(--ds-typography-weight-medium)',
                    color: 'var(--ds-color-text-high)',
                  }}
                >
                  Page title
                </label>
                <input
                  id="page-title"
                  type="text"
                  placeholder="Auto-detected from Figma"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-s) var(--ds-spacing-m)',
                    borderRadius: 'var(--ds-spacing-xs)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    fontSize: 'var(--ds-typography-body-m)',
                    background: 'var(--ds-color-background-ghost)',
                    color: 'var(--ds-color-text-high)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="page-slug"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-xs)',
                    fontSize: 'var(--ds-typography-label-s)',
                    fontWeight: 'var(--ds-typography-weight-medium)',
                    color: 'var(--ds-color-text-high)',
                  }}
                >
                  URL slug
                </label>
                <input
                  id="page-slug"
                  type="text"
                  placeholder="auto-generated"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-s) var(--ds-spacing-m)',
                    borderRadius: 'var(--ds-spacing-xs)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    fontSize: 'var(--ds-typography-body-m)',
                    background: 'var(--ds-color-background-ghost)',
                    color: 'var(--ds-color-text-high)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                onClick={handleParseZip}
                isDisabled={loading || !url.trim()}
                style={{ minWidth: 180 }}
              >
                {loading && loadingPhase ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-s)' }}>
                    <span className={styles.spinner} />
                    {loadingPhase}
                  </span>
                ) : (
                  'Parse & download ZIP'
                )}
              </Button>
              <Button
                appearance="secondary"
                onClick={handleParseJson}
                isDisabled={loading || !url.trim()}
                style={{ minWidth: 120 }}
              >
                JSON only
              </Button>
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {zipResult && (
            <div className={styles.resultCard}>
              <Card surface="minimal" style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <CardBody
                  style={{
                    padding: 'var(--ds-spacing-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--ds-spacing-m)',
                  }}
                >
                  <Headline
                    size="S"
                    as="h2"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-typography-weight-medium)',
                      color: 'var(--ds-color-text-high)',
                    }}
                  >
                    ZIP ready
                  </Headline>
                  <Text
                    size="S"
                    style={{
                      margin: 0,
                      color: 'rgba(0, 0, 0, 0.48)',
                      fontSize: 'var(--ds-typography-label-s)',
                    }}
                  >
                    {zipResult.slug}.zip ({(zipResult.blob.size / 1024).toFixed(0)} KB)
                  </Text>
                  <Text
                    size="S"
                    style={{
                      margin: 0,
                      color: 'rgba(0, 0, 0, 0.48)',
                      fontSize: 'var(--ds-typography-label-s)',
                    }}
                  >
                    Contains data.ndjson + images/ + manifest.json
                  </Text>
                  <div className={styles.downloadActions}>
                    <Button onClick={handleDownloadZip}>Download ZIP</Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {jsonResult && (
            <div className={styles.resultCard}>
              <Card surface="minimal" style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <CardBody
                  style={{
                    padding: 'var(--ds-spacing-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--ds-spacing-m)',
                  }}
                >
                  <Headline
                    size="S"
                    as="h2"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-typography-weight-medium)',
                      color: 'var(--ds-color-text-high)',
                    }}
                  >
                    {jsonResult.title}
                  </Headline>

                  <Text
                    size="S"
                    style={{
                      margin: 0,
                      color: 'rgba(0, 0, 0, 0.48)',
                      fontSize: 'var(--ds-typography-label-s)',
                    }}
                  >
                    {jsonResult.sectionCount} block{jsonResult.sectionCount !== 1 ? 's' : ''} parsed
                    {' · '}{jsonResult.imageCount} image slot{jsonResult.imageCount !== 1 ? 's' : ''}
                    {' · '}slug: <code>{jsonResult.slug}</code>
                  </Text>

                  <ul className={styles.blockList}>
                    {jsonResult.blockSummary.map((block, i) => (
                      <li key={i} className={styles.blockChip}>
                        {block}
                      </li>
                    ))}
                  </ul>

                  {jsonResult.warnings.length > 0 && (
                    <ul className={styles.warningList}>
                      {jsonResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.downloadActions}>
                    <Button onClick={handleDownloadNdjson}>Download .ndjson</Button>
                    <Button appearance="secondary" onClick={handleCopy}>
                      {copied ? 'Copied' : 'Copy to clipboard'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </SurfaceProvider>
  )
}
