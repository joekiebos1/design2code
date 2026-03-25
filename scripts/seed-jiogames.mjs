#!/usr/bin/env node
/**
 * Seed Sanity with JioGames page content.
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_API_TOKEN (write token from sanity.io/manage)
 * Run: node --env-file=.env scripts/seed-jiogames.mjs
 */

import { createClient } from '@sanity/client'

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

async function seed() {
  console.log('Seeding JioGames page...')

  // Use images from Sanity Image Library only (no external URLs)
  const imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id }`)
  const assetIds = imageAssets.map((a) => a._id)
  const getAsset = (i) => (assetIds.length > 0 ? assetIds[i % assetIds.length] : null)

  if (assetIds.length === 0) {
    console.warn('Media Library has no images. Upload via Media Library → Upload media in Sanity Studio, then re-run this seed.')
  } else {
    console.log(`Using ${assetIds.length} image(s) from Image Library`)
  }

  const heroImageId = getAsset(0)
  const mediaTextFullId = getAsset(1)
  const mediaTextLeftId = getAsset(2)
  const mediaTextRightId = getAsset(3)
  const carouselImage1 = getAsset(4)
  const carouselImage2 = getAsset(5)
  const carouselImage3 = getAsset(6)
  const carouselImage4 = getAsset(7)
  const imageRef = (id) => id ? { _type: 'image', asset: { _type: 'reference', _ref: id } } : undefined

  const sections = [
    // 1. Hero – media overlay band, Games-themed
    {
      _type: 'hero',
      _key: 'jg-hero',
      contentLayout: 'mediaOverlay',
      spacingBottom: 'large',
      productName: 'Games',
      headline: 'Limitless play, for everyone.',
      subheadline: 'Discover thousands of games. Play on any device. Share the fun with family and friends.',
      ctaText: 'Play now',
      ctaLink: '/games/play',
      cta2Text: 'Explore games',
      cta2Link: '/games/catalog',
      image: imageRef(heroImageId),
    },
    // 2. ProofPoints – Games-themed
    {
      _type: 'proofPoints',
      _key: 'jg-pp',
      spacingTop: 'large',
      spacingBottom: 'large',
      surfaceColour: 'primary',
      surface: 'ghost',
      title: 'Why play with JioGames',
      items: [
        { _key: 'pp1', title: 'Cloud gaming', description: 'Stream instantly. No downloads, no waiting.', icon: 'IcThunderstorm' },
        { _key: 'pp2', title: 'Exclusive titles', description: 'Play games you won\'t find anywhere else.', icon: 'IcStar' },
        { _key: 'pp3', title: 'Family-friendly', description: 'Curated content for all ages.', icon: 'IcProtection' },
        { _key: 'pp4', title: 'Cross-device play', description: 'Start on phone, continue on TV or tablet.', icon: 'IcCheckboxOn' },
      ],
    },
    // 3. MediaText – Overlay center (full screen image), Games-themed
    {
      _type: 'mediaTextStacked',
      _key: 'jg-mt-1',
      spacingTop: 'large',
      spacingBottom: 'large',
      template: 'Overlay',
      mediaSize: 'edgeToEdge',
      alignment: 'center',
      surfaceColour: 'primary',
      emphasis: 'ghost',
      title: 'Play anywhere. Anytime.',
      body: 'Your games follow you. Pick up where you left off on any screen—phone, tablet, or TV. No limits.',
      ctaText: 'Get started',
      ctaLink: '/games/signup',
      image: imageRef(mediaTextFullId),
    },
    // 4. MediaText – Stacked
    {
      _type: 'mediaTextStacked',
      _key: 'jg-mt-2',
      spacingTop: 'large',
      spacingBottom: 'large',
      template: 'Stacked',
      stackImagePosition: 'top',
      surfaceColour: 'primary',
      emphasis: 'bold',
      eyebrow: 'CLOUD GAMING',
      title: 'Stream games in seconds',
      body: 'No downloads, no storage limits. Jump straight into the action with our cloud gaming technology. Low latency, high quality.',
      ctaText: 'Try cloud gaming',
      ctaLink: '/games/cloud',
      image: imageRef(mediaTextLeftId),
    },
    // 5. MediaText – Stacked
    {
      _type: 'mediaTextStacked',
      _key: 'jg-mt-3',
      spacingTop: 'large',
      spacingBottom: 'large',
      template: 'Stacked',
      stackImagePosition: 'top',
      surfaceColour: 'primary',
      emphasis: 'ghost',
      eyebrow: 'EXCLUSIVE TITLES',
      title: 'Games you can\'t play anywhere else',
      body: 'From indie gems to blockbuster exclusives, JioGames brings you titles crafted for our platform. New releases every month.',
      ctaText: 'Browse exclusives',
      ctaLink: '/games/exclusives',
      image: imageRef(mediaTextRightId),
    },
    // 6. MediaText – Stacked
    {
      _type: 'mediaTextStacked',
      _key: 'jg-mt-4',
      spacingTop: 'large',
      spacingBottom: 'large',
      template: 'Stacked',
      stackImagePosition: 'top',
      surfaceColour: 'primary',
      emphasis: 'ghost',
      eyebrow: 'FAMILY MODE',
      title: 'Safe, curated fun for everyone',
      body: 'Parental controls, age ratings, and a dedicated family section. Let the kids play while you stay in control.',
      ctaText: 'Learn about Family Mode',
      ctaLink: '/games/family',
      image: imageRef(mediaTextLeftId),
    },
  ]

  // 7. Carousel – 4 items, cardSize: compact
  if (carouselImage1 && carouselImage2 && carouselImage3 && carouselImage4) {
    sections.push({
      _type: 'carousel',
      _key: 'jg-car',
      spacingTop: 'large',
      spacingBottom: 'large',
      cardSize: 'compact',
      surfaceColour: 'primary',
      surface: 'ghost',
      title: 'Featured games',
      items: [
        { _type: 'cardItem', _key: 'c1', cardType: 'media', title: 'Adventure Quest', description: 'Explore vast worlds and uncover hidden treasures.', image: imageRef(carouselImage1), aspectRatio: '4:5', link: '/games/adventure-quest', ctaText: 'Play' },
        { _type: 'cardItem', _key: 'c2', cardType: 'media', title: 'Racing Thunder', description: 'High-speed thrills on tracks around the globe.', image: imageRef(carouselImage2), aspectRatio: '4:5', link: '/games/racing-thunder', ctaText: 'Play' },
        { _type: 'cardItem', _key: 'c3', cardType: 'media', title: 'Puzzle Master', description: 'Brain-teasers for every skill level.', image: imageRef(carouselImage3), aspectRatio: '4:5', link: '/games/puzzle-master', ctaText: 'Play' },
        { _type: 'cardItem', _key: 'c4', cardType: 'media', title: 'Cosmic Explorer', description: 'Build, explore, and survive in space.', image: imageRef(carouselImage4), aspectRatio: '4:5', link: '/games/cosmic-explorer', ctaText: 'Play' },
      ],
    })
  } else {
    console.warn('Skipping carousel block (images required)')
  }

  const jiogamesPage = {
    _type: 'page',
    _id: 'page-jiogames',
    title: 'JioGames',
    slug: { _type: 'slug', current: 'jiogames' },
    sections,
  }

  await client.createOrReplace(jiogamesPage)
  console.log('Created page: JioGames (slug: jiogames)')
  console.log('Visit /jiogames to see the page.')
  console.log('Done.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
