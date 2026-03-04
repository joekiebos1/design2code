import type { HeadingLevel } from '../../lib/semantic-headline'

export type CardGridCardStyle = 'image-above' | 'text-on-colour' | 'text-on-image'
export type CardGridColumns = 2 | 3 | 4
export type CardGridSurface = 'subtle' | 'bold'

export type CardGridItem = {
  cardStyle: CardGridCardStyle
  title: string
  description?: string | null
  image?: string | null
  video?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  surface?: CardGridSurface
}

export type CardGridBlockProps = {
  columns?: CardGridColumns
  title?: string | null
  titleLevel?: HeadingLevel
  items?: CardGridItem[] | null
}
