#!/usr/bin/env node
/**
 * Fix invalid carousel cardSize values in Sanity.
 * Removes: null, undefined, 'large-4x5'
 * Replaces with: 'compact' or 'medium' based on intended layout.
 *
 * Run: node --env-file=.env scripts/fix-carousel-cardSize.mjs
 */

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !token) {
  console.error('Set SANITY_STUDIO_PROJECT_ID and SANITY_API_TOKEN in .env')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const VALID = ['compact', 'medium', 'large']

function isWrong(val) {
  return val == null || val === '' || !VALID.includes(val)
}

function getCorrectValue(_key, current) {
  // car-gemini had 'large-4x5' → medium (2 per row, 4:5)
  if (current === 'large-4x5') return 'medium'
  // null/undefined → compact
  return 'compact'
}

async function main() {
  const page = await client.fetch(
    `*[_type == "page" && slug.current == "pixel-10-pro"][0]{ _id, "sections": sections[] { _type, _key, cardSize } }`
  )
  if (!page) {
    console.log('Page pixel-10-pro not found')
    return
  }

  const sections = page.sections || []
  const patches = {}

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]
    if (s._type === 'carousel' && isWrong(s.cardSize)) {
      const correct = getCorrectValue(s._key, s.cardSize)
      patches[`sections[${i}].cardSize`] = correct
      console.log(`  sections[${i}] (_key: ${s._key}): ${JSON.stringify(s.cardSize)} → "${correct}"`)
    }
  }

  if (Object.keys(patches).length === 0) {
    console.log('No invalid cardSize values found.')
    return
  }

  console.log('\nPatching...')
  await client.patch(page._id).set(patches).commit()
  console.log('Done.')
}

main().catch(console.error)
