#!/usr/bin/env node
/**
 * Seed Sanity with Lab page content only.
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_API_TOKEN (write token from sanity.io/manage)
 * Run: node --env-file=.env scripts/seed-sanity.mjs
 *
 * Seeds: Lab block pages, marketing pages (About Us, Story of Jio, JioTag). Sanity export merge applies to lab routes where noted.
 * Images: Uses Sanity Media Library (image assets) only. If empty, uploads public/placeholder-preview.svg.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { buildStoryOfJioSections } from './story-of-jio-sections.mjs'
import { buildJioTagPageSections } from './jiotag-page-sections.mjs'
import { buildMediaTextAsymmetricLabPageSections } from './lab-media-text-asymmetric-page-sections.mjs'
import { buildLabMediaText5050PageSections } from './lab-media-text-5050-page-sections.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env (from sanity.io/manage)')
  process.exit(1)
}

if (!token) {
  console.error('Set SANITY_API_TOKEN in .env (create a token with Editor permissions at sanity.io/manage)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const SEED_LIST_LONG_FORM_BODY =
  'We believe in creating products that stand the test of time. Every detail is considered—from the materials we source to the craftsmanship that goes into each piece. Our commitment to quality means you get furniture that not only looks beautiful but lasts for generations.\n\nFounded over two decades ago, we started with a simple idea: design should be honest, functional, and meaningful. Today, that philosophy guides everything we do.\n\nWe work with artisans and makers from around the world who share our values. Each collaboration brings new techniques and traditions into our collection, ensuring that every piece tells a story beyond its function. Sustainability runs through our entire process—from responsibly sourced materials to packaging designed for a second life.\n\nOur showrooms are designed as places to slow down and experience the pieces in context. We want you to feel the weight of a drawer, the grain of the wood, the way light falls across a surface. These are the details that matter when you live with something every day.\n\nThank you for trusting us with your space. We are honoured to be part of the stories you build at home—the meals shared, the conversations had, the quiet moments that make a house feel like yours.'

async function seed() {
  console.log('Seeding Sanity...')

  // Remove legacy home/product pages and deprecated labPage singleton
  const legacyIds = ['page-home', 'page-product', 'labPage', 'labBlockPage-cards']
  for (const id of legacyIds) {
    try {
      await client.delete(id)
      console.log(`Removed ${id}`)
    } catch {
      // Document may not exist
    }
  }

  // Use images from Sanity Image Library only (no external URLs, no imageUrl fallbacks)
  let imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id }`)
  let assetIds = imageAssets.map((a) => a._id)

  if (assetIds.length === 0) {
    console.log('Media Library has no images. Uploading placeholder from public/placeholder-preview.svg...')
    const placeholderPath = join(__dirname, '../public/placeholder-preview.svg')
    const buffer = readFileSync(placeholderPath)
    const asset = await client.assets.upload('image', buffer, {
      contentType: 'image/svg+xml',
      filename: 'placeholder-preview.svg',
    })
    assetIds = [asset._id]
    console.log(`Uploaded 1 placeholder image. Using ${assetIds.length} image(s).`)
  } else {
    console.log(`Using ${assetIds.length} image(s) from Media Library`)
  }

  const getAsset = (i) => (assetIds.length > 0 ? assetIds[i % assetIds.length] : null)
  const imageRef = (id) => id ? { _type: 'image', asset: { _type: 'reference', _ref: id } } : undefined

  const LAB_MEDIA_URL = 'https://storage.googleapis.com/mannequin/blobs/4627df29-fe27-4e9c-b58f-8077848e265f.mp4'

  // Merge with Sanity export – preserve existing content, only add/update editorial and carousel
  let sanityExport = null
  try {
    const exportPath = join(__dirname, 'sanity-export.json')
    sanityExport = JSON.parse(readFileSync(exportPath, 'utf-8'))
    console.log('Using sanity-export.json for merge (preserving existing pages)')
  } catch {
    console.log('No sanity-export.json found – run: node --env-file=.env scripts/export-sanity-for-seed.mjs first')
  }

  const stripSanityMeta = (doc) => {
    const { _rev, _createdAt, _updatedAt, _system, ...rest } = doc
    return rest
  }

  /** Lab overview link row per `labBlockPage` (Media + Text Asymmetric · links). */
  function buildLabOverviewNavItemsFromPages(pages) {
    return pages.map((p) => ({
      _type: 'mediaTextAsymmetricItem',
      _key: String(p.slug ?? p._id ?? 'item')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/^-+|-+$/g, '') || 'item',
      subtitle: p.title,
      linkUrl: `/lab/${p.slug}`,
    }))
  }

  // Build labBlockPages: use export for existing pages, add editorial (5 blocks), replace carousel (3 carousels)
  const SLUG_ORDER = ['top-nav', 'hero', 'media-text', 'media-text-5050', 'carousel', 'card-grid', 'editorial', 'icon-grid', 'proof-points', 'media-text-asymmetric', 'full-bleed-vertical-carousel', 'rotating-media', 'media-zoom-out-on-scroll']

  const editorialPage = {
    _type: 'labBlockPage',
    _id: 'labBlockPage-editorial',
    slug: 'editorial',
    title: 'Editorial',
    sections: [
      {
        _type: 'editorialBlock',
        _key: 'ed-1-display',
        headline: 'Designer-crafted moments',
        body: 'Text and image placed independently on a 12×6 grid. Display headline, ghost emphasis, text behind image.',
        image: imageRef(getAsset(0)),
        ctaText: 'Learn more',
        ctaLink: '#',
        textArea: { topLeft: { column: 1, row: 2 }, bottomRight: { column: 6, row: 4 } },
        imageArea: { topLeft: { column: 5, row: 1 }, bottomRight: { column: 12, row: 6 } },
        textInFront: false,
        headlineSize: 'display',
        emphasis: 'ghost',
        spacingTop: 'large',
        spacingBottom: 'large',
      },
      {
        _type: 'editorialBlock',
        _key: 'ed-2-offset',
        headline: 'Offset composition',
        body: 'Text block and image block can overlap. Z-index controls layering. Headline size, minimal surface.',
        image: imageRef(getAsset(1)),
        textArea: { topLeft: { column: 1, row: 1 }, bottomRight: { column: 6, row: 3 } },
        imageArea: { topLeft: { column: 5, row: 2 }, bottomRight: { column: 12, row: 6 } },
        textInFront: true,
        headlineSize: 'headline',
        emphasis: 'minimal',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'large',
      },
      {
        _type: 'editorialBlock',
        _key: 'ed-3-title',
        headline: 'Compact title size',
        body: 'Title-level typography. Centre-aligned text, vertical centre. Subtle emphasis, secondary surface.',
        image: imageRef(getAsset(2)),
        textArea: { topLeft: { column: 2, row: 2 }, bottomRight: { column: 11, row: 5 } },
        imageArea: { topLeft: { column: 1, row: 1 }, bottomRight: { column: 12, row: 6 } },
        textInFront: true,
        headlineSize: 'title',
        textAlign: 'center',
        textVerticalAlign: 'center',
        emphasis: 'subtle',
        surfaceColour: 'secondary',
        spacingTop: 'large',
        spacingBottom: 'large',
      },
      {
        _type: 'editorialBlock',
        _key: 'ed-4-bold',
        headline: 'Bold editorial',
        body: 'Strong emphasis with sparkle surface. Text in front, full grid coverage.',
        image: imageRef(getAsset(3)),
        ctaText: 'Explore',
        ctaLink: '#',
        textArea: { topLeft: { column: 1, row: 1 }, bottomRight: { column: 8, row: 6 } },
        imageArea: { topLeft: { column: 7, row: 2 }, bottomRight: { column: 12, row: 5 } },
        textInFront: true,
        headlineSize: 'headline',
        emphasis: 'bold',
        surfaceColour: 'sparkle',
        spacingTop: 'large',
        spacingBottom: 'large',
      },
      {
        _type: 'editorialBlock',
        _key: 'ed-5-right',
        headline: 'Image left, text right',
        body: 'Reversed layout. Image spans left columns, text on the right. Neutral surface.',
        image: imageRef(getAsset(4)),
        textArea: { topLeft: { column: 7, row: 2 }, bottomRight: { column: 12, row: 4 } },
        imageArea: { topLeft: { column: 1, row: 1 }, bottomRight: { column: 6, row: 6 } },
        textInFront: true,
        headlineSize: 'title',
        emphasis: 'minimal',
        surfaceColour: 'neutral',
        spacingTop: 'large',
        spacingBottom: 'large',
      },
    ],
  }

  const carouselPage = {
    _type: 'labBlockPage',
    _id: 'labBlockPage-carousel',
    slug: 'carousel',
    title: 'Carousel',
    sections: [
      {
        _type: 'labCarousel',
        _key: 'car-small',
        title: 'Small · Compact carousel',
        cardSize: 'compact',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'large',
        items: [
          { _type: 'labCardItem', _key: 'i1', cardType: 'media-description-below', title: 'Card 1', description: 'Media below, 4:5.', image: imageRef(getAsset(0)), aspectRatio: '4:5' },
          { _type: 'labCardItem', _key: 'i2', cardType: 'media-description-inside', title: 'Overlay card', description: 'Text on image.', image: imageRef(getAsset(1)), aspectRatio: '4:5' },
          { _type: 'labCardItem', _key: 'i3', cardType: 'media-description-below', title: 'Card 3', description: '8:5 aspect.', image: imageRef(getAsset(2)), aspectRatio: '8:5' },
          { _type: 'labCardItem', _key: 'i4', cardType: 'media-description-below', title: 'Card 4', description: 'Compact.', image: imageRef(getAsset(3)), aspectRatio: '4:5' },
          { _type: 'labCardItem', _key: 'i5', cardType: 'media-description-inside', title: 'Card 5', description: 'Inside overlay.', image: imageRef(getAsset(4)), aspectRatio: '4:5' },
        ],
      },
      {
        _type: 'labCarousel',
        _key: 'car-medium',
        title: 'Medium · Mixed cards',
        cardSize: 'medium',
        emphasis: 'minimal',
        surfaceColour: 'secondary',
        spacingTop: 'large',
        spacingBottom: 'large',
        items: [
          { _type: 'labCardItem', _key: 'i1', cardType: 'media-description-below', title: 'Medium 1', description: '4:5 media below.', image: imageRef(getAsset(5)) },
          { _type: 'labCardItem', _key: 'i2', cardType: 'media-description-inside', title: 'Medium 2', description: 'Text overlay.', image: imageRef(getAsset(6)) },
          { _type: 'labCardItem', _key: 'i3', cardType: 'media-description-below', title: 'Medium 3', description: 'Media below.', image: imageRef(getAsset(7)) },
          { _type: 'labCardItem', _key: 'i4', cardType: 'media-description-below', title: 'Medium 4', description: '4:5.', image: imageRef(getAsset(0)) },
        ],
      },
      {
        _type: 'labCarousel',
        _key: 'car-large',
        title: 'Large · Bold carousel',
        cardSize: 'large',
        emphasis: 'bold',
        surfaceColour: 'sparkle',
        spacingTop: 'large',
        spacingBottom: 'large',
        items: [
          { _type: 'labCardItem', _key: 'i1', cardType: 'media-description-below', title: 'Large card 1', description: '2:1 aspect, full width.', image: imageRef(getAsset(7)), aspectRatio: '2:1' },
          { _type: 'labCardItem', _key: 'i2', cardType: 'media-description-inside', title: 'Large overlay', description: 'Text on image.', image: imageRef(getAsset(8)), aspectRatio: '2:1' },
          { _type: 'labCardItem', _key: 'i3', cardType: 'media-description-below', title: 'Large card 3', description: '2:1.', image: imageRef(getAsset(0)), aspectRatio: '2:1' },
        ],
      },
    ],
  }

  let labBlockPages
  if (sanityExport?.labBlockPages?.length) {
    const published = sanityExport.labBlockPages.filter((p) => !String(p._id).startsWith('drafts.'))
    const bySlug = Object.fromEntries(published.map((p) => [p.slug, stripSanityMeta(p)]))
    // Preserve from export when available; fall back to seed defaults for editorial and carousel
    const merged = []
    for (const slug of SLUG_ORDER) {
      if (slug === 'editorial') merged.push(bySlug['editorial'] ?? editorialPage)
      else if (slug === 'carousel') merged.push(bySlug['carousel'] ?? carouselPage)
      else if (slug === 'top-nav' && !bySlug[slug]) merged.push({ _type: 'labBlockPage', _id: 'labBlockPage-top-nav', slug: 'top-nav', title: 'Top nav (mega menu)', sections: [{ _type: 'topNavBlock', _key: 'top-nav' }] })
      else if (slug === 'media-text-asymmetric') {
        const page = bySlug['media-text-asymmetric']
        merged.push({
          _type: 'labBlockPage',
          _id: page?._id ?? 'labBlockPage-media-text-asymmetric',
          slug: 'media-text-asymmetric',
          title: 'Media + Text Asymmetric',
          sections: buildMediaTextAsymmetricLabPageSections(getAsset, imageRef),
        })
      } else if (slug === 'media-text-5050') {
        const page = bySlug['media-text-5050']
        merged.push({
          _type: 'labBlockPage',
          _id: page?._id ?? 'labBlockPage-media-text-5050',
          slug: 'media-text-5050',
          title: 'Media + Text: 50/50',
          sections: buildLabMediaText5050PageSections(getAsset, imageRef),
        })
      } else if (bySlug[slug]) {
        merged.push(bySlug[slug])
      }
    }
    // Add any export pages not in SLUG_ORDER
    for (const slug of Object.keys(bySlug)) {
      if (!SLUG_ORDER.includes(slug) && slug !== 'editorial' && slug !== 'carousel')
        merged.push(bySlug[slug])
    }
    labBlockPages = merged
    console.log(`Merged ${labBlockPages.length} lab block pages (from export + editorial + carousel)`)
  } else {
    // Fallback: use seed-only (no export)
    const sharedHeroFields = {
      productName: 'Product Name',
      headline: 'Designed for the way you live.',
      subheadline: 'Clean lines. Thoughtful details. Built to last.',
      ctaText: 'Shop now',
      ctaLink: '#',
      cta2Text: 'Learn more',
      cta2Link: '#',
    }
    labBlockPages = [
      {
        _type: 'labBlockPage',
        _id: 'labBlockPage-hero',
      slug: 'hero',
      title: 'Hero',
      sections: [
        { _type: 'hero', _key: 'hero-textonly', ...sharedHeroFields, contentLayout: 'textOnly', emphasis: 'ghost', surfaceColour: 'primary', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-stacked', ...sharedHeroFields, contentLayout: 'stacked', emphasis: 'minimal', surfaceColour: 'secondary', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-sidebyside-edge-center', ...sharedHeroFields, image: imageRef(getAsset(0)), contentLayout: 'sideBySide', containerLayout: 'edgeToEdge', imageAnchor: 'center', emphasis: 'subtle', surfaceColour: 'primary', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-sidebyside-edge-bottom', ...sharedHeroFields, videoUrl: LAB_MEDIA_URL, contentLayout: 'sideBySide', containerLayout: 'edgeToEdge', imageAnchor: 'bottom', emphasis: 'ghost', surfaceColour: 'sparkle', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-sidebyside-contained-center', ...sharedHeroFields, image: imageRef(getAsset(0)), contentLayout: 'sideBySide', containerLayout: 'contained', imageAnchor: 'center', emphasis: 'minimal', surfaceColour: 'neutral', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-sidebyside-contained-bottom', ...sharedHeroFields, image: imageRef(getAsset(0)), contentLayout: 'sideBySide', containerLayout: 'contained', imageAnchor: 'bottom', emphasis: 'subtle', surfaceColour: 'primary', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-category', ...sharedHeroFields, videoUrl: LAB_MEDIA_URL, contentLayout: 'category', emphasis: 'bold', surfaceColour: 'secondary', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-mediaoverlay-left', ...sharedHeroFields, videoUrl: LAB_MEDIA_URL, contentLayout: 'mediaOverlay', textAlign: 'left', emphasis: 'ghost', surfaceColour: 'neutral', spacingBottom: 'large' },
        { _type: 'hero', _key: 'hero-mediaoverlay-center', ...sharedHeroFields, videoUrl: LAB_MEDIA_URL, contentLayout: 'mediaOverlay', textAlign: 'center', emphasis: 'minimal', surfaceColour: 'primary', spacingBottom: 'large' },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-media-text',
      slug: 'media-text',
      title: 'Media + Text: Stacked',
      sections: [
        { _type: 'mediaTextStacked', _key: 'mtb-textonly', template: 'TextOnly', alignment: 'center', title: 'Text only', body: 'No media. Centred text layout.', emphasis: 'ghost', surfaceColour: 'primary', spacingTop: 'large', spacingBottom: 'large' },
        { _type: 'mediaTextStacked', _key: 'mtb-stacked', template: 'Stacked', mediaSize: 'edgeToEdge', alignment: 'left', title: 'Stacked edge to edge', body: 'Text and image stacked, full viewport.', image: imageRef(getAsset(0)), emphasis: 'minimal', surfaceColour: 'secondary', spacingTop: 'large', spacingBottom: 'large' },
        { _type: 'mediaTextStacked', _key: 'mtb-stacked-contained', template: 'Stacked', mediaSize: 'default', alignment: 'left', title: 'Stacked contained', body: 'Text and image stacked, within grid.', image: imageRef(getAsset(1)), emphasis: 'subtle', surfaceColour: 'neutral', spacingTop: 'large', spacingBottom: 'large' },
        { _type: 'mediaTextStacked', _key: 'mtb-overlay', template: 'Overlay', mediaSize: 'edgeToEdge', alignment: 'left', title: 'Overlay edge to edge', body: 'Text on top of image, full viewport.', videoUrl: LAB_MEDIA_URL, emphasis: 'ghost', surfaceColour: 'sparkle', spacingTop: 'large', spacingBottom: 'large' },
        { _type: 'mediaTextStacked', _key: 'mtb-overlay-contained', template: 'Overlay', mediaSize: 'default', alignment: 'center', title: 'Overlay contained', body: 'Text on top of image, within grid.', image: imageRef(getAsset(0)), emphasis: 'minimal', surfaceColour: 'primary', spacingTop: 'large', spacingBottom: 'large' },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-media-text-5050',
      slug: 'media-text-5050',
      title: 'Media + Text: 50/50',
      sections: buildLabMediaText5050PageSections(getAsset, imageRef),
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-full-bleed-vertical-carousel',
      slug: 'full-bleed-vertical-carousel',
      title: 'Full bleed vertical carousel',
      sections: [
        {
          _type: 'fullBleedVerticalCarousel',
          _key: 'fbvc-ghost',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i1', title: 'First story', description: 'Add an image or video. This text scrolls as you move through the carousel.', image: imageRef(getAsset(0)) },
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i2', title: 'Second story', description: 'Each item gets its own full-bleed media and text overlay.', image: imageRef(getAsset(1)) },
          ],
        },
        {
          _type: 'fullBleedVerticalCarousel',
          _key: 'fbvc-minimal',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i1', title: 'First story', description: 'Add an image or video. This text scrolls as you move through the carousel.', image: imageRef(getAsset(0)) },
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i2', title: 'Second story', description: 'Each item gets its own full-bleed media and text overlay.', image: imageRef(getAsset(1)) },
          ],
        },
        {
          _type: 'fullBleedVerticalCarousel',
          _key: 'fbvc-subtle',
          emphasis: 'subtle',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i1', title: 'First story', description: 'Add an image or video. This text scrolls as you move through the carousel.', image: imageRef(getAsset(0)) },
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i2', title: 'Second story', description: 'Each item gets its own full-bleed media and text overlay.', image: imageRef(getAsset(1)) },
          ],
        },
        {
          _type: 'fullBleedVerticalCarousel',
          _key: 'fbvc-bold',
          emphasis: 'bold',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i1', title: 'First story', description: 'Add an image or video. This text scrolls as you move through the carousel.', image: imageRef(getAsset(0)) },
            { _type: 'fullBleedVerticalCarouselItem', _key: 'i2', title: 'Second story', description: 'Each item gets its own full-bleed media and text overlay.', image: imageRef(getAsset(1)) },
          ],
        },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-rotating-media',
      slug: 'rotating-media',
      title: 'Rotating media',
      sections: [
        {
          _type: 'rotatingMedia',
          _key: 'rm-small',
          variant: 'small',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'rotatingMediaItem', _key: 'm1', image: imageRef(getAsset(2)), title: 'Card 1', label: 'Label 1' },
            { _type: 'rotatingMediaItem', _key: 'm2', image: imageRef(getAsset(3)), title: 'Card 2', label: 'Label 2' },
            { _type: 'rotatingMediaItem', _key: 'm3', image: imageRef(getAsset(4)), title: 'Card 3', label: 'Label 3' },
            { _type: 'rotatingMediaItem', _key: 'm4', image: imageRef(getAsset(5)), title: 'Card 4', label: 'Label 4' },
            { _type: 'rotatingMediaItem', _key: 'm5', image: imageRef(getAsset(6)), title: 'Card 5', label: 'Label 5' },
            { _type: 'rotatingMediaItem', _key: 'm6', image: imageRef(getAsset(7)), title: 'Card 6', label: 'Label 6' },
          ],
        },
        {
          _type: 'rotatingMedia',
          _key: 'rm-large',
          variant: 'large',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'rotatingMediaItem', _key: 'm1', image: imageRef(getAsset(2)), title: 'Card 1', label: 'Label 1' },
            { _type: 'rotatingMediaItem', _key: 'm2', image: imageRef(getAsset(3)), title: 'Card 2', label: 'Label 2' },
            { _type: 'rotatingMediaItem', _key: 'm3', image: imageRef(getAsset(4)), title: 'Card 3', label: 'Label 3' },
            { _type: 'rotatingMediaItem', _key: 'm4', image: imageRef(getAsset(5)), title: 'Card 4', label: 'Label 4' },
            { _type: 'rotatingMediaItem', _key: 'm5', image: imageRef(getAsset(6)), title: 'Card 5', label: 'Label 5' },
            { _type: 'rotatingMediaItem', _key: 'm6', image: imageRef(getAsset(7)), title: 'Card 6', label: 'Label 6' },
          ],
        },
        {
          _type: 'rotatingMedia',
          _key: 'rm-combined',
          variant: 'combined',
          emphasis: 'subtle',
          surfaceColour: 'neutral',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'rotatingMediaItem', _key: 'm1', image: imageRef(getAsset(2)), title: 'Card 1', label: 'Label 1' },
            { _type: 'rotatingMediaItem', _key: 'm2', image: imageRef(getAsset(3)), title: 'Card 2', label: 'Label 2' },
            { _type: 'rotatingMediaItem', _key: 'm3', image: imageRef(getAsset(4)), title: 'Card 3', label: 'Label 3' },
            { _type: 'rotatingMediaItem', _key: 'm4', image: imageRef(getAsset(5)), title: 'Card 4', label: 'Label 4' },
            { _type: 'rotatingMediaItem', _key: 'm5', image: imageRef(getAsset(6)), title: 'Card 5', label: 'Label 5' },
            { _type: 'rotatingMediaItem', _key: 'm6', image: imageRef(getAsset(7)), title: 'Card 6', label: 'Label 6' },
          ],
        },
        {
          _type: 'rotatingMedia',
          _key: 'rm-small-bold',
          variant: 'small',
          emphasis: 'bold',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'rotatingMediaItem', _key: 'm1', image: imageRef(getAsset(2)), title: 'Card 1', label: 'Label 1' },
            { _type: 'rotatingMediaItem', _key: 'm2', image: imageRef(getAsset(3)), title: 'Card 2', label: 'Label 2' },
            { _type: 'rotatingMediaItem', _key: 'm3', image: imageRef(getAsset(4)), title: 'Card 3', label: 'Label 3' },
            { _type: 'rotatingMediaItem', _key: 'm4', image: imageRef(getAsset(5)), title: 'Card 4', label: 'Label 4' },
            { _type: 'rotatingMediaItem', _key: 'm5', image: imageRef(getAsset(6)), title: 'Card 5', label: 'Label 5' },
            { _type: 'rotatingMediaItem', _key: 'm6', image: imageRef(getAsset(7)), title: 'Card 6', label: 'Label 6' },
          ],
        },
      ],
    },
    carouselPage,
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-card-grid',
      slug: 'card-grid',
      title: 'Card grid',
      sections: [
        // 1. Layout variants: 2, 3, 4 columns
        {
          _type: 'labCardGrid',
          _key: 'cg-2-cols',
          columns: '2',
          title: '2 columns · Media below',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Image with text below. CTA optional.', image: imageRef(getAsset(0)), ctaText: 'Learn more', ctaLink: '#' },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Image with text below.', image: imageRef(getAsset(1)) },
          ],
        },
        {
          _type: 'labCardGrid',
          _key: 'cg-3-cols',
          columns: '3',
          title: '3 columns · Media below',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Description for card 1.', image: imageRef(getAsset(2)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Description for card 2.', image: imageRef(getAsset(3)) },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Description for card 3.', image: imageRef(getAsset(4)) },
          ],
        },
        {
          _type: 'labCardGrid',
          _key: 'cg-4-cols',
          columns: '4',
          title: '4 columns · Media below',
          emphasis: 'ghost',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Short.', image: imageRef(getAsset(5)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Short.', image: imageRef(getAsset(6)) },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Short.', image: imageRef(getAsset(7)) },
            { _type: 'labCardItem', _key: 'c4', cardType: 'media-description-below', title: 'Card 4', description: 'Short.', image: imageRef(getAsset(0)) },
          ],
        },
        // 2. Media card type: inside (text overlay)
        {
          _type: 'labCardGrid',
          _key: 'cg-media-inside',
          columns: '3',
          title: 'Media + description inside · Text overlay on image',
          emphasis: 'subtle',
          surfaceColour: 'neutral',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-inside', title: 'Overlay card 1', description: 'Text over image.', image: imageRef(getAsset(1)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-inside', title: 'Overlay card 2', description: 'Text over image.', image: imageRef(getAsset(2)) },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-inside', title: 'Overlay card 3', description: 'Text over image.', image: imageRef(getAsset(3)) },
          ],
        },
        // 3. Text inside: large (headline + description) — colour picker: primary-bold, secondary-bold, sparkle-bold
        {
          _type: 'labCardGrid',
          _key: 'lab-text-large',
          columns: '3',
          title: 'Text inside · Large (headline + description)',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'text-on-colour', size: 'large', title: 'Primary bold', description: 'Headline and description with background colour.', backgroundColor: 'primary-bold' },
            { _type: 'labCardItem', _key: 'c2', cardType: 'text-on-colour', size: 'large', title: 'Secondary bold', description: 'Headline and description with background colour.', backgroundColor: 'secondary-bold' },
            { _type: 'labCardItem', _key: 'c3', cardType: 'text-on-colour', size: 'large', title: 'Sparkle bold', description: 'Headline and description with background colour.', backgroundColor: 'sparkle-bold' },
          ],
        },
        // 4. Text inside: small (icon, CTAs, features) — colour picker: primary-subtle, secondary-subtle, spectrum
        {
          _type: 'labCardGrid',
          _key: 'lab-text-small',
          columns: '3',
          title: 'Text inside · Small (icon, CTAs, features)',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'text-on-colour', size: 'small', title: 'Feature card 1', description: 'With icon and CTA.', icon: 'IcWifiNetwork', backgroundColor: 'primary-subtle', callToActionButtons: [{ _key: 'b1', label: 'Learn more', link: '#', style: 'filled' }] },
            { _type: 'labCardItem', _key: 'c2', cardType: 'text-on-colour', size: 'small', title: 'Feature card 2', description: 'With features list.', backgroundColor: 'secondary-subtle', features: ['Feature A', 'Feature B', 'Feature C'] },
            { _type: 'labCardItem', _key: 'c3', cardType: 'text-on-colour', size: 'small', title: 'Spectrum card', description: 'reliance.800 from full spectrum.', backgroundColor: 'reliance.800', callToActionButtons: [{ _key: 'b1', label: 'Explore', link: '#', style: 'outlined' }] },
          ],
        },
        // 5. Mixed: media + text inside in one grid
        {
          _type: 'labCardGrid',
          _key: 'cg-mixed',
          columns: '3',
          title: 'Mixed: media cards + text inside cards',
          emphasis: 'bold',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Media below', description: 'Image with text underneath.', image: imageRef(getAsset(4)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'text-on-colour', size: 'large', title: 'Text inside', description: 'Coloured card in same grid.', backgroundColor: 'primary-bold' },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-inside', title: 'Media inside', description: 'Text overlay on image.', image: imageRef(getAsset(5)) },
          ],
        },
        // 6. Block surface variants: minimal, bold (1–2 examples)
        {
          _type: 'labCardGrid',
          _key: 'cg-surface-minimal',
          columns: '3',
          title: 'Surface: Minimal',
          emphasis: 'minimal',
          surfaceColour: 'neutral',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Light tint background.', image: imageRef(getAsset(6)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Light tint background.', image: imageRef(getAsset(7)) },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Light tint background.', image: imageRef(getAsset(0)) },
          ],
        },
        {
          _type: 'labCardGrid',
          _key: 'cg-surface-bold',
          columns: '3',
          title: 'Surface: Bold',
          emphasis: 'bold',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'labCardItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Strong tint, inverted text.', image: imageRef(getAsset(1)) },
            { _type: 'labCardItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Strong tint, inverted text.', image: imageRef(getAsset(2)) },
            { _type: 'labCardItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Strong tint, inverted text.', image: imageRef(getAsset(3)) },
          ],
        },
      ],
    },
    editorialPage,
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-icon-grid',
      slug: 'icon-grid',
      title: 'Icon grid',
      sections: [
        {
          _type: 'iconGrid',
          _key: 'ig-ghost',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'iconGridItem', _key: 'i1', title: 'Connectivity', body: 'Stay connected', icon: 'IcWifiNetwork', accentColor: 'primary' },
            { _type: 'iconGridItem', _key: 'i2', title: 'Home', body: 'Smart home', icon: 'IcHome', accentColor: 'secondary' },
            { _type: 'iconGridItem', _key: 'i3', title: 'Entertainment', body: 'Stream content', icon: 'IcEntertainment', accentColor: 'tertiary' },
            { _type: 'iconGridItem', _key: 'i4', title: 'Finance', body: 'Manage money', icon: 'IcWallet', accentColor: 'primary' },
          ],
        },
        {
          _type: 'iconGrid',
          _key: 'ig-bold',
          emphasis: 'bold',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'iconGridItem', _key: 'i1', title: 'Connectivity', body: 'Stay connected', icon: 'IcWifiNetwork', accentColor: 'primary' },
            { _type: 'iconGridItem', _key: 'i2', title: 'Home', body: 'Smart home', icon: 'IcHome', accentColor: 'secondary' },
            { _type: 'iconGridItem', _key: 'i3', title: 'Entertainment', body: 'Stream content', icon: 'IcEntertainment', accentColor: 'tertiary' },
            { _type: 'iconGridItem', _key: 'i4', title: 'Finance', body: 'Manage money', icon: 'IcWallet', accentColor: 'primary' },
          ],
        },
        {
          _type: 'iconGrid',
          _key: 'ig-4col',
          columns: 4,
          emphasis: 'minimal',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'iconGridItem', _key: 'i1', title: 'Connectivity', body: 'Stay connected', icon: 'IcWifiNetwork', accentColor: 'primary' },
            { _type: 'iconGridItem', _key: 'i2', title: 'Home', body: 'Smart home', icon: 'IcHome', accentColor: 'secondary' },
            { _type: 'iconGridItem', _key: 'i3', title: 'Entertainment', body: 'Stream content', icon: 'IcEntertainment', accentColor: 'tertiary' },
            { _type: 'iconGridItem', _key: 'i4', title: 'Finance', body: 'Manage money', icon: 'IcWallet', accentColor: 'primary' },
          ],
        },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-proof-points',
      slug: 'proof-points',
      title: 'Proof points',
      sections: [
        {
          _type: 'proofPoints',
          _key: 'pp-icon-ghost',
          title: 'Proof points',
          variant: 'icon',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _key: 'p1', title: 'Fast delivery', description: 'Same-day shipping', icon: 'IcCheckboxOn' },
            { _key: 'p2', title: 'Secure payments', description: 'Encrypted checkout', icon: 'IcCheckboxOn' },
            { _key: 'p3', title: '24/7 support', description: 'Always here to help', icon: 'IcCheckboxOn' },
          ],
        },
        {
          _type: 'proofPoints',
          _key: 'pp-icon-bold',
          title: 'Proof points',
          variant: 'icon',
          emphasis: 'bold',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _key: 'p1', title: 'Fast delivery', description: 'Same-day shipping', icon: 'IcCheckboxOn' },
            { _key: 'p2', title: 'Secure payments', description: 'Encrypted checkout', icon: 'IcCheckboxOn' },
            { _key: 'p3', title: '24/7 support', description: 'Always here to help', icon: 'IcCheckboxOn' },
          ],
        },
        {
          _type: 'proofPoints',
          _key: 'pp-stat-ghost',
          title: 'Proof points',
          variant: 'stat',
          emphasis: 'minimal',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _key: 'p1', title: 'Fast delivery', description: 'Same-day shipping', icon: 'IcCheckboxOn' },
            { _key: 'p2', title: 'Secure payments', description: 'Encrypted checkout', icon: 'IcCheckboxOn' },
            { _key: 'p3', title: '24/7 support', description: 'Always here to help', icon: 'IcCheckboxOn' },
          ],
        },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-media-zoom-out-on-scroll',
      slug: 'media-zoom-out-on-scroll',
      title: 'Media zoom out on scroll',
      sections: [
        {
          _type: 'mediaZoomOutOnScroll',
          _key: 'mzos-image',
          image: imageRef(getAsset(8)),
          alt: 'Media zoom out demo',
          spacingTop: 'large',
          spacingBottom: 'large',
        },
        {
          _type: 'mediaZoomOutOnScroll',
          _key: 'mzos-video',
          image: imageRef(getAsset(8)),
          videoUrl: LAB_MEDIA_URL,
          alt: 'Media zoom out demo',
          spacingTop: 'large',
          spacingBottom: 'large',
        },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-media-text-asymmetric',
      slug: 'media-text-asymmetric',
      title: 'Media + Text Asymmetric',
      sections: buildMediaTextAsymmetricLabPageSections(getAsset, imageRef),
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-top-nav',
      slug: 'top-nav',
      title: 'Top nav (mega menu)',
      sections: [{ _type: 'topNavBlock', _key: 'top-nav' }],
    },
  ]
  }

  for (const page of labBlockPages) {
    await client.createOrReplace(page)
    console.log(`Created Lab block page: ${page.title} (/lab/${page.slug})`)
  }

  // Lab overview – nav `items` always synced from `labBlockPages` (one link per block page).
  const labOverviewNavItems = buildLabOverviewNavItemsFromPages(labBlockPages)
  function labOverviewNavSectionIndex(sections) {
    const byKey = sections.findIndex((s) => s._key === 'lab-overview-blocks')
    if (byKey >= 0) return byKey
    return sections.findIndex((s) => {
      if (s._type !== 'labMediaTextAsymmetric' && s._type !== 'mediaTextAsymmetric') return false
      if (!Array.isArray(s.items) || s.items.length === 0) return false
      if (s.variant === 'links') return true
      return s.items.some((i) => typeof i?.linkUrl === 'string' && i.linkUrl.startsWith('/lab/'))
    })
  }
  let labOverview
  if (sanityExport?.labOverview?.sections?.length) {
    const sections = sanityExport.labOverview.sections.map((s) => stripSanityMeta(s))
    const navIdx = labOverviewNavSectionIndex(sections)
    const navPayload = {
      emphasis: 'ghost',
      surfaceColour: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      variant: 'links',
      items: labOverviewNavItems,
    }
    if (navIdx >= 0) {
      const cur = sections[navIdx]
      sections[navIdx] = {
        ...cur,
        ...navPayload,
        _key: cur._key ?? 'lab-overview-blocks',
        _type: 'labMediaTextAsymmetric',
        blockTitle: cur.blockTitle ?? 'Lab blocks',
      }
    } else {
      sections.unshift({
        _type: 'labMediaTextAsymmetric',
        _key: 'lab-overview-blocks',
        blockTitle: 'Lab blocks',
        ...navPayload,
      })
    }
    labOverview = { _type: 'labOverview', _id: 'labOverview', sections }
    console.log('Merged Lab overview from export')
  } else {
    labOverview = {
      _type: 'labOverview',
      _id: 'labOverview',
      sections: [
        {
          _type: 'labMediaTextAsymmetric',
          _key: 'lab-overview-blocks',
          blockTitle: 'Lab blocks',
          variant: 'links',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: labOverviewNavItems,
        },
      ],
    }
  }
  await client.createOrReplace(labOverview)
  try {
    await client.delete('lab/overview')
    console.log('Removed invalid-id lab overview doc lab/overview (if it existed)')
  } catch {
    // No such document
  }
  console.log('Created Lab overview')

  // The story of Jio — /stories/the-story-of-jio (Figma Story frame; hero + asymmetric + stacked)
  const storyOfJioPage = {
    _type: 'page',
    _id: 'page-the-story-of-jio',
    title: 'The story of Jio',
    slug: { _type: 'slug', current: 'stories/the-story-of-jio' },
    sections: buildStoryOfJioSections(getAsset, imageRef),
  }
  await client.createOrReplace(storyOfJioPage)
  console.log('Created The story of Jio page (/stories/the-story-of-jio)')

  // About Us page – header block + icon grid (Connection is at our core)
  const aboutUsPage = {
    _type: 'page',
    _id: 'page-about-us',
    title: 'About Us',
    slug: { _type: 'slug', current: 'about-us' },
    sections: [
      {
        _type: 'mediaTextStacked',
        _key: 'mission-statement',
        template: 'TextOnly',
        alignment: 'center',
        title: 'We exist to empower,\nenable and inspire\n1.4 billion Indians.',
        body: "Our mission is simple: Put people in charge of their lives. Because when they do, there's no limit to what's possible.\n\nThey can solve problems. Invent new things.\nCreate beauty. Make miracles.\nEven change the world.",
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'medium',
      },
      {
        _type: 'cardGrid',
        _key: 'image-collage',
        columns: '4',
        title: '',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'medium',
        spacingBottom: 'medium',
        items: [
          { _type: 'cardGridItem', _key: 'c1', cardStyle: 'image-above', title: 'Gaming', image: imageRef(getAsset(6)) },
          { _type: 'cardGridItem', _key: 'c2', cardStyle: 'image-above', title: 'Entertainment', image: imageRef(getAsset(7)) },
          { _type: 'cardGridItem', _key: 'c3', cardStyle: 'image-above', title: 'Feature phones', image: imageRef(getAsset(8)) },
          { _type: 'cardGridItem', _key: 'c4', cardStyle: 'image-above', title: 'Smart home', image: imageRef(getAsset(9)) },
          { _type: 'cardGridItem', _key: 'c5', cardStyle: 'image-above', title: 'Support UI', image: imageRef(getAsset(10)) },
          { _type: 'cardGridItem', _key: 'c6', cardStyle: 'image-above', title: 'Healthcare', image: imageRef(getAsset(11)) },
          { _type: 'cardGridItem', _key: 'c7', cardStyle: 'image-above', title: 'Crowd', image: imageRef(getAsset(12)) },
          { _type: 'cardGridItem', _key: 'c8', cardStyle: 'image-above', title: 'VR', image: imageRef(getAsset(13)) },
          { _type: 'cardGridItem', _key: 'c9', cardStyle: 'image-above', title: 'Music', image: imageRef(getAsset(14)) },
          { _type: 'cardGridItem', _key: 'c10', cardStyle: 'image-above', title: 'Camera device', image: imageRef(getAsset(15)) },
          { _type: 'cardGridItem', _key: 'c11', cardStyle: 'image-above', title: 'Woman with smartphone', image: imageRef(getAsset(16)) },
          { _type: 'cardGridItem', _key: 'c12', cardStyle: 'image-above', title: 'Connectivity', image: imageRef(getAsset(17)) },
        ],
      },
      {
        _type: 'mediaTextStacked',
        _key: 'connection-header',
        template: 'TextOnly',
        alignment: 'center',
        title: 'Connection is at our core.',
        body: 'From the Jio network where it all began, to people, products, places, platforms and partners— Everything is part of our JioFamily.',
        ctaText: 'Discover our ecosystems.',
        ctaLink: '#ecosystems',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'medium',
      },
      {
        _type: 'iconGrid',
        _key: 'ecosystems-grid',
        emphasis: 'bold',
        surfaceColour: 'primary',
        columns: 4,
        spacingTop: 'none',
        spacingBottom: 'large',
        items: [
          { _type: 'iconGridItem', _key: 'i1', title: 'Connectivity', icon: 'IcWifiNetwork', spectrum: 'indigo' },
          { _type: 'iconGridItem', _key: 'i2', title: 'Home', icon: 'IcHome', spectrum: 'sky' },
          { _type: 'iconGridItem', _key: 'i3', title: 'Entertainment', icon: 'IcEntertainment', spectrum: 'pink' },
          { _type: 'iconGridItem', _key: 'i4', title: 'Finance', icon: 'IcWallet', spectrum: 'gold' },
          { _type: 'iconGridItem', _key: 'i5', title: 'Shopping', icon: 'IcShopping', spectrum: 'red' },
          { _type: 'iconGridItem', _key: 'i6', title: 'Business', icon: 'IcBusinessman', spectrum: 'purple' },
          { _type: 'iconGridItem', _key: 'i7', title: 'Health', icon: 'IcHealthy', spectrum: 'mint' },
          { _type: 'iconGridItem', _key: 'i8', title: 'Education', icon: 'IcEducation', spectrum: 'violet' },
          { _type: 'iconGridItem', _key: 'i9', title: 'Agriculture', icon: 'IcSeedling', spectrum: 'marigold' },
          { _type: 'iconGridItem', _key: 'i10', title: 'Energy', icon: 'IcEnergyTotal', spectrum: 'green' },
          { _type: 'iconGridItem', _key: 'i11', title: 'Transport', icon: 'IcCarSide', spectrum: 'crimson' },
          { _type: 'iconGridItem', _key: 'i12', title: 'Government', icon: 'IcCity', spectrum: 'orange' },
        ],
      },
      {
        _type: 'mediaTextStacked',
        _key: 'for-everyone-header',
        template: 'TextOnly',
        alignment: 'center',
        title: 'For everyone,\neverywhere.\nFor every need of life.',
        subhead: "That's how we see a truly scalable brand.\nFlexible. Inclusive. Ready for all.",
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'medium',
      },
      {
        _type: 'mediaTextStacked',
        _key: 'for-everyone',
        template: 'Stacked',
        alignment: 'left',
        title: 'For everyone.',
        body: 'From HNIs to farmers, students to women, startups to global giants, partners to employees.',
        image: imageRef(getAsset(0)),
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'medium',
        spacingBottom: 'medium',
      },
      {
        _type: 'mediaTextStacked',
        _key: 'for-everywhere',
        template: 'Stacked',
        alignment: 'left',
        title: 'For everywhere.',
        body: 'From Kashmir to Kanyakumari, from Gujarat to Arunachal and from India to the world.',
        image: imageRef(getAsset(1)),
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'medium',
        spacingBottom: 'medium',
      },
      {
        _type: 'mediaTextStacked',
        _key: 'for-every-need',
        template: 'Stacked',
        alignment: 'left',
        title: 'For every need.',
        body: 'From work to wellness, learning to leisure and everything in between. Our ecosystems support every part of life.',
        image: imageRef(getAsset(2)),
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'medium',
        spacingBottom: 'medium',
      },
      {
        _type: 'mediaTextStacked',
        _key: 'hear-from-family-heading',
        template: 'TextOnly',
        alignment: 'center',
        title: 'Hear from our Jio family',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'medium',
      },
      {
        _type: 'cardGrid',
        _key: 'hear-from-family-cards',
        columns: '3',
        title: '',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'none',
        spacingBottom: 'large',
        items: [
          {
            _type: 'cardGridItem',
            _key: 'jio-family-1',
            cardStyle: 'image-above',
            title: 'Matching numbers.',
            description: "The new twinning trend, and everyone's joining in.",
            image: imageRef(getAsset(3)),
            ctaText: 'Button',
            ctaLink: '#',
          },
          {
            _type: 'cardGridItem',
            _key: 'jio-family-2',
            cardStyle: 'image-above',
            title: "Jio Safety Shield: A phone feature modern-day parenting can't stop talking about.",
            description: 'Description.',
            image: imageRef(getAsset(4)),
            ctaText: 'Button',
            ctaLink: '#',
          },
          {
            _type: 'cardGridItem',
            _key: 'jio-family-3',
            cardStyle: 'image-above',
            title: 'Count on Jio for worry-free trips in India and abroad.',
            description: 'Description.',
            image: imageRef(getAsset(5)),
            ctaText: 'Button',
            ctaLink: '#',
          },
        ],
      },
    ],
  }
  await client.createOrReplace(aboutUsPage)
  console.log('Created About Us page')

  const jiotagPage = {
    _type: 'page',
    _id: 'page-jiotag',
    title: 'JioTag',
    slug: { _type: 'slug', current: 'jiotag' },
    sections: buildJioTagPageSections(getAsset, imageRef),
  }
  await client.createOrReplace(jiotagPage)
  console.log('Created JioTag product page (/jiotag)')

  console.log('Done. Open your app to see the seeded content.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
