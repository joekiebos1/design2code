#!/usr/bin/env node
/**
 * Seed Sanity with sample page content.
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_API_TOKEN (write token from sanity.io/manage)
 * Run: node --env-file=.env scripts/seed-sanity.mjs
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
  console.log('Seeding Sanity...')

  // Use images from Sanity Image Library only (no external URLs)
  const imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id }`)
  const assetIds = imageAssets.map((a) => a._id)
  const getAsset = (i) => (assetIds.length > 0 ? assetIds[i % assetIds.length] : null)

  if (assetIds.length === 0) {
    console.warn('Image Library is empty. Upload images via Image Library → Upload images in Sanity Studio, then re-run this seed.')
  } else {
    console.log(`Using ${assetIds.length} image(s) from Image Library`)
  }

  const heroImageId = getAsset(0)
  const mediaTextId = getAsset(1)
  const carouselImage1 = getAsset(2)
  const carouselImage2 = getAsset(3)
  const carouselImage3 = getAsset(4)
  const carouselImage4 = getAsset(5)
  const productHeroId = getAsset(6)
  const productMediaTextId = getAsset(7)
  const rotImg1 = getAsset(8)
  const rotImg2 = getAsset(9)
  const rotImg3 = getAsset(10)
  const rotImg4 = getAsset(11)
  const rotImg5 = getAsset(12)
  const rotImg6 = getAsset(13)
  const rotImg7 = getAsset(14)
  const rotImg8 = getAsset(15)

  const imageRef = (id) => id ? { _type: 'image', asset: { _type: 'reference', _ref: id } } : undefined

  const sections = [
    {
      _type: 'hero',
      _key: 'hero-1',
      productName: 'JioProduct',
      headline: 'Transform your workflow',
      subheadline: 'Discover how our platform helps teams ship faster and collaborate better.',
      ctaText: 'Get started',
      ctaLink: '/signup',
      cta2Text: 'Learn more',
      cta2Link: '/about',
      image: imageRef(heroImageId),
    },
      {
        _type: 'proofPoints',
        _key: 'proof-1',
        title: 'Why believe us',
        items: [
          { _key: 'pp1', title: 'Trusted by millions', description: 'Join 10M+ satisfied customers', icon: 'IcCheckboxOn' },
          { _key: 'pp2', title: 'Award-winning', description: 'Industry recognition for excellence', icon: 'IcAward' },
          { _key: 'pp3', title: '24/7 support', description: "We're here when you need us", icon: 'IcProtection' },
        ],
      },
      {
        _type: 'cardGrid',
        _key: 'cg-1',
        spacing: 'medium',
        columns: '3',
        title: 'Why choose us',
        titleLevel: 'h2',
        items: [
          { _type: 'cardGridItem', _key: 'c1', cardStyle: 'image-above', title: 'Fast', description: 'Built for speed. Deploy in seconds, not minutes.', image: imageRef(mediaTextId) },
          { _type: 'cardGridItem', _key: 'c2', cardStyle: 'text-on-colour', title: 'Reliable', description: 'Uptime you can count on. We handle the infrastructure.', surface: 'bold' },
          { _type: 'cardGridItem', _key: 'c3', cardStyle: 'text-on-image', title: 'Secure', description: 'Enterprise-grade security. Your data stays yours.', image: imageRef(carouselImage1), surface: 'bold' },
        ],
      },
      // MediaTextBlock – all variants with all content fields
      {
        _type: 'mediaTextBlock',
        _key: 'tib-1',
        spacing: 'medium',
        eyebrow: 'FEATURED',
        title: 'Designed for real teams',
        titleLevel: 'h2',
        body: 'We built this with feedback from hundreds of teams. Every feature exists because someone asked for it. No bloat, no complexity—just what you need to get work done.',
        ctaText: 'Visit JioFinance',
        ctaLink: '/finance',
        template: 'SideBySide',
        contentWidth: 'Default',
        imagePosition: 'left',
        imageAspectRatio: '4:3',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-2',
        spacing: 'medium',
        eyebrow: 'MOBILE GAMES',
        title: 'SideBySide – image right',
        titleLevel: 'h2',
        body: 'Classic 50/50 layout with image on the right. The eyebrow, title, body, and CTA are all populated for testing.',
        ctaText: 'Get started',
        ctaLink: '/signup',
        template: 'SideBySide',
        contentWidth: 'Default',
        imagePosition: 'right',
        imageAspectRatio: '3:4',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-3',
        spacing: 'large',
        eyebrow: 'SIDE BY SIDE',
        title: 'SideBySide – image left',
        titleLevel: 'h3',
        body: 'Text and image side by side. Image on the left.',
        ctaText: 'Learn more',
        ctaLink: '/about',
        template: 'SideBySide',
        contentWidth: 'Default',
        imagePosition: 'left',
        imageAspectRatio: '1:1',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-4',
        spacing: 'small',
        eyebrow: 'SIDE BY SIDE',
        title: 'SideBySide – image right',
        titleLevel: 'h3',
        body: 'Text and image side by side. Image on the right.',
        ctaText: 'View product',
        ctaLink: '/products',
        template: 'SideBySide',
        contentWidth: 'Default',
        imagePosition: 'right',
        imageAspectRatio: '16:9',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-4b',
        spacing: 'medium',
        eyebrow: 'NARROW CONTENT',
        title: 'SideBySide – contentWidth narrow',
        titleLevel: 'h2',
        body: 'Narrow content width (8 cols). Focused reading experience. All fields: eyebrow, title, body, CTA.',
        ctaText: 'Read more',
        ctaLink: '/blog',
        template: 'SideBySide',
        contentWidth: 'M',
        imagePosition: 'left',
        imageAspectRatio: '4:3',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-4c',
        spacing: 'large',
        eyebrow: 'FULL WIDTH',
        title: 'SideBySide – contentWidth full',
        titleLevel: 'h2',
        body: 'Full-width layout. Maximum visual impact.',
        ctaText: 'Explore',
        ctaLink: '/explore',
        template: 'SideBySide',
        contentWidth: 'edgeToEdge',
        imagePosition: 'right',
        imageAspectRatio: '16:9',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-5',
        spacing: 'medium',
        eyebrow: 'HERO OVERLAY',
        title: 'Full bleed image with text overlay',
        titleLevel: 'h2',
        body: 'This layout uses a full-width image with text overlay. Perfect for impactful landing sections. Left-aligned overlay.',
        ctaText: 'Explore',
        ctaLink: '/explore',
        template: 'HeroOverlay',
        overlayAlignment: 'left',
        imageAspectRatio: '16:7',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-6',
        spacing: 'large',
        eyebrow: 'CENTERED HERO',
        title: 'HeroOverlay – center aligned',
        titleLevel: 'h2',
        body: 'Centered overlay on full bleed. Widescreen 16:9. Ideal for campaign or brand moments.',
        ctaText: 'Join now',
        ctaLink: '/join',
        template: 'HeroOverlay',
        overlayAlignment: 'center',
        imageAspectRatio: '16:9',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-7',
        spacing: 'medium',
        eyebrow: 'STACKED LAYOUT',
        title: 'Stacked – image on top, text left',
        titleLevel: 'h3',
        body: 'Large image on top. Text below, left aligned. Good for editorial or feature sections.',
        ctaText: 'Read more',
        ctaLink: '/blog',
        template: 'Stacked',
        stackImagePosition: 'top',
        stackAlignment: 'left',
        imageAspectRatio: '16:7',
        image: imageRef(mediaTextId),
      },
      {
        _type: 'mediaTextBlock',
        _key: 'tib-8',
        spacing: 'medium',
        eyebrow: 'STACKED CENTER',
        title: 'Stacked – image on bottom, text center',
        titleLevel: 'h3',
        body: 'Text first, then image. Centered layout. Use for testimonials or impact statements.',
        ctaText: 'See all',
        ctaLink: '/gallery',
        template: 'Stacked',
        stackImagePosition: 'bottom',
        stackAlignment: 'center',
        imageAspectRatio: '21:9',
        image: imageRef(mediaTextId),
      },
    ]

  if (carouselImage1 && carouselImage2 && carouselImage3 && carouselImage4) {
    sections.push({
      _type: 'carousel',
      cardSize: 'compact',
      _key: 'car-1',
      title: 'Featured products',
      items: [
        { _type: 'cardItem', _key: 'c1', cardType: 'media', title: 'Product One', description: 'The first in our lineup. Built for performance.', image: imageRef(carouselImage1), aspectRatio: '4:5', link: '/products/1', ctaText: 'View' },
        { _type: 'cardItem', _key: 'c2', cardType: 'media', title: 'Product Two', description: 'Double the power. Half the effort.', image: imageRef(carouselImage2), aspectRatio: '4:5', link: '/products/2', ctaText: 'View' },
        { _type: 'cardItem', _key: 'c3', cardType: 'media', title: 'Product Three', description: 'Our flagship offering. Everything you need.', image: imageRef(carouselImage3), aspectRatio: '8:5', link: '/products/3', ctaText: 'View' },
        { _type: 'cardItem', _key: 'c4', cardType: 'media', title: 'Product Four', description: 'The complete solution for modern teams.', image: imageRef(carouselImage4), aspectRatio: '4:5', link: '/products/4', ctaText: 'View' },
      ],
    })
    sections.push({
      _type: 'fullBleedVerticalCarousel',
      _key: 'fbvc-1',
      items: [
        { _type: 'fullBleedVerticalCarouselItem', _key: 'fb1', title: 'First story', description: 'Add an image or video in Sanity Studio. This text scrolls from bottom to top as you scroll through the carousel.', image: imageRef(carouselImage1) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'fb2', title: 'Second story', description: 'Each item gets its own full-bleed media and text overlay. The stepper on the right shows your progress.', image: imageRef(carouselImage2) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'fb3', title: 'Third story', description: 'Scroll through to discover more. Each slide tells part of the story.', image: imageRef(carouselImage3) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'fb4', title: 'Fourth story', description: 'The final chapter. Ready to take action?', image: imageRef(carouselImage4) },
      ],
    })
  } else {
    console.warn('Skipping carousel blocks (images required)')
  }

  if (rotImg1 && rotImg2 && rotImg3 && rotImg4) {
    sections.push({
      _type: 'rotatingMedia',
      _key: 'rot-1',
      spacing: 'medium',
      variant: 'small',
      surface: 'ghost',
      items: [
        { _type: 'rotatingMediaItem', _key: 'r1', title: 'Game One', image: imageRef(rotImg1) },
        { _type: 'rotatingMediaItem', _key: 'r2', title: 'Game Two', image: imageRef(rotImg2) },
        { _type: 'rotatingMediaItem', _key: 'r3', title: 'Game Three', image: imageRef(rotImg3) },
        { _type: 'rotatingMediaItem', _key: 'r4', title: 'Game Four', image: imageRef(rotImg4) },
        { _type: 'rotatingMediaItem', _key: 'r5', title: 'Game Five', image: imageRef(rotImg5 || rotImg1) },
        { _type: 'rotatingMediaItem', _key: 'r6', title: 'Game Six', image: imageRef(rotImg6 || rotImg2) },
        { _type: 'rotatingMediaItem', _key: 'r7', title: 'Game Seven', image: imageRef(rotImg7 || rotImg3) },
        { _type: 'rotatingMediaItem', _key: 'r8', title: 'Game Eight', image: imageRef(rotImg8 || rotImg4) },
      ],
    })
  } else {
    console.warn('Skipping rotatingMedia block (images required)')
  }

  const homePage = {
    _type: 'page',
    _id: 'page-home',
    title: 'Home',
    slug: { _type: 'slug', current: 'home' },
    sections,
  }

  await client.createOrReplace(homePage)
  console.log('Created page: Home (slug: home)')

  // --- Product page: all blocks, all variations ---
  const productImg = imageRef(productMediaTextId)
  const productSections = [
    {
      _type: 'hero',
      _key: 'p-hero',
      productName: 'Product Showcase',
      headline: 'Every block, every variation',
      subheadline: 'This page demonstrates all block types and their layout options. Use it as a reference for design and content.',
      ctaText: 'Get started',
      ctaLink: '/signup',
      cta2Text: 'Learn more',
      cta2Link: '/about',
      image: imageRef(productHeroId),
    },
    {
      _type: 'proofPoints',
      _key: 'p-pp',
      title: 'Product proof points',
      items: [
        { _key: 'pp1', title: 'Trusted by millions', description: 'Join 10M+ satisfied customers', icon: 'IcCheckboxOn' },
        { _key: 'pp2', title: 'Award-winning', description: 'Industry recognition for excellence', icon: 'IcAward' },
        { _key: 'pp3', title: '24/7 support', description: "We're here when you need us", icon: 'IcProtection' },
        { _key: 'pp4', title: 'Lightning fast', description: 'Built for speed and scale', icon: 'IcRocket' },
        { _key: 'pp5', title: 'Secure by design', description: 'Enterprise-grade security', icon: 'IcLock' },
      ],
    },
    // MediaTextBlock – all variants with all content fields
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-1',
      spacing: 'medium',
      eyebrow: 'SIDE BY SIDE',
      title: 'SideBySide – image left, 4:3',
      titleLevel: 'h2',
      body: 'Classic 50/50 layout with image on the left. Aspect ratio 4:3. All content fields: eyebrow, title, titleLevel, body, CTA, image.',
      ctaText: 'Visit JioFinance',
      ctaLink: '/finance',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'left',
      imageAspectRatio: '4:3',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-2',
      spacing: 'medium',
      eyebrow: '50/50 LAYOUT',
      title: 'SideBySide – image right, 3:4',
      titleLevel: 'h2',
      body: 'Same layout with image on the right. Taller 3:4 aspect ratio. Good for portrait or vertical imagery.',
      ctaText: 'Get started',
      ctaLink: '/signup',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'right',
      imageAspectRatio: '3:4',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-3',
      spacing: 'small',
      eyebrow: 'SQUARE IMAGE',
      title: 'SideBySide – image right, 1:1',
      titleLevel: 'h3',
      body: 'Square image. Perfect for product shots or portraits. Content width narrow for focused reading.',
      ctaText: 'Learn more',
      ctaLink: '/about',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'right',
      imageAspectRatio: '1:1',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-4',
      spacing: 'medium',
      eyebrow: 'SIDE BY SIDE',
      title: 'SideBySide – image left',
      titleLevel: 'h3',
      body: 'Text and image side by side. Image on the left.',
      ctaText: 'View product',
      ctaLink: '/products',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'left',
      imageAspectRatio: '3:4',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-5',
      spacing: 'medium',
      eyebrow: 'SIDE BY SIDE',
      title: 'SideBySide – image right',
      titleLevel: 'h3',
      body: 'Text and image side by side. Image on the right.',
      ctaText: 'Explore',
      ctaLink: '/explore',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'right',
      imageAspectRatio: '3:4',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-6',
      spacing: 'large',
      eyebrow: 'SIDE BY SIDE',
      title: 'SideBySide – image left',
      titleLevel: 'h2',
      body: 'Text and image side by side. Image on the left.',
      ctaText: 'Join now',
      ctaLink: '/join',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'left',
      imageAspectRatio: '4:3',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-7',
      spacing: 'medium',
      eyebrow: 'SIDE BY SIDE',
      title: 'SideBySide – image right',
      titleLevel: 'h2',
      body: 'Text and image side by side. Image on the right.',
      ctaText: 'Read more',
      ctaLink: '/blog',
      template: 'SideBySide',
      contentWidth: 'Default',
      imagePosition: 'right',
      imageAspectRatio: '4:3',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-8',
      spacing: 'large',
      eyebrow: 'FULL BLEED',
      title: 'HeroOverlay – left, 16:7',
      titleLevel: 'h2',
      body: 'Full bleed with text overlay left. Open Graph standard aspect ratio. Maximum impact.',
      ctaText: 'See all',
      ctaLink: '/gallery',
      template: 'HeroOverlay',
      overlayAlignment: 'left',
      imageAspectRatio: '16:7',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-9',
      spacing: 'medium',
      eyebrow: 'HERO CENTER',
      title: 'HeroOverlay – center, 16:9',
      titleLevel: 'h2',
      body: 'Centered overlay. Widescreen 16:9 aspect ratio. Ideal for campaign or brand moments.',
      ctaText: 'Get started',
      ctaLink: '/signup',
      template: 'HeroOverlay',
      overlayAlignment: 'center',
      imageAspectRatio: '16:9',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-10',
      spacing: 'large',
      eyebrow: 'CINEMATIC',
      title: 'HeroOverlay – center, 21:9',
      titleLevel: 'h2',
      body: 'Cinematic 21:9. Maximum impact for hero sections. All content fields populated.',
      ctaText: 'Explore',
      ctaLink: '/explore',
      template: 'HeroOverlay',
      overlayAlignment: 'center',
      imageAspectRatio: '21:9',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-11',
      spacing: 'medium',
      eyebrow: 'STACKED TOP',
      title: 'Stacked – image top, text left',
      titleLevel: 'h3',
      body: 'Large image on top. Text below, left aligned. Good for editorial or feature sections.',
      ctaText: 'Visit JioFinance',
      ctaLink: '/finance',
      template: 'Stacked',
      stackImagePosition: 'top',
      stackAlignment: 'left',
      imageAspectRatio: '16:7',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-12',
      spacing: 'medium',
      eyebrow: 'STACKED CENTER',
      title: 'Stacked – image top, text center',
      titleLevel: 'h3',
      body: 'Image on top. Text centered below. Use for testimonials or impact statements.',
      ctaText: 'Learn more',
      ctaLink: '/about',
      template: 'Stacked',
      stackImagePosition: 'top',
      stackAlignment: 'center',
      imageAspectRatio: '16:9',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-13',
      spacing: 'small',
      eyebrow: 'TEXT FIRST',
      title: 'Stacked – image bottom, text left',
      titleLevel: 'h3',
      body: 'Text first, then image. Left aligned. Good when copy leads the narrative.',
      ctaText: 'View product',
      ctaLink: '/products',
      template: 'Stacked',
      stackImagePosition: 'bottom',
      stackAlignment: 'left',
      imageAspectRatio: '16:7',
      image: productImg,
    },
    {
      _type: 'mediaTextBlock',
      _key: 'p-tib-14',
      spacing: 'medium',
      eyebrow: 'STACKED BOTTOM',
      title: 'Stacked – image bottom, text center',
      titleLevel: 'h3',
      body: 'Text above, image below. Centered layout. All content fields: eyebrow, title, body, CTA, image.',
      ctaText: 'See all',
      ctaLink: '/gallery',
      template: 'Stacked',
      stackImagePosition: 'bottom',
      stackAlignment: 'center',
      imageAspectRatio: '16:9',
      image: productImg,
    },
  ]

  if (carouselImage1 && carouselImage2 && carouselImage3 && carouselImage4) {
    productSections.push({
      _type: 'carousel',
      cardSize: 'compact',
      _key: 'p-car',
      title: 'Product carousel (4+ items)',
      items: [
        { _type: 'cardItem', _key: 'pc1', cardType: 'media', title: 'Product A', description: 'First in the lineup.', image: imageRef(carouselImage1), aspectRatio: '4:5', link: '/products/a', ctaText: 'View' },
        { _type: 'cardItem', _key: 'pc2', cardType: 'media', title: 'Product B', description: 'Second option for you.', image: imageRef(carouselImage2), aspectRatio: '4:5', link: '/products/b', ctaText: 'View' },
        { _type: 'cardItem', _key: 'pc3', cardType: 'media', title: 'Product C', description: 'Wider card (8:5).', image: imageRef(carouselImage3), aspectRatio: '8:5', link: '/products/c', ctaText: 'View' },
        { _type: 'cardItem', _key: 'pc4', cardType: 'media', title: 'Product D', description: 'Fourth and final.', image: imageRef(carouselImage4), aspectRatio: '4:5', link: '/products/d', ctaText: 'View' },
      ],
    })
    productSections.push({
      _type: 'fullBleedVerticalCarousel',
      _key: 'p-fbvc',
      items: [
        { _type: 'fullBleedVerticalCarouselItem', _key: 'pfb1', title: 'Product story 1', description: 'First chapter of the product narrative.', image: imageRef(carouselImage1) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'pfb2', title: 'Product story 2', description: 'Second chapter. Building the case.', image: imageRef(carouselImage2) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'pfb3', title: 'Product story 3', description: 'Third chapter. The details matter.', image: imageRef(carouselImage3) },
        { _type: 'fullBleedVerticalCarouselItem', _key: 'pfb4', title: 'Product story 4', description: 'Final chapter. Ready to get started?', image: imageRef(carouselImage4) },
      ],
    })
  }

  const productPage = {
    _type: 'page',
    _id: 'page-product',
    title: 'Product',
    slug: { _type: 'slug', current: 'product' },
    sections: productSections,
  }

  await client.createOrReplace(productPage)
  console.log('Created page: Product (slug: product)')
  console.log('Done. Open your app to see the seeded content.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
