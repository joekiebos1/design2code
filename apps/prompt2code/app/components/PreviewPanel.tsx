'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { EditablePreview } from './editor/EditablePreview'
import type { ConversationStep } from '../page'
import type { PageBrief } from '../lib/types'

type PreviewPanelProps = {
  blocks: unknown[] | null
  brief: PageBrief | null
  imageUrls: string[]
  videoUrls: string[]
  step: ConversationStep
  sectionCount: number
  onBriefUpdate: (brief: PageBrief) => void
}

type Viewport = '360' | '1440'
type PanelMode = 'edit' | 'preview'

export function PreviewPanel({ blocks, brief, imageUrls, videoUrls, step, sectionCount, onBriefUpdate }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<Viewport>('1440')
  const [mode, setMode] = useState<PanelMode>('edit')
  const [containerWidth, setContainerWidth] = useState(0)

  const isActive = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && !!blocks?.length
  const canEdit = (step === 'reviewing' || step === 'publishing' || step === 'done') && !!brief

  // Switch to edit mode when content first arrives
  useEffect(() => {
    if (canEdit) setMode('edit')
  }, [canEdit])

  // Measure container for 1440 scaling
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Keep iframe in sync
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_PREVIEW', blocks }, '*')
  }, [blocks])

  const handleIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_PREVIEW', blocks }, '*')
  }, [blocks])

  const scale = viewport === '1440' && containerWidth > 0 ? containerWidth / 1440 : 1

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
        gap: 8,
        position: 'relative',
      }}>

        {/* Edit / Preview toggle (only when content is ready) */}
        {canEdit && (
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.08)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            {(['edit', 'preview'] as PanelMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '3px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#111' : 'rgba(0,0,0,0.45)',
                  fontSize: 12,
                  fontWeight: mode === m ? 600 : 400,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.12s',
                  textTransform: 'capitalize',
                  letterSpacing: '-0.01em',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Viewport toggle */}
        <div style={{
          display: 'flex',
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

        {/* Scale readout */}
        {viewport === '1440' && containerWidth > 0 && (
          <div style={{
            position: 'absolute',
            right: 12,
            fontSize: 10.5,
            color: 'rgba(0,0,0,0.3)',
            letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(scale * 100)}%
          </div>
        )}
      </div>

      {/* Content area */}
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
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(0,0,0,0.3)', fontSize: 13, textAlign: 'center', padding: 40,
          }}>
            Your page preview will appear here
          </div>
        )}

        {/* Building indicator */}
        {step === 'generating' && !sectionCount && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 14, color: 'rgba(0,0,0,0.45)', fontSize: 13,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.3)',
                  animation: `pp 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            Building your page…
            <style>{`@keyframes pp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
          </div>
        )}

        {/* ── EDIT MODE — inline editable render ── */}
        {isActive && mode === 'edit' && canEdit && (
          <div style={{
            width: viewport === '360' ? 360 : '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#fff',
            boxShadow: viewport === '360' ? '0 2px 20px rgba(0,0,0,0.12)' : 'none',
            // Scale 1440 to fit
            ...(viewport === '1440' && containerWidth > 0 && scale < 1 ? {
              width: 1440,
              height: `${100 / scale}%`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              overflow: 'auto',
            } : {}),
          }}>
            <EditablePreview
              brief={brief}
              imageUrls={imageUrls}
              videoUrls={videoUrls}
              onBriefUpdate={onBriefUpdate}
            />
          </div>
        )}

        {/* ── PREVIEW MODE — iframe ── */}
        {isActive && (mode === 'preview' || !canEdit) && (
          <>
            {/* 360 centred */}
            {viewport === '360' && (
              <div style={{ width: 360, height: '100%', background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.12)' }}>
                <iframe
                  ref={iframeRef}
                  src="/preview"
                  onLoad={handleIframeLoad}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              </div>
            )}
            {/* 1440 scaled */}
            {viewport === '1440' && containerWidth > 0 && (
              <div style={{
                width: '100%',
                height: `${100 / scale}%`,
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <iframe
                  ref={iframeRef}
                  src="/preview"
                  onLoad={handleIframeLoad}
                  style={{ width: 1440, height: '100%', border: 'none', display: 'block', background: '#fff' }}
                />
              </div>
            )}
          </>
        )}

        {/* Hidden iframe when in edit mode (still mounted to keep state) */}
        {isActive && mode === 'edit' && (
          <iframe
            ref={mode === 'edit' ? iframeRef : undefined}
            src="/preview"
            onLoad={handleIframeLoad}
            style={{ display: 'none' }}
          />
        )}

        {/* Iframe placeholder when no content */}
        {!isActive && (
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
