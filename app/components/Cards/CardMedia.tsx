'use client'

import Image from 'next/image'
import { VideoWithControls } from '../VideoWithControls'
import type { CardMediaAspectRatio } from './Card.types'

type CardMediaProps = {
  image?: string | null
  video?: string | null
  prefersReducedMotion: boolean
  aspectRatio?: CardMediaAspectRatio
  /** When true, use height instead of aspect-ratio (for Carousel compact 4:5) */
  heightCss?: string
}

export function CardMedia({
  image,
  video,
  prefersReducedMotion,
  aspectRatio = '4/5',
  heightCss,
}: CardMediaProps) {
  const hasVideo = video && typeof video === 'string' && video.trim() !== ''
  const hasImage = image && typeof image === 'string' && image.trim() !== ''
  if (!hasVideo && !hasImage) return null

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
          poster={hasImage ? image : undefined}
          prefersReducedMotion={prefersReducedMotion}
        />
      ) : (
        <Image
          src={image!}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
    </div>
  )
}
