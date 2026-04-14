/**
 * One-shot migration: download media from Strapi uploads and
 * re-upload to Supabase Storage (studio-media bucket).
 *
 * Updates Strapi entries so their media URLs point to Supabase.
 *
 * Run:  npx tsx --env-file=.env scripts/migrate-media-to-supabase.mts
 */

import { createClient } from '@supabase/supabase-js'

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, '') ?? ''
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPA_SECRET = process.env.CMS_SUPABASE_SECRET_KEY ?? ''
const BUCKET = 'studio-media'

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error('Missing STRAPI_URL or STRAPI_API_TOKEN in env')
  process.exit(1)
}
if (!SUPA_URL || !SUPA_SECRET) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or CMS_SUPABASE_SECRET_KEY in env')
  process.exit(1)
}

const supabase = createClient(SUPA_URL, SUPA_SECRET)

function strapiHeaders(): HeadersInit {
  return { Authorization: `Bearer ${STRAPI_TOKEN}` }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Download a file from a URL and return it as a Buffer + content type. */
async function downloadFile(url: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`)
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
  return { buffer, contentType }
}

/** Upload a buffer to Supabase Storage and return the public URL. */
async function uploadToSupabase(
  buffer: ArrayBuffer,
  contentType: string,
  originalName: string,
): Promise<string> {
  const ext = originalName.split('.').pop() ?? 'bin'
  const storageKey = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, buffer, { contentType, upsert: false })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storageKey)
  return data.publicUrl
}

/** Resolve a Strapi media URL to an absolute URL. */
function absoluteStrapiUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('http')) return urlOrPath
  return `${STRAPI_URL}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`
}

/** Check if a URL is already a Supabase Storage URL. */
function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage/')
}

/* ------------------------------------------------------------------ */
/*  Migrate studio inspirations                                        */
/* ------------------------------------------------------------------ */

async function migrateStudioInspirations() {
  console.log('\n--- Migrating studio inspirations ---')

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
    return
  }

  const json = await res.json() as { data: Record<string, unknown>[] }
  const entries = json.data ?? []
  console.log(`Found ${entries.length} studio inspiration entries`)

  let migrated = 0
  let skipped = 0

  for (const entry of entries) {
    const id = entry.documentId ?? entry.id
    const title = String(entry.title ?? '')

    // Get media URL from Strapi media relation
    const media = entry.media as Record<string, unknown> | null
    const mediaUrl = media?.url as string | null
    const existingMediaUrl = entry.mediaUrl as string | null

    const sourceUrl = mediaUrl ?? existingMediaUrl
    if (!sourceUrl) {
      console.log(`  [skip] "${title}" — no media`)
      skipped++
      continue
    }

    const absoluteUrl = absoluteStrapiUrl(sourceUrl)

    if (isSupabaseUrl(absoluteUrl)) {
      console.log(`  [skip] "${title}" — already on Supabase`)
      skipped++
      continue
    }

    try {
      const fileName = absoluteUrl.split('/').pop()?.split('?')[0] ?? 'file'
      const { buffer, contentType } = await downloadFile(absoluteUrl)
      const newUrl = await uploadToSupabase(buffer, contentType, fileName)

      // Update Strapi entry with the new Supabase URL
      const updateRes = await fetch(`${STRAPI_URL}/api/studio-inspirations/${id}`, {
        method: 'PUT',
        headers: {
          ...strapiHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            mediaUrl: newUrl,
            mimeType: contentType,
          },
        }),
      })

      if (!updateRes.ok) {
        const errText = await updateRes.text().catch(() => '')
        console.error(`  [error] "${title}" — Strapi update failed: ${updateRes.status} ${errText.slice(0, 200)}`)
        continue
      }

      console.log(`  [ok] "${title}" → ${newUrl}`)
      migrated++
    } catch (err) {
      console.error(`  [error] "${title}" — ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`Studio inspirations: ${migrated} migrated, ${skipped} skipped`)
}

