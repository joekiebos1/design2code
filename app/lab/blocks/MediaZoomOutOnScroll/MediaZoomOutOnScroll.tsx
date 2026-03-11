'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useGridBreakpoint } from '../../../lib/use-grid-breakpoint'
import { useScrollZoomProgress } from './use-scroll-zoom-progress'
import type { MediaZoomOutOnScrollProps } from './MediaZoomOutOnScroll.types'

/**
 * MediaZoomOutOnScroll – Lab block.
 * Media starts zoomed in and full edge-to-edge (100vw).
 * On scroll, reduces to Default content width and normal scale.
 * Respects prefers-reduced-motion: shows final state without animation.
 */
export function MediaZoomOutOnScroll({
  image,
  videoUrl,
  alt = '',
}: MediaZoomOutOnScrollProps) {
  const { progress, ref, prefersReducedMotion } = useScrollZoomProgress()
  const { contentMaxDefault } = useGridBreakpoint()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isVideo = Boolean(videoUrl?.trim()) && !prefersReducedMotion
  const mediaSrc = videoUrl?.trim() || image

  // Interpolate: 0 = full zoom + 100vw, 1 = normal scale + Default width
  const scale = 1 + (1 - progress) * 0.2 // 1.2 → 1

  const defaultWidthPx = contentMaxDefault.endsWith('px')
    ? parseFloat(contentMaxDefault)
    : typeof window !== 'undefined'
      ? window.innerWidth
      : 1078
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440
  const widthPx = viewportWidth * (1 - progress) + defaultWidthPx * progress
  const maxWidthResolved = mounted ? `${widthPx}px` : '100vw'

  const containerStyle: React.CSSProperties = {
    width: progress < 1 ? '100vw' : maxWidthResolved,
    maxWidth: progress < 1 ? '100vw' : maxWidthResolved,
    marginLeft: progress < 1 ? 'calc(-50vw + 50%)' : 'auto',
    marginRight: progress < 1 ? 'calc(-50vw + 50%)' : 'auto',
    transform: `scale(${scale})`,
    transformOrigin: 'center top',
    overflow: 'hidden',
    borderRadius: 'var(--ds-radius-card-m)',
    transition: prefersReducedMotion ? 'none' : undefined,
  }

  const mediaWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    backgroundColor: 'var(--ds-color-surface-subtle)',
  }

  return (
    <div
      ref={ref}
      style={{
        minHeight: '120vh',
        paddingBlockStart: 'var(--ds-spacing-2xl)',
        paddingBlockEnd: 'var(--ds-spacing-2xl)',
      }}
    >
      <div style={containerStyle}>
        <div style={mediaWrapperStyle}>
          {isVideo ? (
            <video
              src={mediaSrc}
              poster={image}
              muted
              autoPlay
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Image
              src={image}
              alt={alt ?? ''}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
