'use client'

/**
 * Renders LabCardItem for both grid and carousel.
 * Single renderer for unified lab cards.
 */

import { MediaCard, TextOnImageCard, ColourCard, ColourMediaTextCard, CardLink } from '../components/blocks/Cards'
import type { ImageSlotState } from '../shared/image-slot-state'
import type { MediaCardConfig } from '../components/blocks/Cards'
import type { BlockInteraction } from '../production/CardGridBlock/CardGridBlock.types'

export type CardSurface = 'minimal' | 'subtle' | 'moderate' | 'bold' | 'inverted'

export type LabCardItem = {
  _type?: 'labCardItem'
  cardType?: string
  title?: string | null
  description?: string | null
  backgroundColor?: string | null
  icon?: string | null
  iconImage?: string | null
  image?: string | null
  video?: string | null
  videoUrl?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  link?: string | null
  aspectRatio?: '4:5' | '8:5' | '2:1'
  imageSlot?: string
}

function getCardSizeFromColumns(cols: number): 'large' | 'medium' | 'small' {
  if (cols <= 1) return 'large'
  if (cols <= 2) return 'medium'
  return 'small'
}

function isColourType(raw: string): boolean {
  return raw === 'colourFeatured' || raw === 'colourIconText' || raw === 'colourTextOnly'
}

function resolveCardSurface(
  cardSurface: CardSurface | undefined,
  emphasis: string | undefined,
): CardSurface {
  if (cardSurface) return cardSurface
  switch (emphasis) {
    case 'minimal': return 'moderate'
    case 'subtle': return 'moderate'
    case 'bold': return 'inverted'
    default: return 'minimal'
  }
}

export function LabCardRenderer({
  item,
  prefersReducedMotion,
  imageState,
  gridColumns,
  context,
  interaction = 'information',
  aspectRatio,
  mediaConfig,
  videoPaused,
  inView,
  cardSurface,
  emphasis,
}: {
  item: LabCardItem
  prefersReducedMotion: boolean
  imageState?: ImageSlotState
  gridColumns?: number
  context: 'grid' | 'carousel'
  interaction?: BlockInteraction
  aspectRatio?: '4:5' | '8:5' | '2:1'
  mediaConfig?: MediaCardConfig
  videoPaused?: boolean
  inView?: boolean
  cardSurface?: CardSurface
  emphasis?: string
}) {
  const title = item.title ?? ''
  const raw = item.cardType ?? 'mediaTextBelow'
  const cardSize = gridColumns != null ? getCardSizeFromColumns(gridColumns) : 'medium'
  const isNav = interaction === 'navigation'
  const resolvedSurface = resolveCardSurface(cardSurface, emphasis)
  const isColourCard = isColourType(raw) || raw === 'colourMediaText'

  const card = (() => {
    if (isColourType(raw)) {
      const inner = (
        <ColourCard
          variant={raw === 'colourFeatured' ? 'feature' : raw === 'colourIconText' ? 'icon' : 'text'}
          title={title}
          description={item.description}
          icon={item.icon}
          iconImage={item.iconImage}
          aspectRatio="4:5"
          backgroundColor={item.backgroundColor}
          cardSize={cardSize}
        />
      )
      if (context === 'carousel' && aspectRatio) {
        const ratioMap = { '4:5': '4/5', '8:5': '8/5', '2:1': '2/1' } as const
        return (
          <div style={{ aspectRatio: ratioMap[aspectRatio], width: '100%', minHeight: 0, display: 'flex' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{inner}</div>
          </div>
        )
      }
      return inner
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
      const img = imageState?.ready ? imageState.url : (typeof item.image === 'string' ? item.image : null) ?? ''
      if (img) {
        return (
          <TextOnImageCard
            title={title}
            description={item.description}
            image={img}
            config={{ aspectRatio: '4/5', cardSize }}
            imageState={imageState}
            imageSlot={item.imageSlot}
          />
        )
      }
    }

    const video = item.video ?? item.videoUrl ?? undefined
    const config = mediaConfig ?? { layout: 'compact' as const, cardSize }
    const mediaAspectRatio = aspectRatio ?? item.aspectRatio ?? '4:5'
    return (
      <MediaCard
        title={title}
        description={item.description}
        image={imageState?.ready ? imageState.url : item.image}
        video={typeof video === 'string' ? video : undefined}
        link={isNav ? undefined : item.ctaLink}
        ctaText={isNav ? undefined : item.ctaText}
        aspectRatio={mediaAspectRatio}
        prefersReducedMotion={prefersReducedMotion}
        config={config}
        videoPaused={videoPaused}
        inView={inView}
        imageState={imageState}
        imageSlot={item.imageSlot}
      />
    )
  })()

  const surfaceStyle = isColourCard && resolvedSurface === 'inverted'
    ? { background: '#fff', borderRadius: 'var(--ds-radius-card-m)', overflow: 'hidden' as const }
    : undefined

  return (
    <CardLink
      interaction={interaction}
      link={isNav ? item.link : undefined}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', ...surfaceStyle }}
    >
      {card}
    </CardLink>
  )
}
