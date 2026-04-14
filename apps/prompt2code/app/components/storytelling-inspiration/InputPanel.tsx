'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { StoryCoachInput } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3

type InferResult = {
  confidence: 'high' | 'low'
  productType: 'software' | 'hardware'
  keyMessage: string
  suggestions: string[]
  hasMore: boolean
}

type BatchResult = {
  suggestions: string[]
  hasMore: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY_ACTIONS = [
  { value: 'Download the app',  type: 'software' as const },
  { value: 'Shop on JioMart',   type: 'hardware' as const },
  { value: 'Get started',       type: null },
  { value: 'Learn more',        type: null },
]

const MIN_FACTS = 3

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '16px 0 8px' }}>
      {([1, 2, 3] as Step[]).map(s => (
        <div key={s} style={{
          width: s === step ? 16 : 6,
          height: 6,
          borderRadius: 3,
          background: s === step ? '#4f46e5' : s < step ? 'rgba(79,70,229,0.35)' : 'rgba(0,0,0,0.12)',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  )
}

function SuggestionCard({
  index,
  text,
  onAccept,
  onDismiss,
  keyboardHint,
}: {
  index: number
  text: string
  onAccept: () => void
  onDismiss: () => void
  keyboardHint: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Stagger entrance
    const t = setTimeout(() => setVisible(true), index * 60)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: 'rgba(79,70,229,0.05)',
        border: '1px solid rgba(79,70,229,0.18)',
        borderRadius: 10,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.18s, transform 0.18s',
        userSelect: 'none',
      }}
      onClick={onAccept}
    >
      {/* Number badge */}
      <div style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        background: '#4f46e5',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'inherit',
        letterSpacing: 0,
      }}>
        {keyboardHint ? index + 1 : ''}
        {!keyboardHint && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>

      {/* Text */}
      <span style={{
        flex: 1,
        fontSize: 12,
        color: 'rgb(13,13,15)',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
      }}>
        {text}
      </span>

      {/* Dismiss */}
      <button
        onClick={e => { e.stopPropagation(); onDismiss() }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.35)',
          flexShrink: 0,
          padding: 0,
          transition: 'color 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.35)' }}
        aria-label="Dismiss suggestion"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

function ConfirmedFact({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '6px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 16,
        height: 16,
        marginTop: 1,
        borderRadius: '50%',
        background: 'rgba(79,70,229,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span style={{
        flex: 1,
        fontSize: 12,
        color: 'rgba(0,0,0,0.65)',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
      }}>
        {text}
      </span>
      <button
        onClick={onRemove}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '2px 4px',
          color: 'rgba(0,0,0,0.25)',
          fontSize: 10,
          fontFamily: 'inherit',
          transition: 'color 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(220,38,38,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.25)' }}
        aria-label="Remove fact"
      >
        ✕
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type InputPanelProps = {
  onSubmit: (input: StoryCoachInput) => void
  isLoading: boolean
}

