'use client'

import type { ImageSlotState } from '../../shared/image-slot-state'

type StreamImageProps = {
  slot: string
  imageState: ImageSlotState
  aspectRatio?: string
  style?: React.CSSProperties
  fill?: boolean
}

export function StreamImage({
  slot,
  imageState,
  aspectRatio = '16/9',
  style,
  fill = false,
}: StreamImageProps) {
  const { url, alt, source, ready } = imageState

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--ds-radius-card)',
    ...(fill ? { width: '100%', height: '100%' } : { width: '100%', aspectRatio }),
    ...style,
  }

  const skeletonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'var(--ds-color-background-subtle)',
    animation: 'stream-image-skeleton 1.5s ease-in-out infinite',
  }

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    opacity: ready ? 1 : 0,
    transition: 'opacity 0.3s ease-in',
  }

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 'var(--ds-spacing-xs)',
    left: 'var(--ds-spacing-xs)',
    padding: 'var(--ds-spacing-2xs) var(--ds-spacing-xs)',
    borderRadius: 'var(--ds-radius-chip)',
    fontSize: 'var(--ds-typography-label-xs)',
    fontWeight: 'var(--ds-typography-weight-medium)',
    color: 'var(--ds-color-text-on-bold)',
    background: 'color-mix(in srgb, var(--ds-color-neutral-bold) 80%, transparent)',
    pointerEvents: 'none',
  }

  return (
    <div style={containerStyle} data-slot={slot}>
      {!ready ? (
        <div style={skeletonStyle} aria-hidden />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            style={imageStyle}
            loading="eager"
          />
          <span style={badgeStyle} aria-hidden>
            {source}
          </span>
        </>
      )}
    </div>
  )
}
