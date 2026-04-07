/** Optional copy merged into placeholders when importing from Figma REST API */

export type FigmaImportedContent = {
  hero?: {
    eyebrow?: string
    title?: string
    body?: string
    ctaText?: string
    cta2Text?: string
  }
  carousel?: {
    /** Small line above the section title (from Figma Heading → Eyebrow) */
    eyebrow?: string
    /** Section heading above the carousel (from Figma Heading → Title) */
    title?: string
    /** Section description (from Figma Heading → Description) */
    description?: string
    /** Carousel card size from root VARIANT (Compact / Medium / Large) */
    cardSize?: 'compact' | 'medium' | 'large'
    /** Optional section-level buttons */
    callToActions?: Array<{ label: string; link?: string }>
    items: Array<{
      title: string
      description?: string
      /** Card button label (media cards) */
      ctaText?: string
      /** Card link URL or path */
      link?: string
      /** Maps Figma card template VARIANT to Sanity cardItem.cardType */
      cardType?: 'mediaTextBelow' | 'colourFeatured'
      /** Per-card aspect from Figma (4:5, 8:5, 2:1) */
      aspectRatio?: '4:5' | '8:5' | '2:1'
    }>
  }
  mediaText5050?: {
    headline?: string
    items: Array<{ subtitle?: string; body?: string }>
  }
}
