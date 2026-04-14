'use client'

import { useReducer, useCallback, useEffect, useState, useMemo } from 'react'
import { InputPanel } from './components/storytelling-inspiration/InputPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { Header } from './components/Header'
import { briefToBlocks } from './lib/briefToBlocks'
import type { PageBrief, Section } from './lib/types'
import type { StoryCoachInput } from './components/storytelling-inspiration/types'

export type ConversationStep = 'idle' | 'generating' | 'reviewing' | 'publishing' | 'done'

type DamMedia = { urls: string[]; videoUrls: string[] }

export type PageBuilderState = {
  step: ConversationStep
  input: StoryCoachInput | null
  brief: PageBrief | null
  publishedSlug: string | null
  error: string | null
}

type Action =
  | { type: 'START_GENERATING'; input: StoryCoachInput }
  | { type: 'ADD_SECTION'; section: Section }
  | { type: 'SET_BRIEF'; brief: PageBrief }
  | { type: 'UPDATE_BRIEF'; brief: PageBrief }
  | { type: 'SET_STEP'; step: ConversationStep }
  | { type: 'SET_PUBLISHED'; slug: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' }

const initialState: PageBuilderState = {
  step: 'idle',
  input: null,
  brief: null,
  publishedSlug: null,
  error: null,
}

function reducer(state: PageBuilderState, action: Action): PageBuilderState {
  switch (action.type) {
    case 'START_GENERATING':
      return { ...initialState, step: 'generating', input: action.input }
    case 'ADD_SECTION': {
      const existing = state.brief ?? {
        meta: {} as PageBrief['meta'],
        ia: {} as PageBrief['ia'],
        sections: [],
        launchChecklist: [],
        status: 'draft' as const,
        createdAt: '',
        version: 1,
      }
      return {
        ...state,
        brief: { ...existing, sections: [...existing.sections, action.section] },
      }
    }
    case 'SET_BRIEF':
      return { ...state, brief: action.brief, step: 'reviewing' }
    case 'UPDATE_BRIEF':
      return { ...state, brief: action.brief }
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_PUBLISHED':
      return { ...state, step: 'done', publishedSlug: action.slug }
    case 'SET_ERROR':
      return { ...state, error: action.error, step: 'idle' }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const HOW_TO_EDIT = [
  { icon: '✏️', text: 'Click any text to edit it inline' },
  { icon: '◻', text: 'Click an image to swap it from DAM' },
  { icon: '⠿', text: 'Click any block to move, restyle, or change variant' },
  { icon: '+', text: 'Use Add in the panel to add items to a collection' },
]

export default function Prompt2CodePage() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const [damMedia, setDamMedia] = useState<DamMedia>({ urls: [], videoUrls: [] })
  useEffect(() => {
    fetch('/api/dam-images')
      .then(r => r.json())
      .then((data: DamMedia) => { if (data.urls?.length) setDamMedia(data) })
      .catch(() => {})
  }, [])

  const blocks = useMemo(
    () => state.brief ? briefToBlocks(state.brief, damMedia.urls, damMedia.videoUrls) : null,
    [state.brief, damMedia],
  )

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async (input: StoryCoachInput) => {
    dispatch({ type: 'START_GENERATING', input })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok || !res.body) {
        dispatch({ type: 'SET_ERROR', error: `Generate failed: ${res.status}` })
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completeBriefReceived = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? ''
        for (const chunk of chunks) {
          const match = chunk.match(/^data: (.+)$/m)
          if (!match) continue
          try {
            const event = JSON.parse(match[1]) as
              | { type: 'section'; section: Section }
              | { type: 'complete'; brief: PageBrief }
              | { type: 'error'; error: string }
            if (event.type === 'section') dispatch({ type: 'ADD_SECTION', section: event.section })
            else if (event.type === 'complete') { completeBriefReceived = true; dispatch({ type: 'SET_BRIEF', brief: event.brief }) }
            else if (event.type === 'error') dispatch({ type: 'SET_ERROR', error: event.error })
          } catch { /* malformed chunk */ }
        }
      }
      if (!completeBriefReceived) dispatch({ type: 'SET_ERROR', error: 'Generation ended without a complete page brief' })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }, [])

  // ── Publish ───────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async () => {
    if (!state.brief) return
    dispatch({ type: 'SET_STEP', step: 'publishing' })
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.brief),
    })
    const data = await res.json()
    if (data.success) dispatch({ type: 'SET_PUBLISHED', slug: data.slug })
    else dispatch({ type: 'SET_ERROR', error: data.error ?? 'Failed to publish' })
  }, [state.brief])

  // ── Brief mutations ───────────────────────────────────────────────────────
  const handleBriefUpdate = useCallback((brief: PageBrief) => {
    dispatch({ type: 'UPDATE_BRIEF', brief })
  }, [])

  const sectionCount = state.brief?.sections?.length ?? 0
  const showInput = state.step === 'idle' || state.step === 'generating'

  const statusText =
    state.step === 'reviewing'  ? `${sectionCount} blocks · click to edit` :
    state.step === 'publishing' ? 'Publishing…' :
    state.step === 'done' && state.publishedSlug ? `Published · /${state.publishedSlug}` :
    state.step === 'done' ? 'Published' : ''

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="font-sans h-screen flex flex-col overflow-hidden bg-white">
      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left panel — 320px ──────────────────────────────────────────── */}
        <div className="shrink-0 w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden">

          {showInput ? (
            /* Input form */
            <>
              <div className="flex-1 min-h-0 overflow-y-auto studio-scrollbar">
                <InputPanel onSubmit={handleGenerate} isLoading={state.step === 'generating'} />
              </div>
              {state.error && state.step === 'idle' && (
                <div className="mx-5 mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-md text-xs text-red-700 leading-relaxed">
                  {state.error}
                </div>
              )}
            </>
          ) : (

            /* Editor left panel */
            <div className="flex flex-col h-full">

              {/* Page identity */}
              <div className="px-5 py-4 border-b border-gray-200 shrink-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {state.input?.productName ?? 'Page'}
                </p>
                {statusText && (
                  <p className="text-xs text-gray-500 mt-0.5">{statusText}</p>
                )}
              </div>

              {/* How to edit */}
              <div className="flex-1 overflow-y-auto studio-scrollbar">
                <p className="px-5 pt-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  How to edit
                </p>
                {HOW_TO_EDIT.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-2.5 border-b border-gray-100">
                    <span className="shrink-0 text-[11px] text-gray-400 w-4 mt-px leading-none">
                      {item.icon}
                    </span>
                    <span className="text-xs text-gray-500 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-gray-200 flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleApprove}
                  disabled={state.step === 'done' || state.step === 'publishing'}
                  className="w-full px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {state.step === 'done'
                    ? '✓ Published'
                    : state.step === 'publishing'
                    ? 'Publishing…'
                    : 'Approve & publish draft'}
                </button>
                <button
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="w-full px-4 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <PreviewPanel
          blocks={blocks}
          brief={state.brief}
          imageUrls={damMedia.urls}
          videoUrls={damMedia.videoUrls}
          step={state.step}
          sectionCount={sectionCount}
          onBriefUpdate={handleBriefUpdate}
        />
      </div>
    </div>
  )
}
