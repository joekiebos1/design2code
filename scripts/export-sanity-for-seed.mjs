#!/usr/bin/env node
/**
 * Export current Sanity content for use when updating seed scripts.
 * Run BEFORE modifying seed-sanity.mjs or other seeds.
 *
 * Usage: node --env-file=.env scripts/export-sanity-for-seed.mjs
 *
 * Output: scripts/sanity-export.json
 *
 * Use this file as the source of truth for document structure, field names,
 * and current values when updating seeds. Do NOT rely on old seed content.
 */
import { createClient } from '@sanity/client'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token: token || undefined,
  useCdn: false,
})

async function exportForSeed() {
  console.log('Exporting current Sanity content for seed reference...\n')

  const output = {
    exportedAt: new Date().toISOString(),
    dataset,
    projectId,
    labBlockPages: [],
    labOverview: null,
    imageAssets: [],
  }

  // Lab block pages – full structure for seed reference (fetch full documents)
  const labBlockPages = await client.fetch(
    `*[_type == "labBlockPage"] | order(slug asc)`
  )
  output.labBlockPages = labBlockPages ?? []
  console.log(`  labBlockPages: ${output.labBlockPages.length}`)

  // Lab overview (list items)
  const labOverview = await client.fetch(
    `*[_type == "labOverview"][0]{
      _id,
      _type,
      listItems[]{
        _type,
        _key,
        subtitle,
        linkUrl
      }
    }`
  )
  output.labOverview = labOverview
  console.log(`  labOverview: ${labOverview ? 'found' : 'not found'}`)

  // Image assets (IDs only)
  const imageAssets = await client.fetch(`*[_type == "sanity.imageAsset"]{ _id }`)
  output.imageAssets = imageAssets ?? []
  console.log(`  imageAssets: ${output.imageAssets.length}`)

  const outPath = join(__dirname, 'sanity-export.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\nWrote ${outPath}`)
  console.log('\nUse this file as the source of truth when updating seed scripts.')
}

exportForSeed().catch((e) => {
  console.error(e)
  process.exit(1)
})
