#!/usr/bin/env node
/**
 * Debug script: fetch pixel-10-pro page and log carousel block data.
 * Run: node --env-file=.env scripts/debug-carousel-cardSize.mjs
 */

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const PAGE_SECTIONS_PROJECTION = `{
  _type,
  _key,
  _type == "carousel" => {
    spacingTop,
    spacingBottom,
    spacing,
    title,
    cardSize,
    surface,
    blockAccent,
    items[]{ cardType, title }
  }
}`

const query = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  sections[]${PAGE_SECTIONS_PROJECTION}
}`

async function main() {
  const page = await client.fetch(query, { slug: 'pixel-10-pro' })
  if (!page) {
    console.log('Page not found')
    return
  }
  console.log('Page:', page.title, '(slug:', page.slug, ')')
  console.log('Sections count:', page.sections?.length ?? 0)
  const carousels = page.sections?.filter((s) => s?._type === 'carousel') ?? []
  console.log('Carousel blocks:', carousels.length)
  carousels.forEach((c, i) => {
    console.log(`\n--- Carousel ${i + 1} (_key: ${c._key}) ---`)
    console.log('  title:', c.title)
    console.log('  cardSize:', JSON.stringify(c.cardSize), '(type:', typeof c.cardSize, ')')
    console.log('  surface:', c.surface)
    console.log('  blockAccent:', c.blockAccent)
    console.log('  All keys:', Object.keys(c).filter((k) => !k.startsWith('_')).join(', '))
  })
}

main().catch(console.error)
