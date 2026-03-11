'use client'

import {
  MediaCard,
  TextOnColourCardGrid,
  TextOnImageCard,
} from '../../components/Cards'
import type { CardGridBlockItem } from './CardGridBlock.types'
import type { ImageSlotState } from '../../hooks/useImageStream'

export function CardRenderer({
  item,
  prefersReducedMotion,
  imageState,
}: {
  item: CardGridBlockItem
  prefersReducedMotion: boolean
  imageState?: ImageSlotState
}) {
  const _type = item._type as string | undefined
  const title = item.title ?? ''

  if (_type === 'textOnColourCardItem') {
    const t = item as {
      size?: 'large' | 'small'
      icon?: string | null
      iconImage?: string | null
      title: string
      description?: string | null
      callToActionButtons?: { _key?: string; label: string; link?: string | null; style?: 'filled' | 'outlined' }[] | null
      features?: string[] | null
      backgroundColor?: 'primary' | 'secondary' | 'tertiary' | null
    }
    return (
      <TextOnColourCardGrid
        size={t.size ?? 'small'}
        icon={t.icon}
        iconImage={t.iconImage}
        title={t.title}
        description={t.description}
        callToActionButtons={t.callToActionButtons}
        features={t.features}
        backgroundColor={t.backgroundColor ?? 'primary'}
      />
    )
  }

  const cardItem = item as {
    cardStyle?: string
    title: string
    description?: string | null
    image?: string | null
    video?: string | null
    ctaText?: string | null
    ctaLink?: string | null
    surface?: string
  }

  const cardStyle = cardItem.cardStyle ?? 'image-above'
  const hasImage = cardItem.image && typeof cardItem.image === 'string' && cardItem.image.trim() !== ''

  if (cardStyle === 'text-on-colour') {
    const surfaceToBg = (cardItem.surface === 'subtle' ? 'secondary' : 'primary') as 'primary' | 'secondary' | 'tertiary'
    return (
      <TextOnColourCardGrid
        size="large"
        title={title}
        description={cardItem.description}
        backgroundColor={surfaceToBg}
      />
    )
  }

  if (cardStyle === 'text-on-image' && (hasImage || imageState)) {
    return (
      <TextOnImageCard
        title={title}
        description={cardItem.description}
        image={imageState?.ready ? imageState.url : cardItem.image ?? ''}
        config={{ aspectRatio: '4/5' }}
        imageState={imageState}
        imageSlot={(cardItem as { imageSlot?: string }).imageSlot}
      />
    )
  }

  return (
    <MediaCard
      title={title}
      description={cardItem.description}
      image={imageState?.ready ? imageState.url : cardItem.image}
      video={cardItem.video}
      link={cardItem.ctaLink}
      ctaText={cardItem.ctaText}
      aspectRatio="4:5"
      prefersReducedMotion={prefersReducedMotion}
      config={{ layout: 'compact' }}
      imageState={imageState}
      imageSlot={(cardItem as { imageSlot?: string }).imageSlot}
    />
  )
}
