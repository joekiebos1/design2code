'use client'

import Image from 'next/image'
import { CardOverlayTitle, CardOverlayDescription } from './CardTypography'
import type { CardMediaAspectRatio, TextOnImageCardConfig } from './Card.types'

export type TextOnImageCardProps = {
  title?: string | null
  description?: string | null
  image: string
  /** Block-derived config. Block sets aspectRatio etc. */
  config: TextOnImageCardConfig
}

export function TextOnImageCard({
  title,
  description,
  image,
  config,
}: TextOnImageCardProps) {
  const { aspectRatio = '4/3' } = config
  const aspectMap: Record<CardMediaAspectRatio, string> = {
    '4/5': '4/5',
    '4/3': '4/3',
    '8/5': '8/5',
    '2/1': '2/1',
  }
  const aspectValue = aspectMap[aspectRatio]

  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-card-m)',
        position: 'relative',
        aspectRatio: aspectValue,
      }}
    >
      <Image
        src={image}
        alt=""
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, 33vw"
      />
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
