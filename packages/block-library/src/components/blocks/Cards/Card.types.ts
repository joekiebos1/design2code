export type CardMediaAspectRatio = '4/5' | '4/3' | '8/5' | '2/1'

export type CardSurface = 'subtle' | 'bold'

export type CardGridCardSize = 'large' | 'medium' | 'small'

export type MediaCardConfig = {
  layout: 'compact' | 'medium' | 'large'
  cardSize?: CardGridCardSize
  imageHeight4_5?: string
  imageHeight8_5?: string
}

export type MediaCardContainedConfig = {
  aspectRatio?: CardMediaAspectRatio
}

export type TextOnImageCardConfig = {
  aspectRatio?: CardMediaAspectRatio
  cardSize?: CardGridCardSize
}

export type CardMediaProps = {
  image?: string | null
  video?: string | null
  prefersReducedMotion: boolean
  aspectRatio?: CardMediaAspectRatio
}

export type CardTextProps = {
  title?: string | null
  description?: string | null
}

export type CardCtaHandler = (href: string) => void
