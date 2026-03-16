'use client'

/**
 * Block Inspiration – catalogue of all blocks with metadata and preview renderers.
 */

import React from 'react'
import {
  HeroBlock,
  MediaTextBlock,
  MediaText5050Block,
  CardGridBlock,
  CarouselBlock,
  ProofPointsBlock,
  IconGridBlock,
  ListBlock,
} from '../../blocks'
import {
  LabFullBleedVerticalCarousel,
  LabRotatingMediaBlock,
  LabMediaZoomOutOnScroll,
  LabTopNavBlock,
} from '../../lab/blocks'
import { SurfaceProvider } from '@marcelinodzn/ds-react'

const PLACEHOLDER = '/placeholder-preview.svg'

export type BlockCategory = 'Page titles' | 'Section titles' | 'Content blocks' | 'Carousels' | 'Navigation'

export type BlockCatalogueEntry = {
  id: string
  name: string
  description: string
  creativeUses: string[]
  category: BlockCategory
  /** Production or Lab */
  tier: 'production' | 'lab'
  /** Lab page slug for /lab/[slug]. */
  labSlug: string
  /** Renders a small preview of the block (for list thumbnails) */
  Preview: React.ComponentType
  /** Renders a full-size preview of the block (for the main preview area) */
  PreviewFull: React.ComponentType
}

