/**
 * Block catalogue — shared metadata for all block types.
 * Used by Studio Block Inspiration (figma2code) and Lab Overview (dotcom).
 * Thumbnails are static images served from /block-thumbnails/ in each app's public dir.
 */

export type BlockCategory = 'Page titles' | 'Section titles' | 'Content blocks' | 'Carousels' | 'Navigation'

export type BlockCatalogueEntry = {
  id: string
  name: string
  description: string
  creativeUses: string[]
  category: BlockCategory
  tier: 'production' | 'lab'
  labSlug: string
  thumbnail: string
}

export const BLOCK_CATALOGUE: BlockCatalogueEntry[] = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Full-width hero section with eyebrow, title, body, media and CTAs. Supports stacked, side-by-side, category, media overlay and text-only layouts.',
    category: 'Page titles',
    tier: 'production',
    labSlug: 'hero',
    thumbnail: '/block-thumbnails/hero.svg',
    creativeUses: [
      'Product launch announcements with bold imagery',
      'Campaign landing with media overlay and centred text',
      'Category pages with colour band extending into media',
      'Text-only hero for editorial or minimal layouts',
    ],
  },
  {
    id: 'mediaText',
    name: 'Media + Text Stacked',
    description: 'Stacked or overlay layout with media above or behind text. Supports contained and edge-to-edge media.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'media-text-stacked',
    thumbnail: '/block-thumbnails/media-text-stacked.svg',
    creativeUses: [
      'Feature highlights with image or video',
      'Overlay for dramatic full-bleed imagery',
      'Text-only variant for editorial sections',
    ],
  },
  {
    id: 'mediaText5050',
    name: 'Media + Text 50/50',
    description: 'Side-by-side layout with paragraphs or accordion. Image position left or right.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'media-text-5050',
    thumbnail: '/block-thumbnails/media-text-5050.svg',
    creativeUses: [
      'Product specs with imagery',
      'FAQ or accordion with supporting visual',
      'Alternating content blocks down the page',
    ],
  },
  {
    id: 'cardGrid',
    name: 'Card Grid',
    description: 'Responsive grid of cards. Supports mediaTextBelow, mediaTextOverlay, and colour card variants.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'card-grid',
    thumbnail: '/block-thumbnails/card-grid.svg',
    creativeUses: [
      'Product or service showcases',
      'Feature grids with icons or imagery',
      'Promotional tiles with CTAs',
    ],
  },
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Horizontal carousel of cards. Compact, medium or large card sizes. Responsive column counts.',
    category: 'Carousels',
    tier: 'production',
    labSlug: 'carousel',
    thumbnail: '/block-thumbnails/carousel.svg',
    creativeUses: [
      'Product carousels on category pages',
      'Featured content or recommendations',
      'Testimonial or case study slides',
    ],
  },
  {
    id: 'proofPoints',
    name: 'Proof Points',
    description: 'Icon or stat variant. Highlights key benefits or metrics.',
    category: 'Section titles',
    tier: 'production',
    labSlug: 'proof-points',
    thumbnail: '/block-thumbnails/proof-points.svg',
    creativeUses: [
      'Feature benefits with icons',
      'Stats or numbers for credibility',
      'Trust signals on product pages',
    ],
  },
  {
    id: 'iconGrid',
    name: 'Icon Grid',
    description: 'Grid of icons with titles. Supports spectrum colours and accent colours.',
    category: 'Section titles',
    tier: 'production',
    labSlug: 'icon-grid',
    thumbnail: '/block-thumbnails/icon-grid.svg',
    creativeUses: [
      'Service or feature overview',
      'Category quick links',
      'Value propositions with icons',
    ],
  },
  {
    id: 'mediaTextAsymmetric',
    name: 'Media + Text Asymmetric',
    description: '1/3 + 2/3 layout. Paragraph rows, FAQ, links, or long form copy on the right.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'media-text-asymmetric',
    thumbnail: '/block-thumbnails/media-text-asymmetric.svg',
    creativeUses: [
      'FAQ sections',
      'Link lists or navigation',
      'Bullet-point features',
      'Long form copy with title on left',
    ],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: '12x6 grid composition. Text and image placed independently, can overlap. Optional background image.',
    category: 'Content blocks',
    tier: 'lab',
    labSlug: 'editorial',
    thumbnail: '/block-thumbnails/editorial.svg',
    creativeUses: [
      'Editorial storytelling with text and image overlap',
      'Campaign or feature layouts with custom composition',
      'Magazine-style content blocks',
    ],
  },
  {
    id: 'fullBleedVerticalCarousel',
    name: 'Full Bleed Vertical Carousel',
    description: 'Full-viewport vertical carousel. Each item has full-bleed media and scrolling text overlay.',
    category: 'Carousels',
    tier: 'lab',
    labSlug: 'full-bleed-vertical-carousel',
    thumbnail: '/block-thumbnails/full-bleed-vertical-carousel.svg',
    creativeUses: [
      'Product storytelling with immersive scroll',
      'Campaign narratives with multiple stories',
      'Editorial or editorial-style content',
    ],
  },
  {
    id: 'rotatingMedia',
    name: 'Rotating Media',
    description: 'Rotating carousel of media cards. Small, large or combined variants.',
    category: 'Carousels',
    tier: 'lab',
    labSlug: 'rotating-media',
    thumbnail: '/block-thumbnails/rotating-media.svg',
    creativeUses: [
      'Product imagery with rotation',
      'Brand or campaign visuals',
      'Featured content carousel',
    ],
  },
  {
    id: 'topNav',
    name: 'Top Nav (Mega Menu)',
    description: 'Mega menu navigation. Supports dropdowns and links.',
    category: 'Navigation',
    tier: 'lab',
    labSlug: 'top-nav',
    thumbnail: '/block-thumbnails/top-nav.svg',
    creativeUses: [
      'Site navigation with mega menu',
      'Category browsing',
      'Header with dropdown panels',
    ],
  },
]
