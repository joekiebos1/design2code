'use client'

import { MediaCard, TextOnImageCard, ColourCard, ColourMediaTextCard, CardLink } from '../../components/blocks/Cards'
import type { CardGridBlockItem } from './CardGridBlock.types'
import type { BlockInteraction } from './CardGridBlock.types'
import type { ImageSlotState } from '../../shared/image-slot-state'

function getCardSizeFromColumns(cols: number): 'large' | 'medium' | 'small' {
  if (cols <= 1) return 'large'
  if (cols <= 2) return 'medium'
  return 'small'
}

function isColourType(raw: string): boolean {
  return raw === 'colourFeatured' || raw === 'colourIconText' || raw === 'colourTextOnly'
}

export function CardRenderer({
  item,
  prefersReducedMotion,
  imageState,
  gridColumns,
  interaction = 'information',
}: {
  item: CardGridBlockItem
  prefersReducedMotion: boolean
  imageState?: ImageSlotState
  gridColumns?: number
  interaction?: BlockInteraction
}) {
  const title = item.title ?? ''
  const raw = item.cardType ?? 'mediaTextBelow'
  const cardSize = gridColumns != null ? getCardSizeFromColumns(gridColumns) : 'medium'
  const isNav = interaction === 'navigation'

  const card = (() => {
    if (isColourType(raw)) {
      const t = item as {
        icon?: string | null
        iconImage?: string | null
        description?: string | null
        backgroundColor?: string | null
        aspectRatio?: string | null
      }
      return (
        <ColourCard
          variant={raw === 'colourFeatured' ? 'feature' : raw === 'colourIconText' ? 'icon' : 'text'}
          title={title}
          description={t.description}
          icon={t.icon}
          iconImage={t.iconImage}
          aspectRatio={(t.aspectRatio as '4:5' | '1:1' | '4:3') ?? '4:5'}
          backgroundColor={t.backgroundColor}
          cardSize={cardSize}
        />
      )
    }

    if (raw === 'colourMediaText') {
      return (
        <ColourMediaTextCard
          title={title}
          description={item.description}
          image={imageState?.ready ? imageState.url : item.image}
          ctaText={isNav ? undefined : item.ctaText}
          ctaLink={isNav ? undefined : item.ctaLink}
          cardSize={cardSize}
        />
      )
    }

    if (raw === 'mediaTextOverlay') {
      const m = item as { image?: string | null; description?: string | null; imageSlot?: string }
      const img = imageState?.ready ? imageState.url : (typeof m.image === 'string' ? m.image : null) ?? ''
      if (img) {
        return (
          <TextOnImageCard
            title={title}
            description={m.description}
            image={img}
            config={{ aspectRatio: '4/5', cardSize }}
            imageState={imageState}
            imageSlot={m.imageSlot}
          />
        )
      }
    }

    const m = item as {
      image?: string | null
      video?: string | null
      videoUrl?: string | null
      description?: string | null
      ctaText?: string | null
      ctaLink?: string | null
      imageSlot?: string
    }
    const video = m.video ?? m.videoUrl ?? undefined
    return (
      <MediaCard
        title={title}
        description={m.description}
        image={imageState?.ready ? imageState.url : m.image}
        video={typeof video === 'string' ? video : undefined}
        link={isNav ? undefined : m.ctaLink}
        ctaText={isNav ? undefined : m.ctaText}
        aspectRatio="4:5"
        prefersReducedMotion={prefersReducedMotion}
        config={{ layout: 'compact', cardSize }}
        imageState={imageState}
        imageSlot={m.imageSlot}
      />
    )
  })()

  return (
    <CardLink
      interaction={interaction}
      link={isNav ? item.link : undefined}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {card}
    </CardLink>
  )
}
