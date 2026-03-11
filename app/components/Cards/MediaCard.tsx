'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Button } from '@marcelinodzn/ds-react'
import { CardMedia } from './CardMedia'
import { BlockContainer } from '../../blocks/BlockContainer'
import type { MediaCardConfig } from './Card.types'
import type { ImageSlotState } from '../../hooks/useImageStream'

const GAP = 'var(--ds-spacing-l)'

export type MediaCardLayout = 'compact' | 'medium' | 'large'

export type MediaCardProps = {
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
  link?: string | null
  ctaText?: string | null
  aspectRatio?: '4:5' | '8:5' | '2:1'
  prefersReducedMotion: boolean
  /** Block-derived config. Block sets layout, imageHeight4_5 etc. */
  config: MediaCardConfig
  /** When true, video is paused (e.g. card out of view in carousel). */
  videoPaused?: boolean
  /** When false, text fades out (carousel: card leaving viewport). Undefined = always visible. */
  inView?: boolean
  /** JioKarna preview: progressive image stream. */
  imageState?: ImageSlotState | null
  imageSlot?: string | null
}

export function MediaCard({
  title,
  description,
  image,
  video,
  link,
  ctaText,
  aspectRatio = '4:5',
  prefersReducedMotion,
  config,
  videoPaused,
  inView = true,
  imageState,
  imageSlot,
}: MediaCardProps) {
  const router = useRouter()
  const { layout, imageHeight4_5 } = config
  const isLarge = layout === 'large' || layout === 'medium'

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const hasVideo = video && typeof video === 'string' && video.trim() !== ''
  const hasImage = (image && typeof image === 'string' && image.trim() !== '') || (imageState && imageSlot)

  // Large: 2:1 only. Medium: 4:5 only. Compact: 4:5 and 8:5 (2:1 falls back to 8:5).
  const effectiveRatio =
    layout === 'medium'
      ? '4:5'
      : layout === 'large'
        ? '2:1'
        : (aspectRatio === '2:1' ? '8:5' : (aspectRatio ?? '4:5'))

  const mediaAspectMap = { '4:5': '4/5' as const, '8:5': '8/5' as const, '2:1': '2/1' as const }
  const mediaAspectRatio = mediaAspectMap[effectiveRatio] ?? '4/5'
  const heightCss =
    effectiveRatio === '4:5' && imageHeight4_5 ? imageHeight4_5 : undefined

  const imageBlock = (
    <div
      className="carousel-card-inner"
      style={{
        position: 'relative',
        width: '100%',
        ...(heightCss
          ? { height: heightCss }
          : { aspectRatio: mediaAspectRatio }),
      }}
    >
      {(hasVideo || hasImage) && (
        <CardMedia
          image={image}
          video={video}
          prefersReducedMotion={prefersReducedMotion}
          aspectRatio={mediaAspectRatio}
          heightCss={heightCss}
          videoPaused={videoPaused}
          inView={inView}
          imageState={imageState}
          imageSlot={imageSlot}
        />
      )}
    </div>
  )

  const textOpacity = inView ? 1 : 0
  const textTransition = prefersReducedMotion ? undefined : createTransition('opacity', 'xl', 'transition', 'moderate')
  /** Delay on fade-in so the card is in place before text appears. No delay on fade-out. */
  const textTransitionDelay = prefersReducedMotion ? undefined : inView ? '150ms' : '0ms'

  const textContent = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        paddingRight: layout === 'compact' ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-l)',
        paddingBottom: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-m)',
        opacity: textOpacity,
        transition: textTransition,
        transitionDelay: textTransitionDelay,
      }}
    >
      {(title || description) && (
        isLarge ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-m)',
              width: '100%',
            }}
          >
            {title && (
              <p
                style={{
                  margin: 0,
                  width: '100%',
                  fontSize: 'var(--ds-typography-h5)',
                  fontWeight: 'var(--ds-typography-weight-medium)',
                  color: 'var(--ds-color-text-high)',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-line',
                }}
              >
                {title}
              </p>
            )}
            {description && (
              <p
                style={{
                  margin: 0,
                  width: '100%',
                  fontSize: 'var(--ds-typography-label-s)',
                  lineHeight: 1.4,
                  color: 'var(--ds-color-text-low)',
                  fontWeight: 'var(--ds-typography-weight-low)',
                  whiteSpace: 'pre-line',
                }}
              >
                {description}
              </p>
            )}
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              width: '100%',
              fontSize: 'var(--ds-typography-label-s)',
              lineHeight: 1.4,
            }}
          >
            {title && (
              <span style={{ color: 'var(--ds-color-text-high)', fontWeight: 'var(--ds-typography-weight-high)', whiteSpace: 'pre-line' }}>
                {title}
              </span>
            )}
            {title && description && ' '}
            {description && (
              <span style={{ color: 'var(--ds-color-text-low)', fontWeight: 'var(--ds-typography-weight-low)', whiteSpace: 'pre-line' }}>
                {description}
              </span>
            )}
          </p>
        )
      )}
      {ctaText && link && (
        <Button
          appearance="primary"
          size="S"
          attention="low"
          onPress={() => handleCtaPress(link)}
          style={{ alignSelf: 'flex-start' }}
        >
          {ctaText}
        </Button>
      )}
    </div>
  )

  const textBlock = (title || description || (ctaText && link))
    ? isLarge
      ? (
          <BlockContainer
            contentWidth="S"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              width: '100%',
              marginInline: 0,
              textAlign: 'left',
              alignSelf: 'flex-start',
            }}
          >
            {textContent}
          </BlockContainer>
        )
      : textContent
    : null

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: layout === 'compact' ? 'var(--ds-spacing-m)' : GAP,
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      {link && link.trim() !== '' && !ctaText ? (
        <Link
          href={link.trim()}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', flexShrink: 0 }}
        >
          {imageBlock}
        </Link>
      ) : (
        <div style={{ flexShrink: 0 }}>{imageBlock}</div>
      )}
      {textBlock}
    </div>
  )

  return content
}
