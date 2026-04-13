'use client'

import { useEffect } from 'react'

type DamImagePickerProps = {
  imageUrls: string[]
  onSelect: (url: string) => void
  onClose: () => void
}

export function DamImagePicker({ imageUrls, onSelect, onClose }: DamImagePickerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          width: '100%',
          maxWidth: 900,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Swap image</div>
            <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>
              {imageUrls.length} images available from DAM
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.07)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        {/* Image grid */}
        <div style={{
          overflowY: 'auto',
          padding: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {imageUrls.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'rgba(0,0,0,0.35)', fontSize: 13 }}>
              No images in DAM pool yet.
            </div>
          )}
          {imageUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => { onSelect(url); onClose() }}
              style={{
                border: '2px solid transparent',
                borderRadius: 10,
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                background: '#f5f5f5',
                aspectRatio: '4/3',
                display: 'block',
                width: '100%',
                transition: 'border-color 0.12s, transform 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,100,220,0.7)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
