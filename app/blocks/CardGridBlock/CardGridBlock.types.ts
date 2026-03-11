export type CardGridCardStyle = 'image-above' | 'text-on-image'
export type CardGridColumns = 2 | 3 | 4
export type CardGridBlockSurface = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type CardGridBlockAccent = 'primary' | 'secondary' | 'neutral'

export type CardGridItem = {
  _type?: 'cardGridItem'
  cardStyle?: CardGridCardStyle
  title: string
  description?: string | null
  image?: string | null
  video?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  imageSlot?: string
}

export type TextOnColourCardGridItem = {
  _type?: 'textOnColourCardItem'
  size?: 'large' | 'small'
  icon?: string | null
  iconImage?: string | null
  title: string
  description?: string | null
  callToActionButtons?: { _key?: string; label: string; link?: string | null; style?: 'filled' | 'outlined' }[] | null
  features?: string[] | null
  backgroundColor?: 'primary' | 'secondary' | 'tertiary' | null
}

export type CardGridBlockItem = CardGridItem | TextOnColourCardGridItem

export type CardGridBlockProps = {
  columns?: CardGridColumns
  title?: string | null
  blockSurface?: CardGridBlockSurface
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  blockAccent?: CardGridBlockAccent
  items?: CardGridBlockItem[] | null
  /** JioKarna preview: progressive image stream state keyed by slot. */
  images?: Record<string, import('../../hooks/useImageStream').ImageSlotState>
}
