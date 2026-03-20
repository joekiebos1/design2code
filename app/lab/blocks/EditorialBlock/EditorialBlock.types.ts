export type GridPosition = { column?: number; row?: number } | null

export type EditorialBlockProps = {
  headline?: string | null
  body?: string | null
  backgroundImage?: string | null
  /** Background image position X: 0 = left, 50 = center, 100 = right. */
  backgroundImagePositionX?: number | null
  /** Background image position Y: 0 = top, 50 = center, 100 = bottom. */
  backgroundImagePositionY?: number | null
  image?: string | null
  videoUrl?: string | null
  ctaText?: string | null
  ctaLink?: string | null

  // Text — corner positions
  textTopLeft?: GridPosition
  textBottomRight?: GridPosition

  // Text style
  headlineSize?: 'display' | 'headline' | 'title'
  textAlign?: 'left' | 'center'
  textVerticalAlign?: 'center' | 'bottom'

  // Grid — desktop composition only (ignored when stacked)
  rows?: number

  // Image — corner positions
  imageTopLeft?: GridPosition
  imageBottomRight?: GridPosition

  // Image fit: cover (fill) or contain (fit)
  imageFit?: 'cover' | 'contain'

  // Layering
  textInFront?: boolean

  // Surface
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  surfaceColour?: 'primary' | 'secondary' | 'sparkle' | 'neutral'

  // Spacing
  spacingTop?: string | null
  spacingBottom?: string | null
}
