/** Shared props for Lab Hero variants – same elements as production HeroBlock */
export type HeroLabProps = {
  productName?: string | null
  headline?: string | null
  subheadline?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  cta2Text?: string | null
  cta2Link?: string | null
  image?: string | null
  /** Image position: left or right (for split layouts) */
  imagePosition?: 'left' | 'right'
}
