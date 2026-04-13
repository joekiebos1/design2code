'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { ConversationStep } from '../page'

type PreviewPanelProps = {
  blocks: unknown[] | null
  step: ConversationStep
  sectionCount: number
}

type Viewport = '360' | '1440'

export function PreviewPanel({ blocks, step, sectionCount }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<Viewport>('1440')
  const [containerWidth, setContainerWidth] = useState(0)

  const showBlocks = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && blocks?.length

  // Measure container width for 1440 scaling
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Post blocks to iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'UPDATE_PREVIEW', blocks },
      '*'
    )
  }, [blocks])

  // Re-post when iframe reloads (e.g. viewport change re-renders it)
  const handleIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'UPDATE_PREVIEW', blocks },
      '*'
    )
  }, [blocks])

  const scale = viewport === '1440' && containerWidth > 0
    ? containerWidth / 1440
    : 1

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#ebebeb' }}>

      {/* Toolbar */}
      <div style={{
        flexShrink: 0,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.09)',
        background: '#f5f5f5',
        gap: 4,
        position: 'relative',
      }}>
        {/* Viewport toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}>
          {(['360', '1440'] as Viewport[]).map(v => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              style={{
                padding: '3px 10px',
                borderRadius: 6,
                border: 'none',
                background: viewport === v ? '#fff' : 'transparent',
                color: viewport === v ? '#111' : 'rgba(0,0,0,0.45)',
                fontSize: 12,
                fontWeight: viewport === v ? 600 : 400,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: viewport === v ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.12s',
                letterSpacing: '-0.01em',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Scale indicator for 1440 */}
        {viewport === '1440' && containerWidth > 0 && (
          <div style={{
            position: 'absolute',
            right: 12,
            fontSize: 10.5,
            color: 'rgba(0,0,0,0.32)',
            letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(scale * 100)}%
          </div>
        )}
      </div>

      {/* Preview area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: viewport === '360' ? 'center' : 'flex-start',
        }}
      >
        {/* Empty state */}
        {step === 'idle' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.3)',
            fontSize: 13,
            textAlign: 'center',
            padding: 40,
          }}>
            Your page preview will appear here
          </div>
        )}

        {/* Building state */}
        {step === 'generating' && !sectionCount && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            color: 'rgba(0,0,0,0.45)',
            fontSize: 13,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.3)',
                  animation: `previewPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            Building your page…
            <style>{`
              @keyframes previewPulse {
                0%,80%,100%{opacity:.2;transform:scale(.8)}
                40%{opacity:1;transform:scale(1)}
              }
            `}</style>
          </div>
        )}

        {/* 360 — centred phone-width iframe */}
        {showBlocks && viewport === '360' && (
          <div style={{
            width: 360,
            height: '100%',
            flexShrink: 0,
            background: '#fff',
            boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
          }}>
            <iframe
              ref={iframeRef}
              src="/preview"
              onLoad={handleIframeLoad}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* 1440 — full-width iframe scaled to fit */}
        {showBlocks && viewport === '1440' && containerWidth > 0 && (
          <div style={{
            // Outer: clipping box at visual size
            width: '100%',
            height: `${100 / scale}%`,
            overflow: 'hidden',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            flexShrink: 0,
          }}>
            <iframe
              ref={iframeRef}
              src="/preview"
              onLoad={handleIframeLoad}
              style={{
                width: 1440,
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#fff',
              }}
            />
          </div>
        )}

        {/* Hidden placeholder so ref is always mounted */}
        {!showBlocks && (
          <iframe
            ref={iframeRef}
            src="/preview"
            onLoad={handleIframeLoad}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  )
}
