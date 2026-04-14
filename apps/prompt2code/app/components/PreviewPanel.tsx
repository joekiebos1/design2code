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

const EDIT_SCALE = 0.60

export function PreviewPanel({ blocks, brief, imageUrls, videoUrls, step, sectionCount, onBriefUpdate }: PreviewPanelProps) {
  const [mode, setMode]         = useState<PanelMode>('edit')
  const [viewport, setViewport] = useState<Viewport>('1440')

  const isActive = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && !!blocks?.length
  const canEdit  = (step === 'reviewing' || step === 'publishing' || step === 'done') && !!brief

  useEffect(() => { if (canEdit) setMode('edit') }, [canEdit])

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto bg-[#f2f2f2]">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 h-11 shrink-0 flex items-center justify-center gap-2 border-b border-black/[0.07] bg-[rgba(242,242,242,0.92)] backdrop-blur-md">
        {canEdit && (
          <Toggle
            options={[{ value: 'edit', label: 'Edit' }, { value: 'preview', label: 'Preview' }]}
            value={mode}
            onChange={v => setMode(v as PanelMode)}
          />
        )}
        {mode === 'preview' && (
          <Toggle
            options={[{ value: '360', label: '360' }, { value: '1440', label: '1440' }]}
            value={viewport}
            onChange={v => setViewport(v as Viewport)}
          />
        )}
        <span className="absolute right-3 text-[11px] text-black/30 tabular-nums">
          {mode === 'edit' ? `${EDIT_SCALE * 100}%` : `${viewport}px`}
        </span>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {step === 'idle' && (
          <div className="flex-1 flex items-center justify-center text-sm text-black/30">
            Your page preview will appear here
          </div>
        )}

        {step === 'generating' && !sectionCount && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-sm text-black/40">
            <Dots />
            Building your page…
          </div>
        )}

        {isActive && canEdit && mode === 'edit' && (
          <PageCanvas>
            <EditablePreview
              brief={brief!}
              imageUrls={imageUrls}
              videoUrls={videoUrls}
              onBriefUpdate={onBriefUpdate}
              scale={EDIT_SCALE}
            />
          </PageCanvas>
        )}

        {isActive && (mode === 'preview' || !canEdit) && blocks && (
          <PageCanvas>
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

// ─── Canvas wrapper ───────────────────────────────────────────────────────────

function PageCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-start px-[60px] py-8 pb-20 min-h-full">
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
    <div className="flex bg-black/[0.06] rounded-lg p-[3px] gap-0.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={[
            'px-3 py-[3px] rounded-md text-xs cursor-pointer transition-all',
            value === o.value
              ? 'bg-white text-gray-900 font-medium shadow-sm'
              : 'text-black/[0.48] font-normal',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Dots ─────────────────────────────────────────────────────────────────────

function Dots() {
  return (
    <>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-black/30"
            style={{ animation: `pp 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes pp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}
