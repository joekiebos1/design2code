'use client'

import Image from 'next/image'
import { VideoWithControls, StreamImage } from '@design2code/block-library'
import { labStyleTextDenseList } from '@design2code/ds'
import type { CardMediaAspectRatio } from './Card.types'
import type { ImageSlotState } from '../../../../hooks/useImageStream'

/** Valid image src: full URL or path starting with /. Rejects filenames like "laptop-design.jpg". */
function isValidImageSrc(s: string | null | undefined): boolean {
  if (!s || typeof s !== 'string' || !s.trim()) return false
  const t = s.trim()
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')
}

type CardMediaProps = {
  image?: string | null
  video?: string | null
  prefersReducedMotion: boolean
  aspectRatio?: CardMediaAspectRatio
  /** When true, use height instead of aspect-ratio (for Carousel compact 4:5) */
  heightCss?: string
  /** When true, video is paused (e.g. card out of view in carousel). */
  videoPaused?: boolean
  /** When false, video controls fade out (carousel: card leaving viewport). */
  inView?: boolean
  /** JioKarna preview: progressive image stream. When provided, use StreamImage. */
  imageState?: ImageSlotState | null
  imageSlot?: string | null
}

export function CardMedia({
  image,
  video,
  prefersReducedMotion,
  aspectRatio = '4/5',
  heightCss,
  videoPaused,
  inView = true,
  imageState,
  imageSlot,
}: CardMediaProps) {
  const hasVideo = video && typeof video === 'string' && video.trim() !== ''
  const hasValidImage = image && isValidImageSrc(image)
  const hasInvalidImage = image && typeof image === 'string' && image.trim() !== '' && !isValidImageSrc(image)
  const useStreamImage = imageState && imageSlot
  if (!hasVideo && !hasValidImage && !hasInvalidImage && !useStreamImage) return null

  const aspectMap: Record<CardMediaAspectRatio, string> = {
    '4/5': '4/5',
    '4/3': '4/3',
    '8/5': '8/5',
    '2/1': '2/1',
  }
  const aspectValue = aspectMap[aspectRatio]

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'inherit',
    ...(heightCss ? { height: heightCss } : { aspectRatio: aspectValue }),
  }

  return (
    <div style={containerStyle}>
      {hasVideo ? (
        <VideoWithControls
          src={video!}
          poster={hasValidImage ? image : undefined}
          prefersReducedMotion={prefersReducedMotion}
          paused={videoPaused}
          inView={inView}
        />
      ) : useStreamImage ? (
        <StreamImage
          slot={imageSlot}
          imageState={imageState}
          aspectRatio={aspectValue}
          style={{ width: '100%', height: '100%' }}
        />
      ) : hasValidImage ? (
        <Image
          src={image!.trim()}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--ds-color-background-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...labStyleTextDenseList,
            color: 'var(--ds-color-text-medium)',
          }}
        >
          Preview
        </div>
      )}
    </div>
  )
}
