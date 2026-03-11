#!/usr/bin/env node
/**
 * Seed Sanity with Lab page content only.
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_API_TOKEN (write token from sanity.io/manage)
 * Run: node --env-file=.env scripts/seed-sanity.mjs
 *
 * Seeds: Lab block pages, About Us page. Does NOT seed home/product pages — Sanity is the source of truth for content.
 * Images: Uses Sanity Image Library only. If empty, uploads public/placeholder-preview.svg.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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
    console.log('Image Library is empty. Uploading placeholder from public/placeholder-preview.svg...')
    const placeholderPath = join(__dirname, '../public/placeholder-preview.svg')
    const buffer = readFileSync(placeholderPath)
    const asset = await client.assets.upload('image', buffer, {
      contentType: 'image/svg+xml',
      filename: 'placeholder-preview.svg',
    })
    assetIds = [asset._id]
    console.log(`Uploaded 1 placeholder image. Using ${assetIds.length} image(s).`)
  } else {
    console.log(`Using ${assetIds.length} image(s) from Image Library`)
  }

  const getAsset = (i) => (assetIds.length > 0 ? assetIds[i % assetIds.length] : null)
  const imageRef = (id) => id ? { _type: 'image', asset: { _type: 'reference', _ref: id } } : undefined

  const LAB_MEDIA_URL = 'https://storage.googleapis.com/mannequin/blobs/4627df29-fe27-4e9c-b58f-8077848e265f.mp4'

  // Lab block pages – one page per block type, all variants from block-variants.ts
  const sharedHeroFields = {
    productName: 'Product Name',
    headline: 'Designed for the way you live.',
    subheadline: 'Clean lines. Thoughtful details. Built to last.',
    ctaText: 'Shop now',
    ctaLink: '#',
    cta2Text: 'Learn more',
    cta2Link: '#',
  }

  const labBlockPages = [
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
      sections: [
        {
          _type: 'mediaText5050',
          _key: 'mt5050-single',
          variant: 'paragraphs',
          imagePosition: 'right',
          items: [
            { _type: 'mediaText5050Item', _key: 'i1', subtitle: "Don't settle for less. Make the switch.", body: 'Transfer your data, iMessages, photos and more. Use Pixel functions that make switching simple. e-SIM transfer, innovative AI for photos and videos, and your data stays secure.' },
          ],
          image: imageRef(getAsset(0)),
          imageAspectRatio: '5:4',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
        },
        {
          _type: 'mediaText5050',
          _key: 'mt5050-accordion',
          variant: 'accordion',
          imagePosition: 'left',
          headline: 'Battery and durability',
          items: [
            { _type: 'mediaText5050Item', _key: 'a1', subtitle: 'Lasts longer than a day, without charging.', body: 'Your Pixel lasts more than 30 hours on a full charge and up to 120 hours with Extreme Battery Saver. Fast charging is built in so you can stay connected.' },
            { _type: 'mediaText5050Item', _key: 'a2', subtitle: 'Lasts for years.', body: 'The Google Pixel 10a is built to resist drops, scratches and spills with IP68 protection against water and dust, durable materials and a strong Corning Gorilla Glass 7i screen.' },
            { _type: 'mediaText5050Item', _key: 'a3', subtitle: '7 years of security and OS updates.', body: 'To protect you and your sensitive data, your Pixel receives regular software updates, making your phone more secure over time.' },
          ],
          image: imageRef(getAsset(1)),
          imageAspectRatio: '5:4',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
        },
        {
          _type: 'mediaText5050',
          _key: 'mt5050-multi',
          variant: 'paragraphs',
          imagePosition: 'right',
          items: [
            { _type: 'mediaText5050Item', _key: 'p1', subtitle: 'Lasts longer than a day, without charging.', body: 'Your Pixel lasts more than 30 hours on a full charge and up to 120 hours with Extreme Battery Saver. Fast charging is built in.' },
            { _type: 'mediaText5050Item', _key: 'p2', subtitle: 'Lasts for years.', body: 'The Google Pixel 10a is built to resist drops, scratches and spills with IP68 protection against water and dust.' },
            { _type: 'mediaText5050Item', _key: 'p3', subtitle: '7 years of security and OS updates.', body: 'Your Pixel receives regular software updates, making your phone more secure over time.' },
          ],
          image: imageRef(getAsset(2)),
          imageAspectRatio: '5:4',
          emphasis: 'subtle',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
        },
      ],
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Image with text below. CTA optional.', image: imageRef(getAsset(0)), ctaText: 'Learn more', ctaLink: '#' },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Image with text below.', image: imageRef(getAsset(1)) },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Description for card 1.', image: imageRef(getAsset(2)) },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Description for card 2.', image: imageRef(getAsset(3)) },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Description for card 3.', image: imageRef(getAsset(4)) },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Short.', image: imageRef(getAsset(5)) },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Short.', image: imageRef(getAsset(6)) },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Short.', image: imageRef(getAsset(7)) },
            { _type: 'cardGridItem', _key: 'c4', cardType: 'media-description-below', title: 'Card 4', description: 'Short.', image: imageRef(getAsset(0)) },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-inside', title: 'Overlay card 1', description: 'Text over image.', image: imageRef(getAsset(1)) },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-inside', title: 'Overlay card 2', description: 'Text over image.', image: imageRef(getAsset(2)) },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-inside', title: 'Overlay card 3', description: 'Text over image.', image: imageRef(getAsset(3)) },
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
            { _type: 'labGridBlockCardItem', _key: 'c1', size: 'large', title: 'Primary bold', description: 'Headline and description with background colour.', backgroundColor: 'primary-bold' },
            { _type: 'labGridBlockCardItem', _key: 'c2', size: 'large', title: 'Secondary bold', description: 'Headline and description with background colour.', backgroundColor: 'secondary-bold' },
            { _type: 'labGridBlockCardItem', _key: 'c3', size: 'large', title: 'Sparkle bold', description: 'Headline and description with background colour.', backgroundColor: 'sparkle-bold' },
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
            { _type: 'labGridBlockCardItem', _key: 'c1', size: 'small', title: 'Feature card 1', description: 'With icon and CTA.', icon: 'IcWifiNetwork', backgroundColor: 'primary-subtle', callToActionButtons: [{ _key: 'b1', label: 'Learn more', link: '#', style: 'filled' }] },
            { _type: 'labGridBlockCardItem', _key: 'c2', size: 'small', title: 'Feature card 2', description: 'With features list.', backgroundColor: 'secondary-subtle', features: ['Feature A', 'Feature B', 'Feature C'] },
            { _type: 'labGridBlockCardItem', _key: 'c3', size: 'small', title: 'Spectrum card', description: 'reliance.800 from full spectrum.', backgroundColor: 'reliance.800', callToActionButtons: [{ _key: 'b1', label: 'Explore', link: '#', style: 'outlined' }] },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Media below', description: 'Image with text underneath.', image: imageRef(getAsset(4)) },
            { _type: 'labGridBlockCardItem', _key: 'c2', size: 'large', title: 'Text inside', description: 'Coloured card in same grid.', backgroundColor: 'primary-bold' },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-inside', title: 'Media inside', description: 'Text overlay on image.', image: imageRef(getAsset(5)) },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Light tint background.', image: imageRef(getAsset(6)) },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Light tint background.', image: imageRef(getAsset(7)) },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Light tint background.', image: imageRef(getAsset(0)) },
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
            { _type: 'cardGridItem', _key: 'c1', cardType: 'media-description-below', title: 'Card 1', description: 'Strong tint, inverted text.', image: imageRef(getAsset(1)) },
            { _type: 'cardGridItem', _key: 'c2', cardType: 'media-description-below', title: 'Card 2', description: 'Strong tint, inverted text.', image: imageRef(getAsset(2)) },
            { _type: 'cardGridItem', _key: 'c3', cardType: 'media-description-below', title: 'Card 3', description: 'Strong tint, inverted text.', image: imageRef(getAsset(3)) },
          ],
        },
      ],
    },
    {
      _type: 'labBlockPage',
      _id: 'labBlockPage-carousel',
      slug: 'carousel',
      title: 'Carousel',
      sections: [
        {
          _type: 'carousel',
          _key: 'car-compact-ghost',
          title: 'Carousel · Compact',
          cardSize: 'compact',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'cardItem', _key: 'i1', cardType: 'media', title: 'Card 1', description: 'Compact card with image.', image: imageRef(getAsset(0)) },
            { _type: 'cardItem', _key: 'i2', cardType: 'media', title: 'Card 2', description: 'Compact card with image.', image: imageRef(getAsset(1)) },
            { _type: 'cardItem', _key: 'i3', cardType: 'media', title: 'Card 3', description: 'Compact card with image.', image: imageRef(getAsset(2)) },
            { _type: 'cardItem', _key: 'i4', cardType: 'media', title: 'Card 4', description: 'Compact card with image.', image: imageRef(getAsset(3)) },
          ],
        },
        {
          _type: 'carousel',
          _key: 'car-medium-minimal',
          title: 'Carousel · Medium',
          cardSize: 'medium',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'cardItem', _key: 'i1', cardType: 'media', title: 'Card 1', description: 'Medium card (4:5).', image: imageRef(getAsset(4)) },
            { _type: 'cardItem', _key: 'i2', cardType: 'media', title: 'Card 2', description: 'Medium card (4:5).', image: imageRef(getAsset(5)) },
            { _type: 'cardItem', _key: 'i3', cardType: 'media', title: 'Card 3', description: 'Medium card (4:5).', image: imageRef(getAsset(6)) },
          ],
        },
        {
          _type: 'carousel',
          _key: 'car-large-bold',
          title: 'Carousel · Large',
          cardSize: 'large',
          emphasis: 'bold',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'cardItem', _key: 'i1', cardType: 'media', title: 'Card 1', description: 'Large card (2:1).', image: imageRef(getAsset(7)) },
            { _type: 'cardItem', _key: 'i2', cardType: 'media', title: 'Card 2', description: 'Large card (2:1).', image: imageRef(getAsset(8)) },
            { _type: 'cardItem', _key: 'i3', cardType: 'media', title: 'Card 3', description: 'Large card (2:1).', image: imageRef(getAsset(0)) },
          ],
        },
      ],
    },
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
      _id: 'labBlockPage-list',
      slug: 'list',
      title: 'List',
      sections: [
        {
          _type: 'list',
          _key: 'list-text',
          blockTitle: 'Features',
          listVariant: 'textList',
          emphasis: 'ghost',
          surfaceColour: 'primary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'listItem', _key: 't1', title: 'Fast delivery', body: 'Same-day shipping across major cities.', linkText: 'Track order', linkUrl: '#' },
            { _type: 'listItem', _key: 't2', title: 'Secure payments', body: 'Encrypted checkout with multiple payment options.' },
            { _type: 'listItem', _key: 't3', title: '24/7 support', body: 'Always here to help.', linkText: 'Contact us', linkUrl: '#' },
          ],
        },
        {
          _type: 'list',
          _key: 'list-faq',
          blockTitle: 'Frequently asked questions',
          listVariant: 'faq',
          emphasis: 'minimal',
          surfaceColour: 'secondary',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'listItem', _key: 'f1', title: 'How do I track my order?', body: 'Log in to your account and go to Orders. You can view real-time tracking for all active shipments.' },
            { _type: 'listItem', _key: 'f2', title: 'What is your return policy?', body: 'We offer a 30-day return window for most items. Items must be unused and in original packaging.' },
            { _type: 'listItem', _key: 'f3', title: 'How can I contact support?', body: 'Use the in-app chat, call our helpline, or email support@example.com. We respond within 24 hours.' },
          ],
        },
        {
          _type: 'list',
          _key: 'list-links',
          blockTitle: 'Quick links',
          listVariant: 'links',
          emphasis: 'subtle',
          surfaceColour: 'sparkle',
          spacingTop: 'large',
          spacingBottom: 'large',
          items: [
            { _type: 'listItem', _key: 'l1', subtitle: 'My Account', linkUrl: '#' },
            { _type: 'listItem', _key: 'l2', subtitle: 'Order history', linkUrl: '#' },
            { _type: 'listItem', _key: 'l3', subtitle: 'Help centre', linkUrl: '#' },
            { _type: 'listItem', _key: 'l4', subtitle: 'Store locator', linkUrl: '#' },
          ],
        },
      ],
    },
  ]

  for (const page of labBlockPages) {
    await client.createOrReplace(page)
    console.log(`Created Lab block page: ${page.title} (/lab/${page.slug})`)
  }

  // Lab overview – singleton for /lab page with List block (links variant) linking to each block page
  const labOverview = {
    _type: 'labOverview',
    _id: 'labOverview',
    sections: [
      {
        _type: 'list',
        _key: 'lab-overview-blocks',
        blockTitle: 'Blocks',
        listVariant: 'links',
        emphasis: 'ghost',
        surfaceColour: 'primary',
        spacingTop: 'large',
        spacingBottom: 'large',
        items: [
          { _type: 'listItem', _key: 'hero', subtitle: 'Hero', linkUrl: '/lab/hero' },
          { _type: 'listItem', _key: 'media-text', subtitle: 'Media + Text: Stacked', linkUrl: '/lab/media-text' },
          { _type: 'listItem', _key: 'media-text-5050', subtitle: 'Media + Text: 50/50', linkUrl: '/lab/media-text-5050' },
          { _type: 'listItem', _key: 'carousel', subtitle: 'Carousel', linkUrl: '/lab/carousel' },
          { _type: 'listItem', _key: 'card-grid', subtitle: 'Card grid', linkUrl: '/lab/card-grid' },
          { _type: 'listItem', _key: 'icon-grid', subtitle: 'Icon grid', linkUrl: '/lab/icon-grid' },
          { _type: 'listItem', _key: 'proof-points', subtitle: 'Proof points', linkUrl: '/lab/proof-points' },
          { _type: 'listItem', _key: 'list', subtitle: 'List', linkUrl: '/lab/list' },
          { _type: 'listItem', _key: 'fbvc', subtitle: 'Full bleed vertical carousel', linkUrl: '/lab/full-bleed-vertical-carousel' },
          { _type: 'listItem', _key: 'rotating-media', subtitle: 'Rotating media', linkUrl: '/lab/rotating-media' },
          { _type: 'listItem', _key: 'media-zoom-out', subtitle: 'Media zoom out on scroll', linkUrl: '/lab/media-zoom-out-on-scroll' },
        ],
      },
    ],
  }
  await client.createOrReplace(labOverview)
  console.log('Created Lab overview')

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

  console.log('Done. Open your app to see the seeded content.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
