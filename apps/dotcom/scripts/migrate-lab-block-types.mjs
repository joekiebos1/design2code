#!/usr/bin/env node
/**
 * Migrate lab page documents to use lab-prefixed block type names.
 *
 * SAFETY: Before any mutation, exports a full backup of every labBlockPage
 * and labOverview document to scripts/lab-backup-<timestamp>.json.
 * All content fields are preserved — only _type values are renamed.
 *
 * Renames _type values inside labPageBuilder arrays:
 *   hero → labHero, mediaTextStacked → labMediaTextStacked, mediaText5050 → labMediaText5050,
 *   editorialBlock → labEditorialBlock, fullBleedVerticalCarousel → labFullBleedVerticalCarousel,
 *   rotatingMedia → labRotatingMedia, mediaZoomOutOnScroll → labMediaZoomOutOnScroll,
 *   iconGrid → labIconGrid, proofPoints → labProofPoints,
 *   carousel → labCarousel, cardGrid → labCardGrid,
 *   mediaTextAsymmetric → labMediaTextAsymmetric.
 *
 * Also migrates sub-item _type within arrays (items, longFormParagraphs, paragraphRows):
 *   fullBleedVerticalCarouselItem → labFullBleedVerticalCarouselItem,
 *   rotatingMediaItem → labRotatingMediaItem,
 *   iconGridItem → labIconGridItem,
 *   mediaTextAsymmetricItem → labMediaTextAsymmetricItem,
 *   mediaTextAsymmetricParagraphRow → labMediaTextAsymmetricParagraphRow,
 *   cardItem → labCardItem, cardGridItem → labCardGridItem (if used).
 *
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_API_TOKEN
 *
 * Run from repo root:
 *   Dry run (default):  node --env-file=apps/dotcom/.env apps/dotcom/scripts/migrate-lab-block-types.mjs
 *   Apply:              node --env-file=apps/dotcom/.env apps/dotcom/scripts/migrate-lab-block-types.mjs --apply
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
if (!token) {
  console.error('Set SANITY_API_TOKEN in .env (write token from sanity.io/manage)')
  process.exit(1)
}

const apply = process.argv.includes('--apply')

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const BLOCK_TYPE_MAP = {
  hero: 'labHero',
  mediaTextStacked: 'labMediaTextStacked',
  mediaText5050: 'labMediaText5050',
  editorialBlock: 'labEditorialBlock',
  fullBleedVerticalCarousel: 'labFullBleedVerticalCarousel',
  rotatingMedia: 'labRotatingMedia',
  mediaZoomOutOnScroll: 'labMediaZoomOutOnScroll',
  iconGrid: 'labIconGrid',
  proofPoints: 'labProofPoints',
  carousel: 'labCarousel',
  cardGrid: 'labCardGrid',
  mediaTextAsymmetric: 'labMediaTextAsymmetric',
}

const ITEM_TYPE_MAP = {
  fullBleedVerticalCarouselItem: 'labFullBleedVerticalCarouselItem',
  rotatingMediaItem: 'labRotatingMediaItem',
  iconGridItem: 'labIconGridItem',
  mediaTextAsymmetricItem: 'labMediaTextAsymmetricItem',
  mediaTextAsymmetricParagraphRow: 'labMediaTextAsymmetricParagraphRow',
  cardItem: 'labCardItem',
  cardGridItem: 'labCardGridItem',
}

function migrateItemsArray(arr) {
  if (!Array.isArray(arr)) return false
  let changed = false
  for (const item of arr) {
    if (item && typeof item === 'object' && item._type && ITEM_TYPE_MAP[item._type]) {
      item._type = ITEM_TYPE_MAP[item._type]
      changed = true
    }
  }
  return changed
}

async function backupCurrentState() {
  console.log('Backing up current Sanity lab data...\n')

  const labBlockPages = await client.fetch(`*[_type == "labBlockPage"]`)
  const labOverview = await client.fetch(`*[_type == "labOverview"]`)
  const pages = await client.fetch(`*[_type == "page"]`)

  const backup = {
    exportedAt: new Date().toISOString(),
    dataset,
    projectId,
    labBlockPages: labBlockPages ?? [],
    labOverview: labOverview ?? [],
    pages: pages ?? [],
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupPath = join(__dirname, `lab-backup-${timestamp}.json`)
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8')

  console.log(`  labBlockPages: ${backup.labBlockPages.length} document(s)`)
  console.log(`  labOverview:   ${backup.labOverview.length} document(s)`)
  console.log(`  pages:         ${backup.pages.length} document(s)`)
  console.log(`\n  Backup saved to: ${backupPath}\n`)

  return { labBlockPages: backup.labBlockPages, labOverview: backup.labOverview }
}

function migrateDocument(doc) {
  const sections = doc.sections
  if (!Array.isArray(sections) || sections.length === 0) return { changed: false, renames: [] }

  let changed = false
  const renames = []

  for (const section of sections) {
    if (!section || typeof section !== 'object') continue

    if (section._type && BLOCK_TYPE_MAP[section._type]) {
      const oldType = section._type
      section._type = BLOCK_TYPE_MAP[oldType]
      renames.push(`${oldType} → ${section._type}`)
      changed = true
    }

    const arrayFields = ['items', 'longFormParagraphs', 'paragraphRows', 'accordionItems']
    for (const field of arrayFields) {
      if (section[field]) {
        const itemChanged = migrateItemsArray(section[field])
        if (itemChanged) changed = true
      }
    }
  }

  return { changed, renames }
}

async function run() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Migrate lab block types — ${apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Project: ${projectId}, Dataset: ${dataset}`)
  console.log(`${'='.repeat(60)}\n`)

  const { labBlockPages, labOverview } = await backupCurrentState()

  const allDocs = [...labBlockPages, ...labOverview]
  console.log(`Processing ${allDocs.length} document(s)...\n`)

  let totalPatched = 0

  for (const doc of allDocs) {
    const { changed, renames } = migrateDocument(doc)

    if (changed) {
      totalPatched++
      const slug = doc.slug ?? doc._id
      for (const r of renames) {
        console.log(`  [${slug}] ${r}`)
      }

      if (apply) {
        await client
          .patch(doc._id)
          .ifRevisionId(doc._rev)
          .set({ sections: doc.sections })
          .commit()
        console.log(`  ✓ Patched ${doc._id}\n`)
      } else {
        console.log(`  (dry run) Would patch ${doc._id}\n`)
      }
    }
  }

  console.log(`${'='.repeat(60)}`)
  console.log(`${totalPatched} document(s) ${apply ? 'patched' : 'would be patched'}`)
  if (!apply && totalPatched > 0) {
    console.log('\nRun with --apply to commit changes.')
    console.log('All content fields are preserved — only _type values are renamed.')
  }
  console.log()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
