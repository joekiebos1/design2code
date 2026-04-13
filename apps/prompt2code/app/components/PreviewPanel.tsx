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

const PAD = 24 // horizontal padding around the page card

export function PreviewPanel({ blocks, brief, imageUrls, videoUrls, step, sectionCount, onBriefUpdate }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<Viewport>('1440')
  const [mode, setMode] = useState<PanelMode>('edit')
  const [containerWidth, setContainerWidth] = useState(0)
  const [iframeHeight, setIframeHeight] = useState(2000)

  const isActive = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && !!blocks?.length
  const canEdit = (step === 'reviewing' || step === 'publishing' || step === 'done') && !!brief

  // Switch to edit when content first arrives
  useEffect(() => { if (canEdit) setMode('edit') }, [canEdit])

  // Measure container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(e => setContainerWidth(e[0]?.contentRect.width ?? 0))
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Listen for iframe height reports
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_HEIGHT' && typeof e.data.height === 'number') {
        setIframeHeight(Math.max(600, e.data.height + 40))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Push blocks to iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_PREVIEW', blocks }, '*')
  }, [blocks])

  const handleIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_PREVIEW', blocks }, '*')
  }, [blocks])

  const cardWidth = viewport === '360' ? 360 : Math.max(320, containerWidth - PAD * 2)
  const scale = viewport === '1440' ? cardWidth / 1440 : 1

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        background: '#f2f2f2',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'rgba(242,242,242,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        flexShrink: 0,
      }}>

        {/* Edit / Preview */}
        {canEdit && (
          <Toggle
            options={[
              { value: 'edit', label: 'Edit' },
              { value: 'preview', label: 'Preview' },
            ]}
            value={mode}
            onChange={v => setMode(v as PanelMode)}
          />
        )}

        {/* 360 / 1440 */}
        <Toggle
          options={[
            { value: '360', label: '360' },
            { value: '1440', label: '1440' },
          ]}
          value={viewport}
          onChange={v => setViewport(v as Viewport)}
        />

        {/* Scale readout */}
        {viewport === '1440' && scale < 1 && (
          <div style={{
            position: 'absolute', right: 12,
            fontSize: 10.5, color: 'rgba(0,0,0,0.3)',
            letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(scale * 100)}%
          </div>
        )}
      </div>

      {/* Page area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: viewport === '360' ? 'center' : 'flex-start',
          padding: `20px ${PAD}px 80px`,
        }}
      >

        {/* Empty / building states */}
        {step === 'idle' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'rgba(0,0,0,0.3)', fontSize: 13 }}>
            Your page preview will appear here
          </div>
        )}

        {step === 'generating' && !sectionCount && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 14, color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>
            <Dots />
            Building your page…
          </div>
        )}

        {/* Page card */}
        {isActive && (
          <div style={{
            width: viewport === '360' ? 360 : '100%',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 8px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>

            {/* ── EDIT mode — inline render ── */}
            {mode === 'edit' && canEdit && (
              <EditablePreview
                brief={brief}
                imageUrls={imageUrls}
                videoUrls={videoUrls}
                onBriefUpdate={onBriefUpdate}
              />
            )}

            {/* ── PREVIEW mode — iframe ── */}
            {(mode === 'preview' || !canEdit) && (
              <div style={{
                width: viewport === '360' ? 360 : cardWidth,
                overflow: 'hidden',
                // Scale 1440 content down to fit card
                ...(viewport === '1440' && scale < 1 ? {
                  height: iframeHeight * scale,
                } : {}),
              }}>
                <div style={{
                  width: viewport === '1440' ? 1440 : '100%',
                  ...(viewport === '1440' && scale < 1 ? {
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                  } : {}),
                }}>
                  <iframe
                    ref={iframeRef}
                    src="/preview"
                    onLoad={handleIframeLoad}
                    style={{
                      width: viewport === '1440' ? 1440 : '100%',
                      height: iframeHeight,
                      border: 'none',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden iframe when in edit mode (keep alive for instant Preview switch) */}
        {isActive && mode === 'edit' && (
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

// ─── Small shared UI pieces ───────────────────────────────────────────────

function Toggle({ options, value, onChange }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(0,0,0,0.08)',
      borderRadius: 8,
      padding: 3,
      gap: 2,
    }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '3px 11px',
            borderRadius: 6,
            border: 'none',
            background: value === o.value ? '#fff' : 'transparent',
            color: value === o.value ? '#111' : 'rgba(0,0,0,0.45)',
            fontSize: 12,
            fontWeight: value === o.value ? 600 : 400,
            fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            transition: 'all 0.12s',
            letterSpacing: '-0.01em',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Dots() {
  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(0,0,0,0.3)',
            animation: `pp 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}