const PREVIEW_SCALE = 0.18
const PREVIEW_WIDTH = 280
const PREVIEW_HEIGHT = 180
const PREVIEW_INNER_WIDTH = PREVIEW_WIDTH / PREVIEW_SCALE
const PREVIEW_INNER_HEIGHT = PREVIEW_HEIGHT / PREVIEW_SCALE

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-m)',
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--ds-color-background-ghost)',
      }}
    >
      <div
        style={{
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: 'top left',
          width: PREVIEW_INNER_WIDTH,
          height: PREVIEW_INNER_HEIGHT,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const BLOCK_CATALOGUE: BlockCatalogueEntry[] = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Full-width hero section with headline, subheadline, media and CTAs. Supports stacked, side-by-side, category, media overlay and text-only layouts.',
    category: 'Page titles',
    tier: 'production',
    labSlug: 'hero',
    creativeUses: [
      'Product launch announcements with bold imagery',
      'Campaign landing with media overlay and centred text',
      'Category pages with colour band extending into media',
      'Text-only hero for editorial or minimal layouts',
    ],
    Preview: () => (
      <PreviewFrame>
        <HeroBlock
          headline="Designed for the way you live"
          subheadline="Clean lines. Thoughtful details."
          ctaText="Shop now"
          image={PLACEHOLDER}
          contentLayout="stacked"
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <HeroBlock
        headline="Designed for the way you live"
        subheadline="Clean lines. Thoughtful details."
        ctaText="Shop now"
        image={PLACEHOLDER}
        contentLayout="stacked"
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <MediaTextBlock
          headline="Feature highlight"
          subhead="Supporting copy for the visual."
          media={{ type: 'image', src: PLACEHOLDER, aspectRatio: '2:1' }}
          variant="centered-media-below"
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <MediaTextBlock
        headline="Feature highlight"
        subhead="Supporting copy for the visual."
        media={{ type: 'image', src: PLACEHOLDER, aspectRatio: '2:1' }}
        variant="centered-media-below"
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <MediaText5050Block
          items={[{ subtitle: 'Feature', body: 'Supporting copy.' }]}
          media={{ type: 'image', src: PLACEHOLDER }}
          imagePosition="right"
          variant="paragraphs"
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <MediaText5050Block
        items={[{ subtitle: 'Feature', body: 'Supporting copy.' }]}
        media={{ type: 'image', src: PLACEHOLDER }}
        imagePosition="right"
        variant="paragraphs"
        emphasis="ghost"
      />
    ),
  },
  {
    id: 'cardGrid',
    name: 'Card Grid',
    description: 'Responsive grid of cards. Supports media cards, text-on-colour and text-on-image variants.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'card-grid',
    creativeUses: [
      'Product or service showcases',
      'Feature grids with icons or imagery',
      'Promotional tiles with CTAs',
    ],
    Preview: () => (
      <PreviewFrame>
        <CardGridBlock
          columns={3}
          items={[
            { title: 'Card 1', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
            { title: 'Card 2', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
            { title: 'Card 3', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
          ]}
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <CardGridBlock
        columns={3}
        items={[
          { title: 'Card 1', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
          { title: 'Card 2', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
          { title: 'Card 3', description: 'Desc', image: PLACEHOLDER, cardType: 'media-description-below' },
        ]}
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <CarouselBlock
          items={[
            { title: 'Card 1', description: 'Desc', image: PLACEHOLDER, cardType: 'media', aspectRatio: '4:5' },
            { title: 'Card 2', description: 'Desc', image: PLACEHOLDER, cardType: 'media', aspectRatio: '4:5' },
          ]}
          cardSize="medium"
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <CarouselBlock
        items={[
          { title: 'Card 1', description: 'Desc', image: PLACEHOLDER, cardType: 'media', aspectRatio: '4:5' },
          { title: 'Card 2', description: 'Desc', image: PLACEHOLDER, cardType: 'media', aspectRatio: '4:5' },
        ]}
        cardSize="medium"
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <ProofPointsBlock
          title="Why choose us"
          variant="icon"
          items={[
            { title: 'Fast', icon: 'IcCheckboxOn' },
            { title: 'Reliable', icon: 'IcCheckboxOn' },
            { title: 'Secure', icon: 'IcCheckboxOn' },
          ]}
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <ProofPointsBlock
        title="Why choose us"
        variant="icon"
        items={[
          { title: 'Fast', icon: 'IcCheckboxOn' },
          { title: 'Reliable', icon: 'IcCheckboxOn' },
          { title: 'Secure', icon: 'IcCheckboxOn' },
        ]}
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <IconGridBlock
          items={[
            { icon: 'IcStar', title: 'Feature 1', accentColor: 'primary' },
            { icon: 'IcStar', title: 'Feature 2', accentColor: 'primary' },
            { icon: 'IcStar', title: 'Feature 3', accentColor: 'primary' },
          ]}
          columns={3}
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <IconGridBlock
        items={[
          { icon: 'IcStar', title: 'Feature 1', accentColor: 'primary' },
          { icon: 'IcStar', title: 'Feature 2', accentColor: 'primary' },
          { icon: 'IcStar', title: 'Feature 3', accentColor: 'primary' },
        ]}
        columns={3}
        emphasis="ghost"
      />
    ),
  },
  {
    id: 'list',
    name: 'List',
    description: 'Text list, FAQ or links variant. Collapsible FAQ items.',
    category: 'Content blocks',
    tier: 'production',
    labSlug: 'list',
    creativeUses: [
      'FAQ sections',
      'Link lists or navigation',
      'Bullet-point features',
    ],
    Preview: () => (
      <PreviewFrame>
        <ListBlock
          blockTitle="FAQ"
          listVariant="faq"
          items={[
            { title: 'Question 1?', body: 'Answer.' },
            { title: 'Question 2?', body: 'Answer.' },
          ]}
          emphasis="ghost"
        />
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <ListBlock
        blockTitle="FAQ"
        listVariant="faq"
        items={[
          { title: 'Question 1?', body: 'Answer.' },
          { title: 'Question 2?', body: 'Answer.' },
        ]}
        emphasis="ghost"
      />
    ),
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
    Preview: () => (
      <PreviewFrame>
        <SurfaceProvider level={0}>
          <LabFullBleedVerticalCarousel
            emphasis="ghost"
            items={[
              { title: 'Story 1', description: 'Description.', image: PLACEHOLDER },
              { title: 'Story 2', description: 'Description.', image: PLACEHOLDER },
            ]}
          />
        </SurfaceProvider>
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <SurfaceProvider level={0}>
        <LabFullBleedVerticalCarousel
          emphasis="ghost"
          items={[
            { title: 'Story 1', description: 'Description.', image: PLACEHOLDER },
            { title: 'Story 2', description: 'Description.', image: PLACEHOLDER },
          ]}
        />
      </SurfaceProvider>
    ),
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
    Preview: () => (
      <PreviewFrame>
        <SurfaceProvider level={0}>
          <LabRotatingMediaBlock
            variant="small"
            emphasis="ghost"
            items={[
              { image: PLACEHOLDER, title: 'Card 1', label: 'Label' },
              { image: PLACEHOLDER, title: 'Card 2', label: 'Label' },
            ]}
          />
        </SurfaceProvider>
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <SurfaceProvider level={0}>
        <LabRotatingMediaBlock
          variant="small"
          emphasis="ghost"
          items={[
            { image: PLACEHOLDER, title: 'Card 1', label: 'Label' },
            { image: PLACEHOLDER, title: 'Card 2', label: 'Label' },
          ]}
        />
      </SurfaceProvider>
    ),
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
    Preview: () => (
      <PreviewFrame>
        <SurfaceProvider level={0}>
          <LabMediaZoomOutOnScroll image={PLACEHOLDER} alt="Preview" />
        </SurfaceProvider>
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <SurfaceProvider level={0}>
        <LabMediaZoomOutOnScroll image={PLACEHOLDER} alt="Preview" />
      </SurfaceProvider>
    ),
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
    Preview: () => (
      <PreviewFrame>
        <SurfaceProvider level={0}>
          <LabTopNavBlock />
        </SurfaceProvider>
      </PreviewFrame>
    ),
    PreviewFull: () => (
      <SurfaceProvider level={0}>
        <LabTopNavBlock />
      </SurfaceProvider>
    ),
  },
]
