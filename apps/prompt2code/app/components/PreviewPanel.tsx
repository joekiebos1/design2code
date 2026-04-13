'use client'

import { useState, useEffect } from 'react'
import { ContentDsProvider } from '@design2code/ds'
import { BlockRenderer } from './BlockRenderer'
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

type PanelMode = 'edit' | 'preview'
type Viewport = '360' | '1440'

// Edit canvas zoom level
const EDIT_SCALE = 0.5

export function PreviewPanel({ blocks, brief, imageUrls, videoUrls, step, sectionCount, onBriefUpdate }: PreviewPanelProps) {
  const [mode, setMode] = useState<PanelMode>('edit')
  const [viewport, setViewport] = useState<Viewport>('1440')

  const isActive = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && !!blocks?.length
  const canEdit  = (step === 'reviewing' || step === 'publishing' || step === 'done') && !!brief

  // Auto-switch to edit when brief first arrives
  useEffect(() => { if (canEdit) setMode('edit') }, [canEdit])

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      background: 'rgb(242,242,242)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Sticky toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'rgba(242,242,242,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        {canEdit && (
          <Toggle
            options={[
              { value: 'edit',    label: 'Edit' },
              { value: 'preview', label: 'Preview' },
            ]}
            value={mode}
            onChange={v => setMode(v as PanelMode)}
          />
        )}

        {/* Viewport selector — only in preview mode */}
        {mode === 'preview' && (
          <Toggle
            options={[
              { value: '360',  label: '360' },
              { value: '1440', label: '1440' },
            ]}
            value={viewport}
            onChange={v => setViewport(v as Viewport)}
          />
        )}

        {/* Zoom level hint */}
        <div style={{
          position: 'absolute',
          right: 12,
          fontSize: 11,
          color: 'rgba(0,0,0,0.3)',
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {mode === 'edit' ? `${EDIT_SCALE * 100}%` : `${viewport}px`}
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Empty state */}
        {step === 'idle' && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.3)',
            fontSize: 13,
          }}>
            Your page preview will appear here
          </div>
        )}

        {/* Generating spinner */}
        {step === 'generating' && !sectionCount && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            color: 'rgba(0,0,0,0.4)',
            fontSize: 13,
          }}>
            <Dots />
            Building your page…
          </div>
        )}

        {/* ── Edit mode ──────────────────────────────────────────────────────
            White 1440px page zoomed to 50%, centred on grey canvas.
        ─────────────────────────────────────────────────────────────────── */}
        {isActive && canEdit && mode === 'edit' && (
          <PageCanvas padding="32px 60px 80px">
            <EditablePreview
              brief={brief!}
              imageUrls={imageUrls}
              videoUrls={videoUrls}
              onBriefUpdate={onBriefUpdate}
              scale={EDIT_SCALE}
            />
          </PageCanvas>
        )}

        {/* ── Preview mode (+ streaming state) ───────────────────────────────
            Same white 1440px page but at 100% — scroll vertically to read.
        ─────────────────────────────────────────────────────────────────── */}
        {isActive && (mode === 'preview' || !canEdit) && blocks && (
          <PageCanvas padding="32px 60px 80px">
            <div style={{ width: viewport === '360' ? 360 : 1440, background: '#fff', flexShrink: 0 }}>
              <ContentDsProvider>
                <BlockRenderer blocks={blocks} />
              </ContentDsProvider>
            </div>
          </PageCanvas>
        )}

      </div>
    </div>
  )
}

// ─── Shared canvas wrapper ────────────────────────────────────────────────────
// Centres the page on the grey background.

function PageCanvas({ children, padding }: { children: React.ReactNode; padding: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding,
      minHeight: '100%',
    }}>
      {children}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ options, value, onChange }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(0,0,0,0.06)',
      borderRadius: 7,
      padding: 3,
      gap: 2,
    }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '3px 12px',
            borderRadius: 5,
            border: 'none',
            background: value === o.value ? '#fff' : 'transparent',
            color: value === o.value ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.48)',
            fontSize: 12,
            fontWeight: value === o.value ? 500 : 400,
            fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
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

// ─── Loading dots ─────────────────────────────────────────────────────────────

function Dots() {
  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.3)',
            animation: `pp 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}
