'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { StoryCoachInput } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3
type PageType = 'product-page' | 'jiostories-page' | 'other'

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

const PAGE_TYPE_OPTIONS: { value: PageType; label: string }[] = [
  { value: 'product-page',    label: 'Product page' },
  { value: 'jiostories-page', label: 'JioStories page' },
  { value: 'other',           label: 'Other type' },
]

const PRODUCT_TYPE_OPTIONS = [
  { value: 'software', label: 'App / Software' },
  { value: 'hardware', label: 'Hardware' },
]

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  'product-page':    'Product page',
  'jiostories-page': 'JioStories page',
  'other':           'Other',
}

const MIN_FACTS = 3

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-900 outline-none ' +
  'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-gray-400'

const selectCls = inputCls + ' appearance-none pr-8 cursor-pointer'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-gray-500 mb-1">{children}</p>
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={selectCls}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <ChevronDown />
      </div>
    </div>
  )
}

// ─── Suggestion card ──────────────────────────────────────────────────────────

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
      className="flex items-center gap-2.5 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors select-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.16s, transform 0.16s, background-color 0.1s',
      }}
    >
      <div className="shrink-0 w-[22px] h-[22px] rounded-[6px] bg-primary text-white text-[11px] font-bold flex items-center justify-center">
        {showKeyHint ? index + 1 : (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="flex-1 text-xs text-gray-800 leading-snug">{text}</span>
      <button
        onClick={e => { e.stopPropagation(); onDismiss() }}
        className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Dismiss"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [pageType, setPageType]       = useState<PageType>('product-page')
  const [productType, setProductType] = useState<'software' | 'hardware'>('software')
  const [pageDescription, setPageDescription] = useState('')

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
  const [primaryAction, setPrimaryAction]   = useState('Download the app')
  const [keyMessage, setKeyMessage]         = useState('')
  const [editingMessage, setEditingMessage] = useState(false)

  const freeInputRef = useRef<HTMLInputElement>(null)
  const briefEndRef  = useRef<HTMLDivElement>(null)

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
      outputType: pageType,
      productType,
      productName,
      facts: confirmed,
      keyMessage,
      primaryAction,
      pageTypeDescription: pageType === 'other' ? pageDescription : undefined,
      whatItDoes: confirmed.join('\n'),
      whatIsInIt: '',
      builtFor: '',
    })
  }

  // ── Step 1 validation ───────────────────────────────────────────────────────

  const step1Valid =
    productName.trim().length > 0 &&
    (pageType !== 'other' || pageDescription.trim().length > 0)

  const hasBriefContent = step > 1 && productName

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-6 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2 leading-tight">
          Prompt2Code
        </h1>
        <p className="text-[13px] text-gray-400 leading-relaxed">
          Turn a product brief into a full Jio page.<br />
          Tell us what you know — we handle the rest.
        </p>
      </div>

      {/* ── Brief label + divider ───────────────────────────────────────────── */}
      <div className="shrink-0 px-5">
        <div className="border-t border-gray-100 pt-3.5 pb-1">
          <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-gray-400">
            Brief
          </p>
        </div>
      </div>

      {/* ── Brief content — scrollable ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5">
        {!hasBriefContent ? (
          <p className="text-[12px] text-gray-300 italic py-2">Your brief will appear here</p>
        ) : (
          <>
            {/* Product / page identity */}
            <div className={`flex items-baseline gap-2 py-2 ${confirmed.length > 0 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-[13px] font-semibold text-gray-900 tracking-tight">
                {productName}
              </span>
              <span className="text-[11px] text-gray-400">
                {PAGE_TYPE_LABELS[pageType]}
                {pageType === 'product-page' && ` · ${productType === 'software' ? 'App / Software' : 'Hardware'}`}
              </span>
            </div>

            {/* Confirmed facts */}
            {confirmed.map((fact, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50">
                <div className="shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#3800AD"
                    strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="flex-1 text-[12px] text-gray-500 leading-snug">{fact}</span>
                <button
                  onClick={() => setConfirmed(prev => prev.filter((_, j) => j !== i))}
                  className="text-[10px] text-gray-300 hover:text-red-400 transition-colors px-1"
                >✕</button>
              </div>
            ))}

            {/* Key message preview in step 3 */}
            {step === 3 && keyMessage && (
              <div className={`py-2 ${confirmed.length > 0 ? 'border-t border-gray-100 mt-1' : ''}`}>
                <p className="text-[11px] text-gray-400 mb-1">Key message</p>
                <p className="text-[12px] text-gray-500 leading-snug italic">"{keyMessage}"</p>
              </div>
            )}
          </>
        )}
        <div ref={briefEndRef} />
      </div>

      {/* ── Interaction area — always at bottom ───────────────────────────── */}
      <div className="shrink-0 border-t border-gray-100 px-5 pt-4 pb-5 flex flex-col gap-3">

        {/* ── Step 1 ────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <FieldLabel>What is this page for?</FieldLabel>
              <input
                autoFocus
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && step1Valid) setStep(2) }}
                placeholder="e.g. JioSaavn, JioPhone 5G…"
                className={inputCls}
              />
            </div>

            <div>
              <FieldLabel>Page type</FieldLabel>
              <SelectField
                value={pageType}
                onChange={v => setPageType(v as PageType)}
                options={PAGE_TYPE_OPTIONS}
              />
            </div>

            {/* Conditional sub-question */}
            {pageType === 'product-page' && (
              <div>
                <FieldLabel>Product type</FieldLabel>
                <SelectField
                  value={productType}
                  onChange={v => setProductType(v as 'software' | 'hardware')}
                  options={PRODUCT_TYPE_OPTIONS}
                />
              </div>
            )}

            {pageType === 'other' && (
              <div>
                <FieldLabel>Describe what type of page you wish to create</FieldLabel>
                <textarea
                  rows={2}
                  value={pageDescription}
                  onChange={e => setPageDescription(e.target.value)}
                  placeholder="e.g. A landing page for a Jio event in Mumbai…"
                  className={inputCls + ' resize-none'}
                />
              </div>
            )}

            <button
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="w-full py-2.5 text-sm font-medium rounded-md bg-primary text-white transition-colors hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
            >
              Next →
            </button>
          </>
        )}

        {/* ── Step 2 ────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            {inferring && (
              <p className="text-[12px] text-gray-400 text-center py-1.5">
                Looking up {productName}…
              </p>
            )}

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

            {fetchingMore && visibleCards.length < 3 && (
              <div className="h-10 rounded-lg border border-dashed border-primary/10 bg-primary/[0.02] flex items-center justify-center">
                <span className="text-[11px] text-gray-300">loading more…</span>
              </div>
            )}

            {!inferring && !fetchingMore && !hasMore && visibleCards.length === 0 && confirmed.length > 0 && (
              <p className="text-[11px] text-gray-400 text-center">
                That's all I know — add anything I missed below
              </p>
            )}

            {/* Free input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <input
                ref={freeInputRef}
                type="text"
                value={freeInput}
                onChange={e => setFreeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') acceptFree() }}
                placeholder={lowConfidence ? `Tell me about ${productName}…` : 'Add your own fact…'}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={acceptFree}
                disabled={!freeInput.trim()}
                className="shrink-0 text-primary disabled:text-gray-300 transition-colors"
                aria-label="Add fact"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                disabled={confirmed.length < MIN_FACTS}
                onClick={() => setStep(3)}
                className="flex-1 py-2 text-sm font-medium rounded-md bg-primary text-white transition-colors hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
              >
                {confirmed.length < MIN_FACTS
                  ? `${MIN_FACTS - confirmed.length} more to go`
                  : `Next — ${confirmed.length} facts →`}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 ────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div>
              <FieldLabel>Primary action</FieldLabel>
              <div className="flex flex-col gap-1.5">
                {PRIMARY_ACTIONS.filter(({ type }) => type === null || type === productType).map(({ value }) => (
                  <button
                    key={value}
                    onClick={() => setPrimaryAction(value)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2 text-sm border rounded-md text-left transition-colors',
                      primaryAction === value
                        ? 'border-primary bg-primary/5 text-gray-900 font-medium'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className={[
                      'shrink-0 w-3 h-3 rounded-full border-2 transition-colors',
                      primaryAction === value ? 'border-primary' : 'border-gray-300',
                    ].join(' ')} />
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Key message</FieldLabel>
              {editingMessage ? (
                <textarea
                  autoFocus
                  value={keyMessage}
                  onChange={e => setKeyMessage(e.target.value)}
                  onBlur={() => setEditingMessage(false)}
                  rows={2}
                  className={inputCls + ' resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary'}
                />
              ) : (
                <div
                  onClick={() => setEditingMessage(true)}
                  className={[
                    'w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 cursor-text leading-relaxed',
                    keyMessage ? 'text-gray-900' : 'text-gray-400 italic',
                  ].join(' ')}
                >
                  {keyMessage || 'One sentence — the core promise…'}
                  {keyMessage && <span className="ml-1.5 text-[10px] text-gray-400">✎</span>}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-2.5 text-sm font-semibold rounded-md bg-primary text-white transition-colors hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
              >
                {isLoading ? 'Generating…' : 'Generate page'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2 text-sm border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
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
