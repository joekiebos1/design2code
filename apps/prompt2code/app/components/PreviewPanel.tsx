'use client'

import { useRef, useEffect } from 'react'
import type { ConversationStep } from '../page'

type PreviewPanelProps = {
  blocks: unknown[] | null
  step: ConversationStep
  sectionCount: number
}

export function PreviewPanel({ blocks, step, sectionCount }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const showBlocks = (step === 'generating' || step === 'reviewing' || step === 'publishing' || step === 'done') && blocks?.length

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'UPDATE_PREVIEW', blocks },
      '*'
    )
  }, [blocks])

  return (
    <div style={{ height: '100vh', position: 'relative', background: '#f0f0f0' }}>
      {/* Empty state */}
      {step === 'idle' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontSize: 14,
          textAlign: 'center',
          padding: 40,
        }}>
          Your page preview will appear here
        </div>
      )}

      {/* Building state */}
      {step === 'generating' && !sectionCount && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          color: '#666',
          fontSize: 14,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#999',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          Building your page…
          <style>{`
            @keyframes pulse {
              0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        src="/preview"
        style={{
          display: showBlocks ? 'block' : 'none',
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  )
}
