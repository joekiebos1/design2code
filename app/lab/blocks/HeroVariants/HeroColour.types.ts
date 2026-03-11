/** Block surface: ghost, minimal, subtle, bold. Maps to SurfaceProvider + background. */
export type BlockSurface = 'ghost' | 'minimal' | 'subtle' | 'bold'

/** Block accent: primary, secondary, neutral. Maps to DS appearance tokens. */
export type BlockAccent = 'primary' | 'secondary' | 'neutral'

export type HeroColourContentLayout = 'stacked' | 'sideBySide' | 'mediaOverlay'
export type HeroColourContainerLayout = 'edgeToEdge' | 'contained'
export type HeroColourImageAnchor = 'center' | 'bottom'
export type HeroColourTextAlign = 'left' | 'center'

export type HeroColourProps = {
  productName?: string | null
  headline?: string | null
  subheadline?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  cta2Text?: string | null
  cta2Link?: string | null
  image?: string | null
  videoUrl?: string | null
  contentLayout?: HeroColourContentLayout | null
  containerLayout?: HeroColourContainerLayout | null
  imageAnchor?: HeroColourImageAnchor | null
  textAlign?: HeroColourTextAlign | null
  blockSurface?: BlockSurface | null
  blockAccent?: BlockAccent | null
}
