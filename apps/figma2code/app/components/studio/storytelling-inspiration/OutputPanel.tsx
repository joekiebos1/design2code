'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { StoryCoachState, StoryCoachResult, Block } from './types'

const LOADING_MESSAGES = [
  'Reading the brief...',
  'Finding the central truth...',
  'Building the arc...',
  'Placing the blocks...',
  'Checking every claim has its proof...',
]

type OutputPanelProps = {
  state: StoryCoachState
  productName?: string
}

function CopyButton({ text, ariaLabel = 'Copy' }: { text: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-none"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: copied ? 0.5 : 1 }}>
        <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </button>
  )
}

function ModalityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border border-gray-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-500 leading-relaxed m-0">{value}</p>
      </div>
      <CopyButton text={value} ariaLabel={`Copy ${label}`} />
    </div>
  )
}

function NarrativeParagraph({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </span>
        <p className="text-sm text-gray-500 leading-relaxed m-0">{text}</p>
      </div>
      <CopyButton text={text} ariaLabel={`Copy ${label}`} />
    </div>
  )
}

const BLOCK_NAMES: Record<string, string> = {
  hero: 'Hero',
  proofPoints: 'Proof Points',
  mediaTextStacked: 'Media + Text: Stacked',
  mediaTextBlock: 'Media + Text: Stacked',
  mediaText5050: 'Media + Text: 50/50',
  carousel: 'Carousel',
  cardGrid: 'Card Grid',
  iconGrid: 'Icon Grid',
  mediaTextAsymmetric: 'Media + Text Asymmetric',
  editorial: 'Editorial',
  fullBleedVerticalCarousel: 'Full Bleed Carousel',
  rotatingMedia: 'Rotating Media',
  topNav: 'Top Nav',
}

function getBlockName(type: string): string {
  return BLOCK_NAMES[type] ?? type
}

function BlockRow({ block }: { block: Block }) {
  const blockText = `${block.num}. [${block.type}] ${block.section} (${block.role})\n${block.headline}${block.proof ? `\n${block.proof}` : ''}\n${block.job}`
  const isChapter = block.role === 'chapter'

  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-gray-200 ${
        isChapter ? 'p-4 mb-3 bg-gray-50 rounded-lg' : 'py-3'
      }`}
    >
      <div className="flex-1 min-w-0 flex gap-3">
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-sm font-medium text-gray-500">{block.num}</span>
          <span className={`text-xs font-medium uppercase tracking-wider ${isChapter ? 'text-gray-900' : 'text-gray-500'}`}>
            {block.role}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1 block">{getBlockName(block.type)}</span>
          <p className={`m-0 mb-0.5 ${isChapter ? 'text-sm font-bold text-gray-900' : 'text-sm font-medium text-gray-900'}`}>
            {block.headline}
          </p>
          {block.proof && (
            <p className="m-0 mb-0.5 text-sm text-gray-600 italic leading-snug">{block.proof}</p>
          )}
          <p className="m-0 text-sm text-gray-500 leading-snug">{block.job}</p>
        </div>
      </div>
      <CopyButton text={blockText} ariaLabel={`Copy block ${block.num}`} />
    </div>
  )
}

function formatBlockStructureAsText(blocks: Block[]): string {
  return blocks
    .map(
      (b) =>
        `${b.num}. [${b.type}] ${b.section} (${b.role})\n   ${b.headline}${b.proof ? `\n   ${b.proof}` : ''}\n   ${b.job}`,
    )
    .join('\n\n')
}

function ResultView({ result, productName }: { result: StoryCoachResult; productName?: string }) {
  const setup = result.blocks.filter((b) => b.section === 'setup')
  const engage = result.blocks.filter((b) => b.section === 'engage')
  const resolve = result.blocks.filter((b) => b.section === 'resolve')
  const fullBlockText = formatBlockStructureAsText(result.blocks)
  const blockStructureRef = useRef<HTMLDivElement>(null)
  const [copyingPng, setCopyingPng] = useState(false)

  const handleCopyAsPng = useCallback(async () => {
    const el = blockStructureRef.current
    if (!el) return
    setCopyingPng(true)
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      await new Promise<void>((resolve) => {
        canvas.toBlob(
          async (blob) => {
            try {
              if (blob && navigator.clipboard?.write) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
              }
            } finally {
              resolve()
            }
          },
          'image/png',
        )
      })
    } catch {
      // ignore
    } finally {
      setCopyingPng(false)
    }
  }, [])

  return (
    <div className="flex flex-col gap-12">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {productName || result.primaryEmotion}
        </h1>
        <p className="text-sm text-gray-500">
          {result.blocks.length} blocks — {setup.length} setup · {engage.length} engage · {resolve.length} resolve
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Buyer modalities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalityRow label="Emotional" value={result.modalities.emotional} />
          <ModalityRow label="Rational" value={result.modalities.rational} />
          <ModalityRow label="Social" value={result.modalities.social} />
          <ModalityRow label="Security" value={result.modalities.security} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Narrative arc</h2>
        <div className="flex flex-col gap-6 py-3">
          <NarrativeParagraph label="Setup" text={`${result.hook.openingTension} ${result.hook.mustFeel}`} />
          <NarrativeParagraph label="Engage" text={`${result.middle.centralDesire} ${result.middle.emotional} ${result.middle.rational} ${result.middle.social} ${result.middle.security}`} />
          <NarrativeParagraph label="Resolve" text={`${result.close.barrier} ${result.close.ctaFraming}`} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-gray-900 m-0">Block structure</h2>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleCopyAsPng}
              disabled={copyingPng}
              aria-label="Copy as PNG"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer bg-transparent border-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                <circle cx="5.5" cy="7.5" r="1.25" stroke="currentColor" strokeWidth="1" />
                <path d="M2 11l3-2.5L7.5 11l3-4L14 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={async () => {
                try { await navigator.clipboard.writeText(fullBlockText) } catch { /* ignore */ }
              }}
              aria-label="Copy as text"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={blockStructureRef} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col">
            {result.blocks.map((block) => (
              <BlockRow key={block.num} block={block} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function OutputPanel({ state, productName }: OutputPanelProps) {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  useEffect(() => {
    if (state.status !== 'loading') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[i])
    }, 1800)
    return () => clearInterval(interval)
  }, [state.status])

  if (state.status === 'idle') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">Enter a product name and generate to see the narrative arc.</p>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">{loadingMessage}</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="p-8">
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      </div>
    )
  }

  if (state.status === 'success' && state.result) {
    return (
      <div className="p-8 max-w-3xl">
        <ResultView result={state.result} productName={productName} />
      </div>
    )
  }

  return null
}