export function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [step, setStep]               = useState<Step>(1)
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState<'software' | 'hardware'>('software')

  // Step 2 — fact loop
  const [confirmed, setConfirmed]         = useState<string[]>([])
  const [dismissed, setDismissed]         = useState<string[]>([])
  const [queue, setQueue]                 = useState<string[]>([])   // unshown buffer
  const [visible, setVisible]             = useState<string[]>([])   // up to 3 shown
  const [freeInput, setFreeInput]         = useState('')
  const [inferring, setInferring]         = useState(false)
  const [fetchingMore, setFetchingMore]   = useState(false)
  const [hasMore, setHasMore]             = useState(true)
  const [lowConfidence, setLowConfidence] = useState(false)

  // Step 3
  const [primaryAction, setPrimaryAction] = useState('Download the app')
  const [keyMessage, setKeyMessage]       = useState('')
  const [editingMessage, setEditingMessage] = useState(false)

  const freeInputRef    = useRef<HTMLInputElement>(null)
  const confirmedEndRef = useRef<HTMLDivElement>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Pull up to 3 items from the buffer into visible slots */
  const fillVisible = useCallback((currentVisible: string[], buffer: string[]) => {
    const needed = 3 - currentVisible.length
    if (needed <= 0 || buffer.length === 0) return { newVisible: currentVisible, newQueue: buffer }
    const taken = buffer.slice(0, needed)
    return {
      newVisible: [...currentVisible, ...taken],
      newQueue: buffer.slice(needed),
    }
  }, [])

  /** Fetch next batch from the API */
  const fetchMore = useCallback(async (name: string, conf: string[], dis: string[]) => {
    if (fetchingMore) return
    setFetchingMore(true)
    try {
      const res = await fetch('/api/infer-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, confirmed: conf, dismissed: dis }),
      })
      const data = await res.json() as BatchResult
      setHasMore(data.hasMore)
      setQueue(prev => {
        const next = [...prev, ...(data.suggestions ?? [])]
        return next
      })
    } catch { /* ignore */ } finally {
      setFetchingMore(false)
    }
  }, [fetchingMore])

  // ── Initial inference when product name is typed ──────────────────────────

  const runInference = useDebouncedCallback(async (name: string) => {
    if (!name.trim()) return
    setInferring(true)
    setConfirmed([])
    setDismissed([])
    setQueue([])
    setVisible([])
    setHasMore(true)
    setLowConfidence(false)
    try {
      const res = await fetch('/api/infer-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name }),
      })
      const data = await res.json() as InferResult
      setProductType(data.productType ?? 'software')
      setKeyMessage(data.keyMessage ?? '')
      setLowConfidence(data.confidence === 'low')
      setHasMore(data.hasMore)
      // Populate primary action default based on inferred type
      setPrimaryAction(data.productType === 'hardware' ? 'Shop on JioMart' : 'Download the app')

      const suggestions = data.suggestions ?? []
      const first3 = suggestions.slice(0, 3)
      const rest   = suggestions.slice(3)
      setVisible(first3)
      setQueue(rest)
    } catch { /* ignore */ } finally {
      setInferring(false)
    }
  }, 700)

  useEffect(() => {
    if (productName.trim().length > 1) runInference(productName)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName])

  // ── After acting on a card, fill visible from queue; maybe fetch more ──────

  const afterAct = useCallback((
    newVisible: string[],
    newQueue: string[],
    newConfirmed: string[],
    newDismissed: string[],
  ) => {
    const { newVisible: filled, newQueue: remaining } = fillVisible(newVisible, newQueue)
    setVisible(filled)
    setQueue(remaining)

    // Fetch next batch when queue runs low
    const totalRemaining = filled.length + remaining.length
    if (totalRemaining < 3 && hasMore && !fetchingMore) {
      fetchMore(productName, newConfirmed, newDismissed)
    }
  }, [fillVisible, hasMore, fetchingMore, fetchMore, productName])

  // ── Accept a visible suggestion ───────────────────────────────────────────

  const accept = useCallback((text: string) => {
    const newConfirmed = [...confirmed, text]
    const newVisible   = visible.filter(v => v !== text)
    setConfirmed(newConfirmed)
    afterAct(newVisible, queue, newConfirmed, dismissed)
    // Scroll confirmed list to bottom
    setTimeout(() => confirmedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }, [confirmed, visible, queue, dismissed, afterAct])

  // ── Dismiss a visible suggestion ──────────────────────────────────────────

  const dismiss = useCallback((text: string) => {
    const newDismissed = [...dismissed, text]
    const newVisible   = visible.filter(v => v !== text)
    setDismissed(newDismissed)
    afterAct(newVisible, queue, confirmed, newDismissed)
  }, [dismissed, visible, queue, confirmed, afterAct])

  // ── Accept free input ─────────────────────────────────────────────────────

  const acceptFree = useCallback(() => {
    const text = freeInput.trim()
    if (!text) return
    const newConfirmed = [...confirmed, text]
    setConfirmed(newConfirmed)
    setFreeInput('')
    setTimeout(() => confirmedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }, [freeInput, confirmed])

  // ── Keyboard shortcuts (1/2/3 on step 2) ─────────────────────────────────

  useEffect(() => {
    if (step !== 2) return
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in the free input
      if (document.activeElement === freeInputRef.current) return
      if (e.key === '1' && visible[0]) { accept(visible[0]); return }
      if (e.key === '2' && visible[1]) { accept(visible[1]); return }
      if (e.key === '3' && visible[2]) { accept(visible[2]); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, visible, accept])

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    onSubmit({
      outputType: 'product-page',
      productType,
      productName,
      facts: confirmed,
      keyMessage,
      primaryAction,
      // Legacy compat — derived from facts
      whatItDoes: confirmed.join('\n'),
      whatIsInIt: '',
      builtFor: '',
    })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgb(13,13,15)', letterSpacing: '-0.02em' }}>
          Prompt2Code
        </div>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', marginTop: 2, letterSpacing: '-0.01em' }}>
          {step === 1 && 'Name your product'}
          {step === 2 && 'Build your brief'}
          {step === 3 && 'Final details'}
        </div>
        <StepDots step={step} />
      </div>

      {/* ── Step 1 — Product name ──────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 20px 20px', gap: 20 }}>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'rgb(13,13,15)', letterSpacing: '-0.01em', marginBottom: 8 }}>
              What product is this page for?
            </div>
            <input
              autoFocus
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && productName.trim()) setStep(2) }}
              placeholder="e.g. JioSaavn, JioPhone 5G…"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 8,
                outline: 'none',
                background: 'rgba(0,0,0,0.02)',
                color: 'rgb(13,13,15)',
                letterSpacing: '-0.01em',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.14)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Product type toggle */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 8 }}>
              Type
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['software', 'hardware'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setProductType(t)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    fontWeight: productType === t ? 600 : 400,
                    letterSpacing: '-0.01em',
                    border: '1px solid',
                    borderColor: productType === t ? '#4f46e5' : 'rgba(0,0,0,0.14)',
                    borderRadius: 7,
                    background: productType === t ? 'rgba(79,70,229,0.06)' : 'transparent',
                    color: productType === t ? '#4f46e5' : 'rgba(0,0,0,0.55)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {t === 'software' ? 'App / Software' : 'Hardware'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <button
            disabled={!productName.trim()}
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              borderRadius: 8,
              border: 'none',
              background: productName.trim() ? '#4f46e5' : 'rgba(0,0,0,0.08)',
              color: productName.trim() ? '#fff' : 'rgba(0,0,0,0.3)',
              cursor: productName.trim() ? 'pointer' : 'default',
              transition: 'all 0.12s',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step 2 — Fact loop ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Confirmed facts — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0' }}>
            {confirmed.length === 0 && !inferring && (
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: '-0.01em', paddingTop: 4, paddingBottom: 8 }}>
                Accept facts to build your brief
              </div>
            )}
            {confirmed.map((fact, i) => (
              <ConfirmedFact
                key={i}
                text={fact}
                onRemove={() => setConfirmed(prev => prev.filter((_, j) => j !== i))}
              />
            ))}
            <div ref={confirmedEndRef} />
          </div>

          {/* Divider when there are confirmed facts */}
          {confirmed.length > 0 && (
            <div style={{ margin: '6px 20px', borderTop: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }} />
          )}

          {/* Suggestion cards + free input — fixed at bottom */}
          <div style={{ flexShrink: 0, padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* Loading state */}
            {inferring && (
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', letterSpacing: '-0.01em', padding: '8px 0', textAlign: 'center' }}>
                Thinking about {productName}…
              </div>
            )}

            {/* Suggestion cards */}
            {!inferring && visible.map((text, i) => (
              <SuggestionCard
                key={text}
                index={i}
                text={text}
                keyboardHint={!lowConfidence}
                onAccept={() => accept(text)}
                onDismiss={() => dismiss(text)}
              />
            ))}

            {/* Fetching more indicator */}
            {fetchingMore && visible.length < 3 && (
              <div style={{
                height: 46,
                borderRadius: 10,
                background: 'rgba(79,70,229,0.03)',
                border: '1px dashed rgba(79,70,229,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', letterSpacing: '-0.01em' }}>loading more…</div>
              </div>
            )}

            {/* "Claude has run dry" message */}
            {!inferring && !fetchingMore && !hasMore && visible.length === 0 && confirmed.length > 0 && (
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', letterSpacing: '-0.01em', textAlign: 'center', padding: '4px 0 2px' }}>
                That's everything I know — add anything I missed below
              </div>
            )}

            {/* Free input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 10,
            }}>
              <input
                ref={freeInputRef}
                type="text"
                value={freeInput}
                onChange={e => setFreeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') acceptFree() }}
                placeholder={lowConfidence ? `Tell me about ${productName}…` : 'Add your own fact…'}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  color: 'rgb(13,13,15)',
                  outline: 'none',
                  letterSpacing: '-0.01em',
                }}
              />
              <button
                onClick={acceptFree}
                disabled={!freeInput.trim()}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: freeInput.trim() ? 'pointer' : 'default',
                  padding: 0,
                  color: freeInput.trim() ? '#4f46e5' : 'rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.1s',
                }}
                aria-label="Add fact"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '9px 14px',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 7,
                  background: 'transparent',
                  color: 'rgba(0,0,0,0.45)',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                disabled={confirmed.length < MIN_FACTS}
                onClick={() => setStep(3)}
                style={{
                  flex: 1,
                  padding: '9px',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: 'none',
                  borderRadius: 7,
                  background: confirmed.length >= MIN_FACTS ? '#4f46e5' : 'rgba(0,0,0,0.07)',
                  color: confirmed.length >= MIN_FACTS ? '#fff' : 'rgba(0,0,0,0.3)',
                  cursor: confirmed.length >= MIN_FACTS ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
              >
                {confirmed.length < MIN_FACTS
                  ? `${MIN_FACTS - confirmed.length} more fact${MIN_FACTS - confirmed.length === 1 ? '' : 's'} to go`
                  : `Next — ${confirmed.length} facts →`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 — Action + key message + generate ──────────────────────── */}
      {step === 3 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 20px 20px', gap: 16, overflowY: 'auto' }}>

          {/* Primary action */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 8 }}>
              Primary action
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {PRIMARY_ACTIONS.map(({ value, type }) => {
                // Filter to relevant actions for this product type, but show all
                const relevant = type === null || type === productType
                if (!relevant && value !== primaryAction) return null
                return (
                  <button
                    key={value}
                    onClick={() => setPrimaryAction(value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      letterSpacing: '-0.01em',
                      border: '1px solid',
                      borderColor: primaryAction === value ? '#4f46e5' : 'rgba(0,0,0,0.12)',
                      borderRadius: 8,
                      background: primaryAction === value ? 'rgba(79,70,229,0.06)' : 'transparent',
                      color: primaryAction === value ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.55)',
                      cursor: 'pointer',
                      fontWeight: primaryAction === value ? 500 : 400,
                      textAlign: 'left',
                      transition: 'all 0.1s',
                    }}
                  >
                    <div style={{
                      width: 12, height: 12,
                      borderRadius: '50%',
                      border: primaryAction === value ? '4px solid #4f46e5' : '1.5px solid rgba(0,0,0,0.25)',
                      flexShrink: 0,
                      transition: 'border 0.1s',
                    }} />
                    {value}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Key message */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 8 }}>
              Key message
            </div>
            {editingMessage ? (
              <textarea
                autoFocus
                value={keyMessage}
                onChange={e => setKeyMessage(e.target.value)}
                onBlur={() => setEditingMessage(false)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: '1px solid #4f46e5',
                  borderRadius: 8,
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(79,70,229,0.1)',
                  resize: 'none',
                  color: 'rgb(13,13,15)',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                onClick={() => setEditingMessage(true)}
                style={{
                  padding: '9px 12px',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  color: keyMessage ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.3)',
                  lineHeight: 1.5,
                  cursor: 'text',
                  minHeight: 58,
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                {keyMessage || `The core promise of ${productName}…`}
                <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>✎</span>
              </div>
            )}
          </div>

          {/* Facts summary */}
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', letterSpacing: '-0.01em' }}>
            {confirmed.length} facts · {productName} · {productType === 'software' ? 'App' : 'Hardware'}
          </div>

          <div style={{ flex: 1 }} />

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                borderRadius: 8,
                border: 'none',
                background: isLoading ? 'rgba(0,0,0,0.08)' : '#4f46e5',
                color: isLoading ? 'rgba(0,0,0,0.3)' : '#fff',
                cursor: isLoading ? 'default' : 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {isLoading ? 'Generating…' : 'Generate page'}
            </button>
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '9px',
                fontSize: 12,
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 7,
                background: 'transparent',
                color: 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
              }}
            >
              ← Back to facts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
