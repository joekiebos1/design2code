'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@marcelinodzn/ds-react'
import type { PageBrief } from '../types'

type ApprovedScreenProps = {
  brief: PageBrief
  onStartOver: () => void
}

export function ApprovedScreen({ brief, onStartOver }: ApprovedScreenProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary')
  const [createStatus, setCreateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [createMessage, setCreateMessage] = useState<string>('')

  const markdownSummary = `# ${brief.meta.pageName}

**Type:** ${brief.meta.pageType}  
**Slug:** ${brief.meta.slug}  
**Intent:** ${brief.meta.intent}  
**Audience:** ${brief.meta.audience}  
**Primary action:** ${brief.meta.primaryAction}  
**Key message:** ${brief.meta.keyMessage}

## Information architecture
- **Path:** ${brief.ia.proposedPath}
- **Parent section:** ${brief.ia.parentSection}

## Sections
${brief.sections
  .sort((a, b) => a.order - b.order)
  .map((s) => {
    const cta = s.contentSlots.cta
    const ctaStr = !cta
      ? ''
      : typeof cta === 'string'
        ? cta
        : (cta.label || cta.destination)
          ? cta.destination
            ? `${cta.label || cta.destination} → ${cta.destination}`
            : String(cta.label || cta.destination)
          : ''
    const crossLinksStr =
      Array.isArray(s.crossLinks) && s.crossLinks.length > 0
        ? '\n- Cross-links:\n' + s.crossLinks.map((l) => `  - ${l.label} → ${l.destination}`).join('\n')
        : ''
    return `### ${s.order}. ${s.sectionName} (${s.component})
${s.rationale}
${s.contentSlots.headline ? `- Headline: ${s.contentSlots.headline}` : ''}${ctaStr ? `\n- CTA: ${ctaStr}` : ''}${crossLinksStr}`
  })
  .join('\n\n')}
`

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBlock: 'var(--ds-spacing-2xl)' }}>
      <h1 style={{ fontSize: 'var(--ds-typography-h3)', marginBottom: 'var(--ds-spacing-m)' }}>
        Brief approved
      </h1>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-s)', marginBottom: 'var(--ds-spacing-l)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          style={{
            padding: 'var(--ds-spacing-s) var(--ds-spacing-m)',
            border: '1px solid var(--ds-color-stroke-divider)',
            borderRadius: 'var(--ds-radius-card-s)',
            background: activeTab === 'summary' ? 'var(--ds-color-background-subtle)' : 'transparent',
            cursor: 'pointer',
            fontSize: 'var(--ds-typography-label-s)',
          }}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('json')}
          style={{
            padding: 'var(--ds-spacing-s) var(--ds-spacing-m)',
            border: '1px solid var(--ds-color-stroke-divider)',
            borderRadius: 'var(--ds-radius-card-s)',
            background: activeTab === 'json' ? 'var(--ds-color-background-subtle)' : 'transparent',
            cursor: 'pointer',
            fontSize: 'var(--ds-typography-label-s)',
          }}
        >
          JSON
        </button>
      </div>
      <pre
        style={{
          padding: 'var(--ds-spacing-m)',
          background: 'var(--ds-color-background-subtle)',
          borderRadius: 'var(--ds-radius-card-s)',
          overflow: 'auto',
          fontSize: 'var(--ds-typography-body-xs)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {activeTab === 'summary' ? markdownSummary : JSON.stringify(brief, null, 2)}
      </pre>
      {createStatus === 'success' && createMessage && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-m)',
            padding: 'var(--ds-spacing-m)',
            background: 'var(--ds-color-background-positive-subtle)',
            borderRadius: 'var(--ds-radius-card-s)',
            fontSize: 'var(--ds-typography-body-s)',
          }}
        >
          {createMessage}{' '}
          <Link
            href={`/${brief.meta.slug}`}
            style={{ color: 'var(--ds-color-text-interactive)', fontWeight: 'var(--ds-typography-weight-high)' }}
          >
            View page →
          </Link>
        </div>
      )}
      {createStatus === 'error' && createMessage && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-m)',
            padding: 'var(--ds-spacing-m)',
            background: 'var(--ds-color-background-negative-subtle)',
            borderRadius: 'var(--ds-radius-card-s)',
            fontSize: 'var(--ds-typography-body-s)',
            color: 'var(--ds-color-text-negative)',
          }}
        >
          {createMessage}
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-m)', marginTop: 'var(--ds-spacing-l)', flexWrap: 'wrap' }}>
        <Button
          onPress={async () => {
            setCreateStatus('loading')
            setCreateMessage('')
            try {
              const res = await fetch('/api/jiokarna/create-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brief),
              })
              const data = await res.json()
              if (!res.ok) {
                setCreateStatus('error')
                setCreateMessage(data.error || 'Failed to create page')
                return
              }
              setCreateStatus('success')
              setCreateMessage(data.message || `Page created. Visit /${data.slug}`)
            } catch (err) {
              setCreateStatus('error')
              setCreateMessage(err instanceof Error ? err.message : 'Failed to create page')
            }
          }}
          appearance="secondary"
          size="S"
          attention="high"
          isDisabled={createStatus === 'loading'}
        >
          {createStatus === 'loading' ? 'Creating…' : 'Create page in Sanity'}
        </Button>
        <Button
          onPress={() => {
            const blob = new Blob(
              [activeTab === 'summary' ? markdownSummary : JSON.stringify(brief, null, 2)],
              { type: activeTab === 'summary' ? 'text/markdown' : 'application/json' }
            )
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${brief.meta.slug || 'brief'}.${activeTab === 'summary' ? 'md' : 'json'}`
            a.click()
            URL.revokeObjectURL(url)
          }}
          appearance="neutral"
          size="S"
          attention="high"
        >
          Export {activeTab === 'summary' ? 'Markdown' : 'JSON'}
        </Button>
        <Button onPress={onStartOver} appearance="secondary" contained={false} size="S" attention="high">
          Start over
        </Button>
      </div>
    </div>
  )
}
