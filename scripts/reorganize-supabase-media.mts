/**
 * Reorganize studio-media bucket from flat UUID names to:
 *   benchmarks/{slugified-title}.{ext}
 *   jio-designs/{slugified-title}.{ext}
 *
 * Downloads each file from its current Supabase URL, re-uploads with
 * the organized path, updates the Strapi entry, then deletes the old file.
 *
 * Run:  npx tsx --env-file=.env scripts/reorganize-supabase-media.mts
 */

import { createClient } from '@supabase/supabase-js'

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, '') ?? ''
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPA_SECRET = process.env.CMS_SUPABASE_SECRET_KEY ?? ''
const BUCKET = 'studio-media'

if (!STRAPI_URL || !STRAPI_TOKEN || !SUPA_URL || !SUPA_SECRET) {
  console.error('Missing required env vars')
  process.exit(1)
}

const supabase = createClient(SUPA_URL, SUPA_SECRET)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'upload'
}

function strapiHeaders(): HeadersInit {
  return { Authorization: `Bearer ${STRAPI_TOKEN}` }
}

async function run() {
  console.log('Reorganizing studio-media bucket...\n')

  const qs = new URLSearchParams({
    'populate': 'media',
    'pagination[pageSize]': '200',
    'sort': 'createdAt:desc',
  })

  const res = await fetch(`${STRAPI_URL}/api/studio-inspirations?${qs}`, {
    headers: strapiHeaders(),
  })

  if (!res.ok) {
    console.error(`Failed to fetch studio-inspirations: ${res.status}`)
    process.exit(1)
  }

  const json = await res.json() as { data: Record<string, unknown>[] }
  const entries = json.data ?? []
  console.log(`Found ${entries.length} entries\n`)

  let reorganized = 0
  let skipped = 0

  for (const entry of entries) {
    const id = entry.documentId ?? entry.id
    const title = String(entry.title ?? '')
    const category = String(entry.category ?? '')
    const currentMediaUrl = String(entry.mediaUrl ?? '')

    if (!currentMediaUrl.includes('supabase.co/storage/')) {
      console.log(`  [skip] "${title}" — not on Supabase`)
      skipped++
      continue
    }

    // Extract the current storage key from the URL
    const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`
    const keyStart = currentMediaUrl.indexOf(bucketPrefix)
    if (keyStart === -1) {
      console.log(`  [skip] "${title}" — can't parse storage key`)
      skipped++
      continue
    }
    const oldKey = decodeURIComponent(currentMediaUrl.slice(keyStart + bucketPrefix.length))
    const ext = oldKey.split('.').pop() ?? 'bin'

    // Build the new organized path
    const folder = category === 'benchmark' ? 'benchmarks' : 'jio-designs'
    const newKey = `${folder}/${slugify(title)}.${ext}`

    if (oldKey === newKey) {
      console.log(`  [skip] "${title}" — already organized`)
      skipped++
      continue
    }

    // Download from current location
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(oldKey)

    if (downloadError || !fileData) {
      console.error(`  [error] "${title}" — download failed: ${downloadError?.message}`)
      continue
    }

    // Upload to new location
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newKey, fileData, {
        contentType: fileData.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) {
      console.error(`  [error] "${title}" — upload failed: ${uploadError.message}`)
      continue
    }

    // Get new public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(newKey)
    const newUrl = urlData.publicUrl

    // Update Strapi entry
    const updateRes = await fetch(`${STRAPI_URL}/api/studio-inspirations/${id}`, {
      method: 'PUT',
      headers: { ...strapiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { mediaUrl: newUrl } }),
    })

    if (!updateRes.ok) {
      console.error(`  [error] "${title}" — Strapi update failed: ${updateRes.status}`)
      // Clean up the new file since Strapi wasn't updated
      await supabase.storage.from(BUCKET).remove([newKey])
      continue
    }

    // Delete old file
    await supabase.storage.from(BUCKET).remove([oldKey])

    console.log(`  [ok] "${title}" → ${newKey}`)
    reorganized++
  }

  console.log(`\nDone: ${reorganized} reorganized, ${skipped} skipped`)
}

await run()
