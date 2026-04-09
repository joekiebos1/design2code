/**
 * Block Inspiration – catalogue of all blocks with metadata.
 * Thumbnails are static images (provide per block as needed).
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
  thumbnail?: string
}

export const BLOCK_CATALOGUE: BlockCatalogueEntry[] = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Full-width hero section with eyebrow, title, body, media and CTAs. Supports stacked, side-by-side, category, media overlay and text-only layouts.',
    category: 'Page titles',
    tier: 'production',
    labSlug: 'hero',
    creativeUses: [
      'Product launch announcements with bold imagery',
      'Campaign landing with media overlay and centred text',
      'Category pages with colour band extending into media',
      'Text-only hero for editorial or minimal layouts',
    ],
  },
  {
    id: 'mediaText',
    name: 'Media + Text (Stacked)',
    description: 'Stacked or overlay layout with media above or behind text. Supports contained and edge-to-edge media.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'media-text',
    creativeUses: [
      'Feature highlights with image or video',
      'Overlay for dramatic full-bleed imagery',
      'Text-only variant for editorial sections',
    ],
  },
  {
    id: 'mediaText5050',
    name: 'Media + Text (50/50)',
    description: 'Side-by-side layout with paragraphs or accordion. Image position left or right.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'media-text-5050',
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
    creativeUses: [
      'Product imagery with rotation',
      'Brand or campaign visuals',
      'Featured content carousel',
    ],
  },
  {
    id: 'mediaZoomOutOnScroll',
    name: 'Media Zoom Out on Scroll',
    description: 'Media that zooms out as you scroll. Image or video.',
    category: 'Content blocks',
    tier: 'lab',
    labSlug: 'media-zoom-out-on-scroll',
    creativeUses: [
      'Immersive hero or section transitions',
      'Video with scroll-driven reveal',
      'Editorial or editorial-style layouts',
    ],
  },
  {
    id: 'topNav',
    name: 'Top Nav (Mega Menu)',
    description: 'Mega menu navigation. Supports dropdowns and links.',
    category: 'Navigation',
    tier: 'lab',
    labSlug: 'top-nav',
    creativeUses: [
      'Site navigation with mega menu',
      'Category browsing',
      'Header with dropdown panels',
    ],
  },
]
