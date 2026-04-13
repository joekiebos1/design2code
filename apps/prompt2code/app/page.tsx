'use client'

import { useReducer, useCallback, useEffect, useState, useMemo } from 'react'
import { InputPanel } from './components/storytelling-inspiration/InputPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { ChatPanel } from './components/ChatPanel'
import type { ChatMessage } from './components/ChatPanel'
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
      // Iterate result — keep current step, just swap the brief
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

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Reset chat when a new page is generated
  useEffect(() => {
    if (state.step === 'reviewing') setChatMessages([])
  }, [state.brief, state.step])

  const handleIterate = useCallback(async (message: string) => {
    if (!state.brief || isChatLoading) return

    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: state.brief,
          message,
          imageUrls: damMedia.urls,
        }),
      })

      const data = await res.json() as
        | { action: 'update'; brief: PageBrief; message: string }
        | { action: 'explain'; message: string }

      if (data.action === 'update' && data.brief) {
        dispatch({ type: 'UPDATE_BRIEF', brief: data.brief })
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message ?? (data.action === 'update' ? 'Done.' : 'I wasn\'t able to make that change.'),
      }])
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      }])
    } finally {
      setIsChatLoading(false)
    }
  }, [state.brief, damMedia.urls, isChatLoading])

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
    if (data.success) {
      dispatch({ type: 'SET_PUBLISHED', slug: data.slug })
    } else {
      dispatch({ type: 'SET_ERROR', error: data.error ?? 'Failed to publish' })
    }
  }, [state.brief])

  const sectionCount = state.brief?.sections?.length ?? 0
  const showInput = state.step === 'idle' || state.step === 'generating'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
        {showInput ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <InputPanel onSubmit={handleGenerate} isLoading={state.step === 'generating'} />
            {state.error && state.step === 'idle' && (
              <div style={{
                margin: '0 20px 20px',
                padding: '12px 14px',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8,
                fontSize: 12.5,
                color: 'rgb(185,28,28)',
                lineHeight: 1.5,
              }}>
                {state.error}
              </div>
            )}
          </div>
        ) : (
          <ChatPanel
            productName={state.input?.productName ?? 'Page'}
            sectionCount={sectionCount}
            messages={chatMessages}
            isChatLoading={isChatLoading}
            isPublishing={state.step === 'publishing'}
            isPublished={state.step === 'done'}
            publishedSlug={state.publishedSlug}
            onSend={handleIterate}
            onApprove={handleApprove}
            onReset={() => dispatch({ type: 'RESET' })}
          />
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
