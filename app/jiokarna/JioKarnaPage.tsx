'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@marcelinodzn/ds-react'
import { IntentScreen } from './screens/IntentScreen'
import { InterviewScreen } from './screens/InterviewScreen'
import { StructureScreen } from './screens/StructureScreen'
import type { IntentFormData, PageBrief } from './types'

type Step = 'intent' | 'interview' | 'structure' | 'approved'

type Message = { role: 'user' | 'assistant'; content: string }

export function JioKarnaPage() {
  const [step, setStep] = useState<Step>('intent')
  const [intentData, setIntentData] = useState<IntentFormData>({
    pageName: '',
    pageType: 'other',
    intent: '',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [brief, setBrief] = useState<PageBrief | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [approvedBrief, setApprovedBrief] = useState<PageBrief | null>(null)

  const handleIntentSubmit = useCallback(() => {
    setStep('interview')
  }, [])

  useEffect(() => {
    if (step !== 'interview' || messages.length > 0 || isThinking) return
    setIsThinking(true)
    fetch('/api/jiokarna/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentData, conversation: [] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.reply) {
          setMessages([{ role: 'assistant', content: data.reply }])
        }
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: 'Failed to start. Please try again.' }])
      })
      .finally(() => setIsThinking(false))
  }, [step])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = { role: 'user', content }
      setMessages((prev) => [...prev, userMsg])
      setIsThinking(true)
      try {
        const res = await fetch('/api/jiokarna/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intentData,
            conversation: [...messages, userMsg],
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        ])
      } finally {
        setIsThinking(false)
      }
    },
    [intentData, messages]
  )

  const handleReady = useCallback(async () => {
    setStep('structure')
    setIsGenerating(true)
    setBrief(null)
    try {
      const res = await fetch('/api/jiokarna/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentData, conversation: messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setBrief(data.brief)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ])
      setStep('interview')
    } finally {
      setIsGenerating(false)
    }
  }, [intentData, messages])

  const handleApprove = useCallback(() => {
    if (brief) {
      setApprovedBrief({ ...brief, status: 'approved' })
      setStep('approved')
    }
  }, [brief])

  const handleRegenerate = useCallback(async () => {
    setIsGenerating(true)
    setBrief(null)
    try {
      const res = await fetch('/api/jiokarna/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentData, conversation: messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setBrief(data.brief)
    } finally {
      setIsGenerating(false)
    }
  }, [intentData, messages])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ds-color-background-ghost)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingBlock: 'var(--ds-spacing-s)',
          paddingInline: 'var(--ds-spacing-m)',
          borderBottom: '1px solid var(--ds-color-stroke-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--ds-color-background-subtle)',
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 'var(--ds-typography-weight-high)',
            color: 'var(--ds-color-text-high)',
            textDecoration: 'none',
            fontSize: 'var(--ds-typography-label-m)',
          }}
        >
          Page Architect
        </Link>
        <Link
          href="/jiokarna"
          style={{
            color: 'var(--ds-color-text-medium)',
            textDecoration: 'none',
            fontSize: 'var(--ds-typography-label-s)',
          }}
        >
          JioKarna
        </Link>
      </header>

      {step === 'intent' && (
        <IntentScreen
          data={intentData}
          onChange={setIntentData}
          onSubmit={handleIntentSubmit}
        />
      )}

      {step === 'interview' && (
        <InterviewScreen
          intentData={intentData}
          messages={messages}
          isThinking={isThinking}
          onSendMessage={handleSendMessage}
          onReady={handleReady}
        />
      )}

      {step === 'structure' && (
        <StructureScreen
          brief={brief}
          isGenerating={isGenerating}
          onApprove={handleApprove}
          onRegenerate={handleRegenerate}
        />
      )}

      {step === 'approved' && approvedBrief && (
        <ApprovedView brief={approvedBrief} onStartOver={() => setStep('intent')} />
      )}
    </main>
  )
}

function ApprovedView({ brief, onStartOver }: { brief: PageBrief; onStartOver: () => void }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary')

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
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-m)', marginTop: 'var(--ds-spacing-l)' }}>
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
