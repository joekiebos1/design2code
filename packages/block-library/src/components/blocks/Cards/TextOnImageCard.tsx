'use client'

import Image from 'next/image'
import { StreamImage } from '../StreamImage'
import type { CardMediaAspectRatio, TextOnImageCardConfig } from './Card.types'
import type { ImageSlotState } from '../../../shared/image-slot-state'

const CARD_SIZE_TYPOGRAPHY = {
  large: { title: 'var(--ds-typography-h4)', desc: 'var(--ds-typography-label-m)' },
  medium: { title: 'var(--ds-typography-h5)', desc: 'var(--ds-typography-label-s)' },
  small: { title: 'var(--ds-typography-label-l)', desc: 'var(--ds-typography-label-s)' },
} as const

export type TextOnImageCardProps = {
  title?: string | null
  description?: string | null
  image: string
  config: TextOnImageCardConfig
  imageState?: ImageSlotState | null
  imageSlot?: string | null
}

export function TextOnImageCard({ title, description, image, config, imageState, imageSlot }: TextOnImageCardProps) {
  const { aspectRatio = '4/3', cardSize = 'medium' } = config
  const typography = CARD_SIZE_TYPOGRAPHY[cardSize]
  const aspectMap: Record<CardMediaAspectRatio, string> = { '4/5': '4/5', '4/3': '4/3', '8/5': '8/5', '2/1': '2/1' }
  const aspectValue = aspectMap[aspectRatio]
  const useStreamImage = imageState && imageSlot

  return (
    <div style={{ overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)', position: 'relative', aspectRatio: aspectValue }}>
      {useStreamImage ? (
        <StreamImage slot={imageSlot} imageState={imageState} aspectRatio={aspectValue} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
      ) : (
        <Image src={image} alt="" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, color-mix(in srgb, var(--ds-color-neutral-bold) 70%, transparent) 0%, transparent 60%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--ds-spacing-xl)',
        }}
      >
        {title && <p style={{ margin: 0, fontSize: typography.title, fontWeight: 'var(--ds-typography-weight-medium)', color: 'var(--local-color-text-on-overlay)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{title}</p>}
        {description && <p style={{ margin: 'var(--ds-spacing-xs) 0 0', fontSize: typography.desc, lineHeight: 1.4, color: 'var(--local-color-text-on-overlay-subtle)', fontWeight: 'var(--ds-typography-weight-low)', whiteSpace: 'pre-line' }}>{description}</p>}
      </div>
    </div>
  )
}
