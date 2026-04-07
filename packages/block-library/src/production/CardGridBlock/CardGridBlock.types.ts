export type CardGridCardType =
  | 'mediaTextBelow'
  | 'mediaTextOverlay'
  | 'colourFeatured'
  | 'colourIconText'
  | 'colourTextOnly'
  | 'colourMediaText'

export type CardGridColumns = 2 | 3 | 4
export type CardGridEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type CardGridAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'
export type BlockInteraction = 'information' | 'navigation'

/** @deprecated Use CardGridAppearance */
export type CardGridSurfaceColour = CardGridAppearance

export type CardGridItem = {
  _type?: 'cardGridItem'
  cardType?: CardGridCardType
  title: string
  description?: string | null
  image?: string | null
  video?: string | null
  videoUrl?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  link?: string | null
  imageSlot?: string
  icon?: string | null
  iconImage?: string | null
  backgroundColor?: string | null
  aspectRatio?: '4:5' | '1:1' | '4:3' | null
}

export type CardGridBlockItem = CardGridItem

export type CardGridBlockProps = {
  columns?: CardGridColumns
  interaction?: BlockInteraction
  title?: string | null
  emphasis?: CardGridEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: CardGridAppearance
  items?: CardGridBlockItem[] | null
  /** JioKarna preview: progressive image stream state keyed by slot. */
  images?: Record<string, import('../../shared/image-slot-state').ImageSlotState>
}
