'use client'

import { useReducer, useCallback, useEffect, useState, useMemo } from 'react'
import { InputPanel } from './components/storytelling-inspiration/InputPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { BlockList } from './components/editor/BlockList'
import { briefToBlocks } from './lib/briefToBlocks'
import { reorderSections } from './lib/briefEditor'
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

  // ── Brief mutations (from direct editor) ─────────────────────────────────
  const handleBriefUpdate = useCallback((brief: PageBrief) => {
    dispatch({ type: 'UPDATE_BRIEF', brief })
  }, [])

  const handleReorder = useCallback((newOrder: string[]) => {
    if (!state.brief) return
    dispatch({ type: 'UPDATE_BRIEF', brief: reorderSections(state.brief, newOrder) })
  }, [state.brief])

  const sectionCount = state.brief?.sections?.length ?? 0
  const showInput = state.step === 'idle' || state.step === 'generating'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh', overflow: 'hidden' }}>

      {/* Left panel */}
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,0.07)', background: '#fafafa' }}>
        {showInput ? (

          /* Input form */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <InputPanel onSubmit={handleGenerate} isLoading={state.step === 'generating'} />
            {state.error && state.step === 'idle' && (
              <div style={{ margin: '0 20px 20px', padding: '12px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 12.5, color: 'rgb(185,28,28)', lineHeight: 1.5 }}>
                {state.error}
              </div>
            )}
          </div>

        ) : (

          /* Editor left panel */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', letterSpacing: '-0.015em', marginBottom: 2 }}>
                {state.input?.productName ?? 'Page'}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.38)' }}>
                {state.step === 'reviewing' && `${sectionCount} blocks · drag to reorder`}
                {state.step === 'publishing' && 'Publishing…'}
                {state.step === 'done' && state.publishedSlug && `Published · /${state.publishedSlug}`}
              </div>
            </div>

            {/* Block list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {state.brief && (
                <BlockList brief={state.brief} onReorder={handleReorder} />
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 16px 18px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
              <button
                onClick={handleApprove}
                disabled={state.step === 'done' || state.step === 'publishing'}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 9, border: 'none',
                  background: state.step === 'done' ? 'rgba(0,0,0,0.06)' : '#111',
                  color: state.step === 'done' ? 'rgba(0,0,0,0.35)' : '#fff',
                  fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                  cursor: state.step === 'done' || state.step === 'publishing' ? 'default' : 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                {state.step === 'done' ? '✓ Published' : state.step === 'publishing' ? 'Publishing…' : 'Approve & publish draft'}
              </button>
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                style={{
                  width: '100%', padding: '9px 16px', borderRadius: 9,
                  border: '1px solid rgba(0,0,0,0.1)', background: 'transparent',
                  color: 'rgba(0,0,0,0.5)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
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
  )
}