/* ------------------------------------------------------------------ */
/*  Migrate lab block page media                                       */
/* ------------------------------------------------------------------ */

/**
 * Recursively walk a JSONB structure and replace Strapi media URLs
 * with Supabase Storage URLs.
 */
async function migrateUrlsInObject(obj: unknown): Promise<{ changed: boolean; value: unknown }> {
  if (typeof obj === 'string') {
    // Check if this is a Strapi upload URL
    if (
      (obj.startsWith('/uploads/') || obj.includes(STRAPI_URL + '/uploads/')) &&
      !isSupabaseUrl(obj)
    ) {
      try {
        const absoluteUrl = absoluteStrapiUrl(obj)
        const fileName = absoluteUrl.split('/').pop()?.split('?')[0] ?? 'file'
        const { buffer, contentType } = await downloadFile(absoluteUrl)
        const newUrl = await uploadToSupabase(buffer, contentType, fileName)
        return { changed: true, value: newUrl }
      } catch (err) {
        console.error(`    [warn] Failed to migrate URL "${obj}": ${err instanceof Error ? err.message : err}`)
        return { changed: false, value: obj }
      }
    }
    return { changed: false, value: obj }
  }

  if (Array.isArray(obj)) {
    let anyChanged = false
    const newArr = []
    for (const item of obj) {
      const result = await migrateUrlsInObject(item)
      if (result.changed) anyChanged = true
      newArr.push(result.value)
    }
    return { changed: anyChanged, value: newArr }
  }

  if (obj && typeof obj === 'object') {
    let anyChanged = false
    const newObj: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const result = await migrateUrlsInObject(val)
      if (result.changed) anyChanged = true
      newObj[key] = result.value
    }
    return { changed: anyChanged, value: newObj }
  }

  return { changed: false, value: obj }
}

async function migrateLabBlockPages() {
  console.log('\n--- Migrating lab block page media ---')

  const qs = new URLSearchParams({
    'populate[blocks][populate]': '*',
    'pagination[pageSize]': '100',
  })

  const res = await fetch(`${STRAPI_URL}/api/lab-block-pages?${qs}`, {
    headers: strapiHeaders(),
  })

  if (!res.ok) {
    console.error(`Failed to fetch lab-block-pages: ${res.status}`)
    return
  }

  const json = await res.json() as { data: Record<string, unknown>[] }
  const pages = json.data ?? []
  console.log(`Found ${pages.length} lab block pages`)

  let migrated = 0
  let skipped = 0

  for (const page of pages) {
    const id = page.documentId ?? page.id
    const slug = String(page.slug ?? '')
    const blocks = page.blocks as unknown

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      console.log(`  [skip] "${slug}" — no blocks`)
      skipped++
      continue
    }

    const result = await migrateUrlsInObject(blocks)

    if (!result.changed) {
      console.log(`  [skip] "${slug}" — no Strapi media URLs found`)
      skipped++
      continue
    }

    // Update the blocks in Strapi with migrated URLs
    const updateRes = await fetch(`${STRAPI_URL}/api/lab-block-pages/${id}`, {
      method: 'PUT',
      headers: {
        ...strapiHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { blocks: result.value } }),
    })

    if (!updateRes.ok) {
      const errText = await updateRes.text().catch(() => '')
      console.error(`  [error] "${slug}" — Strapi update failed: ${updateRes.status} ${errText.slice(0, 200)}`)
      continue
    }

    console.log(`  [ok] "${slug}" — media URLs migrated`)
    migrated++
  }

  console.log(`Lab block pages: ${migrated} migrated, ${skipped} skipped`)
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

console.log('Migrating media from Strapi to Supabase Storage')
console.log(`Strapi: ${STRAPI_URL}`)
console.log(`Supabase: ${SUPA_URL}`)
console.log(`Bucket: ${BUCKET}`)

await migrateStudioInspirations()
await migrateLabBlockPages()

console.log('\nDone.')
