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
  { value: 'Download the app', type: 'software' as const },
  { value: 'Shop on JioMart',  type: 'hardware' as const },
  { value: 'Get started',      type: null },
  { value: 'Learn more',       type: null },
]

const MIN_FACTS = 3

// ─── Suggestion card ─────────────────────────────────────────────────────────

function SuggestionCard({
  index,
  text,
  onAccept,
  onDismiss,
  showKeyHint,
}: {
  index: number
  text: string
  onAccept: () => void
  onDismiss: () => void
  showKeyHint: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      onClick={onAccept}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 11px',
        background: 'rgba(79,70,229,0.05)',
        border: '1px solid rgba(79,70,229,0.16)',
        borderRadius: 9,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.16s, transform 0.16s, background 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(79,70,229,0.09)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(79,70,229,0.05)' }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: '#4f46e5', color: '#fff',
        fontSize: 11, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontFamily: 'inherit',
      }}>
        {showKeyHint ? index + 1 : (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{
        flex: 1, fontSize: 12, color: 'rgb(13,13,15)',
        lineHeight: 1.45, letterSpacing: '-0.01em', fontFamily: 'inherit',
      }}>
        {text}
      </span>
      <button
        onClick={e => { e.stopPropagation(); onDismiss() }}
        style={{
          width: 20, height: 20, borderRadius: 4, border: 'none',
          background: 'transparent', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,0,0,0.3)', flexShrink: 0, transition: 'color 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.65)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.3)' }}
        aria-label="Dismiss"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
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
  const [queue, setQueue]                 = useState<string[]>([])
  const [visibleCards, setVisibleCards]   = useState<string[]>([])
  const [freeInput, setFreeInput]         = useState('')
  const [inferring, setInferring]         = useState(false)
  const [fetchingMore, setFetchingMore]   = useState(false)
  const [hasMore, setHasMore]             = useState(true)
  const [lowConfidence, setLowConfidence] = useState(false)

  // Step 3
  const [primaryAction, setPrimaryAction]     = useState('Download the app')
  const [keyMessage, setKeyMessage]           = useState('')
  const [editingMessage, setEditingMessage]   = useState(false)

  const freeInputRef   = useRef<HTMLInputElement>(null)
  const briefEndRef    = useRef<HTMLDivElement>(null)

  // ── Queue helpers ───────────────────────────────────────────────────────────

  const fillVisible = useCallback((current: string[], buffer: string[]) => {
    const needed = 3 - current.length
    if (needed <= 0 || buffer.length === 0) return { next: current, rest: buffer }
    return { next: [...current, ...buffer.slice(0, needed)], rest: buffer.slice(needed) }
  }, [])

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
      setQueue(prev => [...prev, ...(data.suggestions ?? [])])
    } catch { /* ignore */ } finally {
      setFetchingMore(false)
    }
  }, [fetchingMore])

  // ── Initial inference ───────────────────────────────────────────────────────

  const runInference = useDebouncedCallback(async (name: string) => {
    if (!name.trim()) return
    setInferring(true)
    setConfirmed([])
    setDismissed([])
    setQueue([])
    setVisibleCards([])
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
      setPrimaryAction(data.productType === 'hardware' ? 'Shop on JioMart' : 'Download the app')
      setVisibleCards(data.suggestions?.slice(0, 3) ?? [])
      setQueue(data.suggestions?.slice(3) ?? [])
    } catch { /* ignore */ } finally {
      setInferring(false)
    }
  }, 700)

  useEffect(() => {
    if (productName.trim().length > 1) runInference(productName)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName])

  // ── Act on a card ───────────────────────────────────────────────────────────

  const afterAct = useCallback((
    newCards: string[], newQueue: string[],
    newConf: string[], newDis: string[],
  ) => {
    const { next, rest } = fillVisible(newCards, newQueue)
    setVisibleCards(next)
    setQueue(rest)
    if (next.length + rest.length < 3 && hasMore && !fetchingMore) {
      fetchMore(productName, newConf, newDis)
    }
  }, [fillVisible, hasMore, fetchingMore, fetchMore, productName])

  const accept = useCallback((text: string) => {
    const newConf = [...confirmed, text]
    setConfirmed(newConf)
    afterAct(visibleCards.filter(v => v !== text), queue, newConf, dismissed)
    setTimeout(() => briefEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }, [confirmed, visibleCards, queue, dismissed, afterAct])

  const dismiss = useCallback((text: string) => {
    const newDis = [...dismissed, text]
    setDismissed(newDis)
    afterAct(visibleCards.filter(v => v !== text), queue, confirmed, newDis)
  }, [dismissed, visibleCards, queue, confirmed, afterAct])

  const acceptFree = useCallback(() => {
    const text = freeInput.trim()
    if (!text) return
    setConfirmed(prev => [...prev, text])
    setFreeInput('')
    setTimeout(() => briefEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }, [freeInput])

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    if (step !== 2) return
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === freeInputRef.current) return
      if (e.key === '1' && visibleCards[0]) { accept(visibleCards[0]); return }
      if (e.key === '2' && visibleCards[1]) { accept(visibleCards[1]); return }
      if (e.key === '3' && visibleCards[2]) { accept(visibleCards[2]); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, visibleCards, accept])

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    onSubmit({
      outputType: 'product-page',
      productType,
      productName,
      facts: confirmed,
      keyMessage,
      primaryAction,
      whatItDoes: confirmed.join('\n'),
      whatIsInIt: '',
      builtFor: '',
    })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const hasBriefContent = step > 1 && productName

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden', fontFamily: 'inherit',
    }}>

      {/* ── Title header ──────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 20px 20px', flexShrink: 0 }}>
        <div style={{
          fontSize: 24, fontWeight: 600, color: 'rgb(13,13,15)',
          letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 8,
        }}>
          Prompt2Code
        </div>
        <div style={{
          fontSize: 13, color: 'rgba(0,0,0,0.48)', lineHeight: 1.55,
          letterSpacing: '-0.01em',
        }}>
          Turn a product brief into a full Jio page.<br />
          Tell us what you know — we handle the rest.
        </div>
      </div>

      {/* ── Brief section ─────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: '0 20px' }}>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 14, paddingBottom: hasBriefContent ? 6 : 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)',
          }}>
            Brief
          </div>
        </div>
      </div>

      {/* Brief content — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {!hasBriefContent && (
          <div style={{
            fontSize: 12, color: 'rgba(0,0,0,0.25)',
            letterSpacing: '-0.01em', padding: '8px 0 4px',
            fontStyle: 'italic',
          }}>
            Your brief will appear here
          </div>
        )}

        {/* Product identity */}
        {hasBriefContent && (
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            padding: '8px 0 6px',
            borderBottom: confirmed.length > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'rgb(13,13,15)',
              letterSpacing: '-0.02em',
            }}>
              {productName}
            </span>
            <span style={{
              fontSize: 11, color: 'rgba(0,0,0,0.35)',
              letterSpacing: '-0.01em',
            }}>
              {productType === 'software' ? 'App / Software' : 'Hardware'}
            </span>
          </div>
        )}

        {/* Confirmed facts */}
        {confirmed.map((fact, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '5px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 14, height: 14, marginTop: 2,
              borderRadius: '50%',
              background: 'rgba(79,70,229,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              flex: 1, fontSize: 12, color: 'rgba(0,0,0,0.6)',
              lineHeight: 1.45, letterSpacing: '-0.01em',
            }}>
              {fact}
            </span>
            <button
              onClick={() => setConfirmed(prev => prev.filter((_, j) => j !== i))}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '1px 3px', color: 'rgba(0,0,0,0.2)', fontSize: 10,
                fontFamily: 'inherit', transition: 'color 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(220,38,38,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,0,0,0.2)' }}
            >✕</button>
          </div>
        ))}

        {/* Key message + action in brief (step 3) */}
        {step === 3 && keyMessage && (
          <div style={{ padding: '7px 0 4px', borderTop: confirmed.length > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none', marginTop: 2 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', letterSpacing: '-0.01em', marginBottom: 3 }}>
              Key message
            </div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', lineHeight: 1.45, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
              "{keyMessage}"
            </div>
          </div>
        )}

        <div ref={briefEndRef} />
      </div>

      {/* ── Interaction area — always at bottom ──────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(0,0,0,0.08)',
        padding: '14px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>

        {/* ── Step 1 ──────────────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div style={{
              fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.6)',
              letterSpacing: '-0.01em', marginBottom: 2,
            }}>
              What is this page for?
            </div>

            <input
              autoFocus
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && productName.trim()) setStep(2) }}
              placeholder="e.g. JioSaavn, JioPhone 5G…"
              style={{
                width: '100%', padding: '9px 12px',
                fontSize: 13, fontFamily: 'inherit',
                border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8,
                outline: 'none', background: 'rgba(0,0,0,0.02)',
                color: 'rgb(13,13,15)', letterSpacing: '-0.01em',
                boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.14)'; e.target.style.boxShadow = 'none' }}
            />

            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['software', 'hardware'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setProductType(t)}
                  style={{
                    flex: 1, padding: '7px 0',
                    fontSize: 11, fontFamily: 'inherit',
                    fontWeight: productType === t ? 600 : 400,
                    letterSpacing: '-0.01em',
                    border: '1px solid',
                    borderColor: productType === t ? '#4f46e5' : 'rgba(0,0,0,0.12)',
                    borderRadius: 7,
                    background: productType === t ? 'rgba(79,70,229,0.06)' : 'transparent',
                    color: productType === t ? '#4f46e5' : 'rgba(0,0,0,0.45)',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  {t === 'software' ? 'App / Software' : 'Hardware'}
                </button>
              ))}
            </div>

            <button
              disabled={!productName.trim()}
              onClick={() => setStep(2)}
              style={{
                width: '100%', padding: '10px',
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                letterSpacing: '-0.01em', borderRadius: 8, border: 'none',
                background: productName.trim() ? '#4f46e5' : 'rgba(0,0,0,0.07)',
                color: productName.trim() ? '#fff' : 'rgba(0,0,0,0.3)',
                cursor: productName.trim() ? 'pointer' : 'default',
                transition: 'all 0.12s',
              }}
            >
              Next →
            </button>
          </>
        )}

        {/* ── Step 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Loading */}
            {inferring && (
              <div style={{
                fontSize: 12, color: 'rgba(0,0,0,0.35)', letterSpacing: '-0.01em',
                textAlign: 'center', padding: '6px 0',
              }}>
                Looking up {productName}…
              </div>
            )}

            {/* Suggestion cards */}
            {!inferring && visibleCards.map((text, i) => (
              <SuggestionCard
                key={text}
                index={i}
                text={text}
                showKeyHint={!lowConfidence}
                onAccept={() => accept(text)}
                onDismiss={() => dismiss(text)}
              />
            ))}

            {/* Fetching more placeholder */}
            {fetchingMore && visibleCards.length < 3 && (
              <div style={{
                height: 42, borderRadius: 9,
                background: 'rgba(79,70,229,0.02)',
                border: '1px dashed rgba(79,70,229,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.28)', letterSpacing: '-0.01em' }}>
                  loading more…
                </div>
              </div>
            )}

            {/* Claude ran dry */}
            {!inferring && !fetchingMore && !hasMore && visibleCards.length === 0 && confirmed.length > 0 && (
              <div style={{
                fontSize: 11, color: 'rgba(0,0,0,0.3)', letterSpacing: '-0.01em',
                textAlign: 'center', padding: '2px 0',
              }}>
                That's all I know — add anything I missed below
              </div>
            )}

            {/* Free input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 11px',
              background: 'rgba(0,0,0,0.025)',
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: 9,
            }}>
              <input
                ref={freeInputRef}
                type="text"
                value={freeInput}
                onChange={e => setFreeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') acceptFree() }}
                placeholder={lowConfidence ? `Tell me about ${productName}…` : 'Add your own fact…'}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: 12, fontFamily: 'inherit', color: 'rgb(13,13,15)',
                  outline: 'none', letterSpacing: '-0.01em',
                }}
              />
              <button
                onClick={acceptFree}
                disabled={!freeInput.trim()}
                style={{
                  border: 'none', background: 'transparent',
                  cursor: freeInput.trim() ? 'pointer' : 'default', padding: 0,
                  color: freeInput.trim() ? '#4f46e5' : 'rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', transition: 'color 0.1s',
                }}
                aria-label="Add fact"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '9px 13px', fontSize: 12, fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7,
                  background: 'transparent', color: 'rgba(0,0,0,0.4)', cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                disabled={confirmed.length < MIN_FACTS}
                onClick={() => setStep(3)}
                style={{
                  flex: 1, padding: '9px', fontSize: 12, fontWeight: 500,
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                  border: 'none', borderRadius: 7,
                  background: confirmed.length >= MIN_FACTS ? '#4f46e5' : 'rgba(0,0,0,0.07)',
                  color: confirmed.length >= MIN_FACTS ? '#fff' : 'rgba(0,0,0,0.3)',
                  cursor: confirmed.length >= MIN_FACTS ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
              >
                {confirmed.length < MIN_FACTS
                  ? `${MIN_FACTS - confirmed.length} more to go`
                  : `Next — ${confirmed.length} facts →`
                }
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 ──────────────────────────────────────────────────────── */}
        {step === 3 && (
          <>
            {/* Primary action */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)', marginBottom: 4,
            }}>
              Primary action
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
              {PRIMARY_ACTIONS.filter(({ type }) => type === null || type === productType).map(({ value }) => (
                <button
                  key={value}
                  onClick={() => setPrimaryAction(value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 11px', fontSize: 12, fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                    border: '1px solid',
                    borderColor: primaryAction === value ? '#4f46e5' : 'rgba(0,0,0,0.11)',
                    borderRadius: 8,
                    background: primaryAction === value ? 'rgba(79,70,229,0.06)' : 'transparent',
                    color: primaryAction === value ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.5)',
                    cursor: 'pointer', fontWeight: primaryAction === value ? 500 : 400,
                    textAlign: 'left', transition: 'all 0.1s',
                  }}
                >
                  <div style={{
                    width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                    border: primaryAction === value ? '3.5px solid #4f46e5' : '1.5px solid rgba(0,0,0,0.22)',
                    transition: 'border 0.1s',
                  }} />
                  {value}
                </button>
              ))}
            </div>

            {/* Key message */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)', marginBottom: 4,
            }}>
              Key message
            </div>
            {editingMessage ? (
              <textarea
                autoFocus
                value={keyMessage}
                onChange={e => setKeyMessage(e.target.value)}
                onBlur={() => setEditingMessage(false)}
                rows={2}
                style={{
                  width: '100%', padding: '8px 11px',
                  fontSize: 12, fontFamily: 'inherit', letterSpacing: '-0.01em',
                  border: '1px solid #4f46e5', borderRadius: 8,
                  outline: 'none', boxShadow: '0 0 0 3px rgba(79,70,229,0.1)',
                  resize: 'none', color: 'rgb(13,13,15)', lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                onClick={() => setEditingMessage(true)}
                style={{
                  padding: '8px 11px', fontSize: 12, fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  border: '1px solid rgba(0,0,0,0.11)', borderRadius: 8,
                  color: keyMessage ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.28)',
                  lineHeight: 1.5, cursor: 'text',
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                {keyMessage || 'One sentence — the core promise…'}
                {keyMessage && <span style={{ marginLeft: 5, fontSize: 10, color: 'rgba(0,0,0,0.28)' }}>✎</span>}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '11px',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  letterSpacing: '-0.01em', borderRadius: 8, border: 'none',
                  background: isLoading ? 'rgba(0,0,0,0.07)' : '#4f46e5',
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
                  width: '100%', padding: '8px',
                  fontSize: 12, fontFamily: 'inherit', letterSpacing: '-0.01em',
                  border: '1px solid rgba(0,0,0,0.09)', borderRadius: 7,
                  background: 'transparent', color: 'rgba(0,0,0,0.38)', cursor: 'pointer',
                }}
              >
                ← Back to facts
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
