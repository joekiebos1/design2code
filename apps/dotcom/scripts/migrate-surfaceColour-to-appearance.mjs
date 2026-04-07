#!/usr/bin/env node
/**
 * One-off Sanity migration: rename block field `surfaceColour` → `appearance` on all page/lab sections.
 *
 * Prerequisites:
 *   - SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET (or NEXT_PUBLIC_*)
 *   - SANITY_API_TOKEN with write access (dataset editor)
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-surfaceColour-to-appearance.mjs           # dry-run (default)
 *   node --env-file=.env scripts/migrate-surfaceColour-to-appearance.mjs --apply # commit patches
 *
 * Idempotent: only copies when `appearance` is unset and `surfaceColour` is set; then removes `surfaceColour`.
 */

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN
const apply = process.argv.includes('--apply')

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
  process.exit(1)
}

if (apply && !token) {
  console.error('SANITY_API_TOKEN is required for --apply')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token: token || undefined,
  useCdn: false,
})

const DOC_TYPES = ['page', 'labBlockPage', 'labOverview', 'figmaDesign']

/**
 * Recursively migrate plain objects: if both keys matter, only at "block" level we expect surfaceColour.
 * Any object with surfaceColour and without appearance gets appearance = surfaceColour; surfaceColour removed.
 */
function migrateValue(value) {
  if (value === null || value === undefined) return { changed: false, value }
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((item) => {
      const r = migrateValue(item)
      if (r.changed) changed = true
      return r.value
    })
    return { changed, value: next }
  }
  if (typeof value !== 'object') return { changed: false, value }

  let changed = false
  let out = { ...value }

  if (
    Object.prototype.hasOwnProperty.call(out, 'surfaceColour') &&
    (out.appearance === undefined || out.appearance === null) &&
    out.surfaceColour != null
  ) {
    out.appearance = out.surfaceColour
    delete out.surfaceColour
    changed = true
  }

  for (const key of Object.keys(out)) {
    const r = migrateValue(out[key])
    if (r.changed) {
      out[key] = r.value
      changed = true
    }
  }

  return { changed, value: out }
}

function migrateSections(sections) {
  if (!Array.isArray(sections)) return { changed: false, sections }
  let changed = false
  const next = sections.map((block) => {
    const r = migrateValue(block)
    if (r.changed) changed = true
    return r.value
  })
  return { changed, sections: next }
}

async function main() {
  console.log(`migrate surfaceColour → appearance (${apply ? 'APPLY' : 'dry-run'})`)
  console.log(`  project=${projectId} dataset=${dataset}\n`)

  let totalDocs = 0
  let patchedDocs = 0

  for (const _type of DOC_TYPES) {
    const ids = await client.fetch(`*[_type == $t]{ _id }`, { t: _type })
    for (const row of ids ?? []) {
      totalDocs++
      const doc = await client.getDocument(row._id)
      if (!doc?.sections) continue

      const { changed, sections } = migrateSections(doc.sections)
      if (!changed) continue

      patchedDocs++
      console.log(`  ${_type} ${_idShort(row._id)}: sections updated`)

      if (apply) {
        await client.patch(row._id).set({ sections }).commit()
      }
    }
  }

  console.log(`\nDone. Documents scanned: ${totalDocs}, with section changes: ${patchedDocs}`)
  if (!apply) {
    console.log('This was a dry-run. Re-run with --apply to write changes.')
  }
}

function _idShort(id) {
  return typeof id === 'string' && id.length > 12 ? `${id.slice(0, 8)}…` : id
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
