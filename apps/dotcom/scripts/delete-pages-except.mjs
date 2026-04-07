#!/usr/bin/env node
/**
 * Delete all page documents from Sanity except pixel-10-pro and jiogames.
 *
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_API_TOKEN
 * Run: node --env-file=.env scripts/delete-pages-except.mjs
 *
 * WARNING: This permanently deletes pages. Only pixel-10-pro and jiogames are kept.
 */

import { createClient } from '@sanity/client'

const KEEP_SLUGS = ['pixel-10-pro', 'jiogames']

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
  process.exit(1)
}

if (!token) {
  console.error('Set SANITY_API_TOKEN in .env (Editor permissions)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  console.log('Fetching all page documents...')

  const pages = await client.fetch(
    `*[_type == "page"]{ _id, "slug": slug.current }`
  )

  const toDelete = pages.filter(
    (p) => !p.slug || !KEEP_SLUGS.includes(p.slug)
  )
  const toKeep = pages.filter((p) => p.slug && KEEP_SLUGS.includes(p.slug))

  console.log(`Found ${pages.length} page(s): ${pages.map((p) => p.slug || p._id).join(', ')}`)
  console.log(`Keeping: ${toKeep.map((p) => p.slug).join(', ')}`)
  console.log(`Deleting: ${toDelete.map((p) => `${p.slug || p._id} (${p._id})`).join(', ')}`)

  if (toDelete.length === 0) {
    console.log('No pages to delete.')
    return
  }

  const tx = client.transaction()
  for (const page of toDelete) {
    tx.delete(page._id)
  }
  await tx.commit()

  console.log(`Deleted ${toDelete.length} page(s).`)
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
