'use client'

import { useReducer, useCallback, useEffect, useState, useMemo } from 'react'
import { SurfaceProvider, Button } from '@marcelinodzn/ds-react'
import { InputPanel } from './components/storytelling-inspiration/InputPanel'
import { PreviewPanel } from './components/PreviewPanel'
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
      .then((r) => r.json())
      .then((data: DamMedia) => {
        if (data.urls?.length) setDamMedia(data)
      })
      .catch(() => {})
  }, [])

  const blocks = useMemo(
    () => state.brief ? briefToBlocks(state.brief, damMedia.urls, damMedia.videoUrls) : null,
    [state.brief, damMedia],
  )

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

            if (event.type === 'section') {
              dispatch({ type: 'ADD_SECTION', section: event.section })
            } else if (event.type === 'complete') {
              completeBriefReceived = true
              dispatch({ type: 'SET_BRIEF', brief: event.brief })
            } else if (event.type === 'error') {
              dispatch({ type: 'SET_ERROR', error: event.error })
            }
          } catch {
            // malformed SSE chunk — ignore
          }
        }
      }

      if (!completeBriefReceived) {
        dispatch({ type: 'SET_ERROR', error: 'Generation ended without a complete page brief' })
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }, [])

  const handleApprove = useCallback(async () => {
    if (!state.brief) return
    dispatch({ type: 'SET_STEP', step: 'publishing' })
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.brief),
    })
    const data = await res.json()
    if (data.success) {
      dispatch({ type: 'SET_PUBLISHED', slug: data.slug })
    } else {
      dispatch({ type: 'SET_ERROR', error: data.error ?? 'Failed to publish' })
    }
  }, [state.brief])

  const sectionCount = state.brief?.sections?.length ?? 0
  const showInput = state.step === 'idle' || state.step === 'generating'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        {showInput ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InputPanel onSubmit={handleGenerate} isLoading={state.step === 'generating'} />
            {state.error && state.step === 'idle' && (
              <div style={{ margin: '0 var(--ds-spacing-2xl) var(--ds-spacing-2xl)', padding: 'var(--ds-spacing-m)', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4, fontSize: 13, color: 'rgb(185,28,28)', lineHeight: 1.5 }}>
                {state.error}
              </div>
            )}
          </div>
        ) : (
          <SurfaceProvider level={0}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'var(--ds-spacing-2xl)', gap: 'var(--ds-spacing-l)' }}>
              <div style={{ fontSize: 'var(--ds-typography-headline-m)', fontWeight: 'var(--ds-typography-weight-medium)', color: 'var(--ds-color-text-high)', letterSpacing: '-0.02em' }}>
                {state.input?.productName ?? 'Page'}
              </div>
              <div style={{ fontSize: 'var(--ds-typography-body-xs)', color: 'rgba(0,0,0,0.48)', lineHeight: 1.5 }}>
                {state.step === 'reviewing' && `${sectionCount} blocks ready`}
                {state.step === 'publishing' && 'Publishing to Sanity…'}
                {state.step === 'done' && state.publishedSlug && `Published as draft: /${state.publishedSlug}`}
              </div>
              <div style={{ flex: 1 }} />
              {(state.step === 'reviewing' || state.step === 'done') && (
                <Button
                  onPress={handleApprove}
                  isDisabled={state.step === 'done'}
                  appearance="neutral"
                  size="M"
                  attention="high"
                >
                  {state.step === 'done' ? 'Published' : 'Approve & publish draft'}
                </Button>
              )}
              <Button
                onPress={() => dispatch({ type: 'RESET' })}
                appearance="neutral"
                size="M"
                attention="low"
              >
                Start over
              </Button>
            </div>
          </SurfaceProvider>
        )}
      </div>

      {/* Right panel */}
      <PreviewPanel
        blocks={blocks}
        step={state.step}
        sectionCount={sectionCount}
      />
    </div>
  )
}
