'use client'

import { useRef, useEffect, useState } from 'react'
import type { PageBuilderState, ConversationStep } from '../page'
import type { PageBrief } from '../lib/types'

const STEP_LABELS: Record<ConversationStep, string> = {
  idle: '',
  clarifying: 'Clarifying...',
  structuring: 'Building structure...',
  reviewing: 'Ready to review',
  publishing: 'Publishing...',
  done: 'Published',
}

type ChatPanelProps = {
  state: PageBuilderState
  onSendMessage: (message: string) => Promise<void>
  onApprove: () => Promise<void>
  onReset: () => void
}

export function ChatPanel({ state, onSendMessage, onApprove, onReset }: ChatPanelProps) {
  const { step, messages, brief } = state
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    await onSendMessage(text)
    setLoading(false)
  }

  const isInputDisabled = loading || step === 'structuring' || step === 'publishing' || step === 'done'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      borderRight: '1px solid var(--ds-color-stroke-divider)',
      background: 'var(--ds-color-background-minimal)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--ds-color-stroke-divider)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Prompt2Code</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STEP_LABELS[step] && (
            <span style={{ fontSize: 12, color: 'var(--ds-color-text-low)', opacity: 0.7 }}>
              {STEP_LABELS[step]}
            </span>
          )}
          {step !== 'idle' && (
            <button onClick={onReset} style={ghostButtonStyle}>Start over</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--ds-color-text-low)', fontSize: 14, lineHeight: 1.6 }}>
            Describe the page you want to build. Tell me the product, audience, and what you want people to do.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: msg.role === 'user' ? 'var(--ds-color-surface-bold)' : 'white',
            color: msg.role === 'user' ? 'white' : 'var(--ds-color-text-high)',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            whiteSpace: 'pre-wrap',
          }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--ds-color-text-low)', fontSize: 13, padding: '4px 0' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Actions */}
      {step === 'reviewing' && brief && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ds-color-stroke-divider)', display: 'flex', gap: 8 }}>
          <button onClick={onApprove} style={primaryButtonStyle}>
            Approve & publish draft
          </button>
        </div>
      )}

      {step === 'done' && state.publishedSlug && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ds-color-stroke-divider)', fontSize: 13, color: 'var(--ds-color-text-medium)' }}>
          Draft created at <code>/{state.publishedSlug}</code> in Sanity Studio.
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--ds-color-stroke-divider)', display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={step === 'done' ? 'Page published.' : 'Describe your page or request changes...'}
          disabled={isInputDisabled}
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--ds-color-stroke-divider)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'white',
            outline: 'none',
            opacity: isInputDisabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={isInputDisabled || !input.trim()}
          style={{
            ...primaryButtonStyle,
            opacity: isInputDisabled || !input.trim() ? 0.4 : 1,
            cursor: isInputDisabled || !input.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  background: 'var(--ds-color-surface-bold)',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const ghostButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--ds-color-stroke-divider)',
  borderRadius: 8,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
  color: 'var(--ds-color-text-low)',
}
