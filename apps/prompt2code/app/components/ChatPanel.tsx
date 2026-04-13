'use client'

import { useEffect, useRef, useState } from 'react'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatPanelProps = {
  productName: string
  sectionCount: number
  messages: ChatMessage[]
  isChatLoading: boolean
  isPublishing: boolean
  isPublished: boolean
  publishedSlug: string | null
  onSend: (message: string) => void
  onApprove: () => void
  onReset: () => void
}

export function ChatPanel({
  productName,
  sectionCount,
  messages,
  isChatLoading,
  isPublishing,
  isPublished,
  publishedSlug,
  onSend,
  onApprove,
  onReset,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isChatLoading])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isChatLoading) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const statusText = isPublished && publishedSlug
    ? `Published draft · /${publishedSlug}`
    : isPublishing
    ? 'Publishing…'
    : `${sectionCount} block${sectionCount !== 1 ? 's' : ''} · ready to review`

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#fafafa',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 14px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#111',
          letterSpacing: '-0.015em',
          marginBottom: 3,
          fontFamily: 'inherit',
        }}>
          {productName || 'Page'}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
          {statusText}
        </div>
      </div>

      {/* Chat thread */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.035)',
            borderRadius: 12,
            fontSize: 13,
            color: 'rgba(0,0,0,0.55)',
            lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, color: 'rgba(0,0,0,0.72)', fontSize: 13.5 }}>
              Your page is ready. What would you like to change?
            </p>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <li>Reorder sections (setup &amp; engage only)</li>
              <li>Change any headline, body text, or CTA</li>
              <li>Add or remove cards and carousel items</li>
              <li>Adjust layout — columns, emphasis, card size</li>
              <li>Refresh images from a different part of the DAM pool</li>
            </ul>
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'rgba(0,0,0,0.3)' }}>
              I can't invent new block types or move resolve sections. I'll say so if you ask.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: msg.role === 'user' ? 'rgba(0,0,0,0.32)' : 'rgba(30,90,200,0.55)',
              paddingLeft: 2,
            }}>
              {msg.role === 'user' ? 'You' : 'Editor'}
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.6,
              background: msg.role === 'user' ? 'rgba(0,0,0,0.05)' : 'rgba(30,90,220,0.07)',
              color: msg.role === 'user' ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0.7)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {isChatLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 2 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'rgba(30,90,220,0.35)',
                  animation: `chatPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.32)' }}>Editing page…</span>
            <style>{`
              @keyframes chatPulse {
                0%,80%,100%{opacity:.2;transform:scale(.8)}
                40%{opacity:1;transform:scale(1)}
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        padding: '10px 16px 8px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          background: 'rgba(0,0,0,0.045)',
          borderRadius: 11,
          padding: '8px 10px 8px 14px',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPublished ? 'Page has been published.' : 'Ask me to change anything…'}
            disabled={isPublished || isPublishing}
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              resize: 'none',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'rgba(0,0,0,0.8)',
              outline: 'none',
              fontFamily: 'inherit',
              minHeight: 22,
              maxHeight: 160,
              overflowY: 'auto',
              opacity: isPublished ? 0.4 : 1,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isChatLoading || isPublished}
            aria-label="Send"
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: 7,
              border: 'none',
              background: input.trim() && !isChatLoading && !isPublished
                ? '#111'
                : 'rgba(0,0,0,0.1)',
              color: input.trim() && !isChatLoading && !isPublished
                ? '#fff'
                : 'rgba(0,0,0,0.25)',
              cursor: input.trim() && !isChatLoading && !isPublished ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ margin: '5px 2px 0', fontSize: 10.5, color: 'rgba(0,0,0,0.28)', lineHeight: 1.3 }}>
          ↵ send · shift+↵ new line
        </p>
      </div>

      {/* Action buttons */}
      <div style={{
        padding: '10px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        flexShrink: 0,
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}>
        <button
          onClick={onApprove}
          disabled={isPublished || isPublishing}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 9,
            border: 'none',
            background: isPublished ? 'rgba(0,0,0,0.06)' : '#111',
            color: isPublished ? 'rgba(0,0,0,0.35)' : '#fff',
            fontSize: 13.5,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: isPublished || isPublishing ? 'default' : 'pointer',
            transition: 'background 0.15s',
            letterSpacing: '-0.01em',
          }}
        >
          {isPublished ? '✓ Published' : isPublishing ? 'Publishing…' : 'Approve & publish draft'}
        </button>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '9px 16px',
            borderRadius: 9,
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'transparent',
            color: 'rgba(0,0,0,0.5)',
            fontSize: 13,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Start over
        </button>
      </div>
    </div>
  )
}
