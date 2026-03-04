'use client'

import { useRouter } from 'next/navigation'
import { Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { CardMedia } from './CardMedia'
import { CardTitle, CardDescription } from './CardTypography'
import type { MediaCardContainedConfig } from './Card.types'

const GAP = 'var(--ds-spacing-l)'

export type MediaCardContainedProps = {
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  prefersReducedMotion: boolean
  /** Block-derived config. Block sets aspectRatio etc. */
  config: MediaCardContainedConfig
}

export function MediaCardContained({
  title,
  description,
  image,
  video,
  ctaText,
  ctaLink,
  prefersReducedMotion,
  config,
}: MediaCardContainedProps) {
  const { aspectRatio = '4/5' } = config
  const router = useRouter()
  const hasVideo = video && typeof video === 'string' && video.trim() !== ''
  const hasImage = image && typeof image === 'string' && image.trim() !== ''
  const hasMedia = hasVideo || hasImage

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  return (
    <SurfaceProvider level={0}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GAP,
          overflow: 'hidden',
          borderRadius: 'var(--ds-radius-card-m)',
          background: 'var(--ds-color-block-background-subtle)',
          minHeight: 0,
        }}
      >
        {hasMedia && (
          <div style={{ flexShrink: 0 }}>
            <CardMedia
              image={image}
              video={video}
              prefersReducedMotion={prefersReducedMotion}
              aspectRatio={aspectRatio}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-m)',
            padding: GAP,
          }}
        >
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {ctaText && ctaLink && (
            <Button
              appearance="auto"
              size="S"
              attention="low"
              onPress={() => handleCtaPress(ctaLink)}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--ds-spacing-m)' }}
            >
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </SurfaceProvider>
  )
}
