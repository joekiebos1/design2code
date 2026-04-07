#!/usr/bin/env node
/**
 * Remove all image references from documents, then delete all image assets.
 * Use this to clear the image library so you can upload a fresh batch.
 *
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_API_TOKEN
 * Run: node --env-file=.env scripts/clear-images-and-assets.mjs
 *
 * WARNING: This will remove all images from pages and other documents.
 * Blocks will show empty image slots until you re-seed or add new images.
 */

import { createClient } from '@sanity/client'

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

/** Recursively remove image/video asset references. Returns new object (does not mutate). */
function stripAssetRefs(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => stripAssetRefs(item))
  }
  const result = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ((val._type === 'image' || val._type === 'file') && val.asset?._ref) {
        result[key] = undefined
        continue
      }
    }
    result[key] = stripAssetRefs(val)
  }
  return result
}

async function run() {
  console.log('Clearing image references and deleting assets...')

  // 1. Fetch all image and file assets (images + videos)
  const imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id }`)
  const fileAssets = await client.fetch(`*[_type == "sanity.fileAsset"]{ _id }`)
  const assets = [...imageAssets, ...fileAssets]
  console.log(`Found ${imageAssets.length} image(s) and ${fileAssets.length} file(s)`)

  if (assets.length === 0) {
    console.log('No assets to delete.')
    return
  }

  // 2. Fetch all page documents (full docs - includes drafts)
  const docs = await client.fetch(
    `*[_type == "page" && defined(sections)]{ _id, _rev, _type, title, slug, sections }`
  )

  // 3. Strip image refs and replace each document (full replace to ensure refs are gone)
  for (const doc of docs) {
    const stripped = stripAssetRefs(JSON.parse(JSON.stringify(doc.sections)))
    const cleanSections = JSON.parse(JSON.stringify(stripped))
    const { _rev, ...docWithoutRev } = doc
    await client.createOrReplace({
      ...docWithoutRev,
      sections: cleanSections,
    })
  }
  if (docs.length > 0) {
    console.log(`Cleared image refs from ${docs.length} document(s)`)
  }

  // 3b. Delete draft documents (they hold stale references; published will be recreated on next edit)
  const draftIds = docs.filter((d) => d._id.startsWith('drafts.')).map((d) => d._id)
  if (draftIds.length > 0) {
    const draftTx = client.transaction()
    for (const id of draftIds) {
      draftTx.delete(id)
    }
    await draftTx.commit()
    console.log(`Deleted ${draftIds.length} draft document(s) to clear stale refs`)
  }

  // 4. Delete all image assets
  const deleteTx = client.transaction()
  for (const asset of assets) {
    deleteTx.delete(asset._id)
  }
  await deleteTx.commit()
  console.log(`Deleted ${assets.length} image asset(s)`)

  console.log('Done. You can now upload a fresh batch of images.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
