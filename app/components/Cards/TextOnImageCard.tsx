'use client'

import Image from 'next/image'
import { CardOverlayTitle, CardOverlayDescription } from './CardTypography'
import { StreamImage } from '../StreamImage'
import type { CardMediaAspectRatio, TextOnImageCardConfig } from './Card.types'
import type { ImageSlotState } from '../../hooks/useImageStream'

export type TextOnImageCardProps = {
  title?: string | null
  description?: string | null
  image: string
  /** Block-derived config. Block sets aspectRatio etc. */
  config: TextOnImageCardConfig
  /** JioKarna preview: progressive image stream. */
  imageState?: ImageSlotState | null
  imageSlot?: string | null
}

export function TextOnImageCard({
  title,
  description,
  image,
  config,
  imageState,
  imageSlot,
}: TextOnImageCardProps) {
  const { aspectRatio = '4/3' } = config
  const aspectMap: Record<CardMediaAspectRatio, string> = {
    '4/5': '4/5',
    '4/3': '4/3',
    '8/5': '8/5',
    '2/1': '2/1',
  }
  const aspectValue = aspectMap[aspectRatio]
  const useStreamImage = imageState && imageSlot

  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-card-m)',
        position: 'relative',
        aspectRatio: aspectValue,
      }}
    >
      {useStreamImage ? (
        <StreamImage
          slot={imageSlot}
          imageState={imageState}
          aspectRatio={aspectValue}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        />
      ) : (
        <Image
          src={image}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--ds-color-neutral-bold) 70%, transparent) 0%, transparent 60%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--ds-spacing-xl)',
        }}
      >
        {title && <CardOverlayTitle>{title}</CardOverlayTitle>}
        {description && <CardOverlayDescription>{description}</CardOverlayDescription>}
      </div>
    </div>
  )
}
