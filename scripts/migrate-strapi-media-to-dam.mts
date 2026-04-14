/**
 * Replaces Strapi-hosted media URLs in page blocks with DAM image URLs.
 * Similar to migrate-sanity-to-dam.mjs but targets strapiapp.com media URLs.
 *
 * Run:  npx tsx --env-file=.env scripts/migrate-strapi-media-to-dam.mts
 */

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, '') ?? ''
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''
const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error('Missing STRAPI_URL or STRAPI_API_TOKEN')
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY (DAM)')
  process.exit(1)
}

type DamAsset = {
  id: string
  image_url: string
  workflow_type: string
  tags: string[]
}

const BLOCK_TO_WORKFLOW: Record<string, string[]> = {
  'blocks.hero': ['lifestyle', 'lifestyle-imagery'],
  'blocks.media-text-stacked': ['lifestyle', 'lifestyle-imagery'],
  'blocks.media-text-block': ['lifestyle', 'lifestyle-imagery'],
  'blocks.media-text-5050': ['lifestyle', 'device-in-hand'],
  'blocks.media-text-asymmetric': ['lifestyle', 'lifestyle-imagery'],
  'blocks.card-grid': ['lifestyle', 'lifestyle-imagery'],
  'blocks.carousel': ['lifestyle', 'lifestyle-imagery'],
  'blocks.icon-grid': ['ui-highlight'],
  'blocks.proof-points': ['ui-highlight'],
}

function isStrapiMediaUrl(val: unknown): val is string {
  return typeof val === 'string' && val.includes('strapiapp.com')
}

function pickImage(dam: DamAsset[], component: string, hint: string): DamAsset {
  const preferred = BLOCK_TO_WORKFLOW[component] ?? null
  const keywords = hint.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  let pool = preferred ? dam.filter(a => preferred.includes(a.workflow_type)) : dam
  if (!pool.length) pool = dam
  return pool
    .map(a => ({ a, score: a.tags.filter(t => keywords.includes(t.toLowerCase())).length }))
    .sort((x, y) => y.score - x.score)[0]?.a ?? pool[0]
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function strapiGet(path: string, retries = 5): Promise<Record<string, unknown>> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    })
    if (res.ok) return res.json() as Promise<Record<string, unknown>>
    if (res.status === 503 || res.status === 500) {
      console.log(`  Strapi waking up, retrying in ${(i + 1) * 3}s...`)
      await sleep((i + 1) * 3000)
      continue
    }
    throw new Error(`GET ${path} → ${res.status} ${await res.text()}`)
  }
  throw new Error(`GET ${path} failed after ${retries} retries`)
}

async function strapiPut(path: string, data: unknown) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

function prepareBlock(block: Record<string, unknown>, dam: DamAsset[]): { out: Record<string, unknown>; changed: boolean } {
  const component = String(block.__component ?? '')
  const hint = String(block.title ?? block.headline ?? block.blockTitle ?? '')
  let changed = false
  const out: Record<string, unknown> = { __component: component }

  for (const [k, v] of Object.entries(block)) {
    if (k === '__component' || k === 'id') continue

    if (isStrapiMediaUrl(v)) {
      const picked = pickImage(dam, component, hint)
      console.log(`  ↳ [${component}] ${k} → DAM (${picked.workflow_type})`)
      out[k] = picked.image_url
      changed = true
    } else if (Array.isArray(v)) {
      const mapped = v.map(item => {
        if (!item || typeof item !== 'object') return item
        const { id: _id, ...itemFields } = item as Record<string, unknown>
        let itemChanged = false
        const updatedItem: Record<string, unknown> = {}
        for (const [ik, iv] of Object.entries(itemFields)) {
          if (isStrapiMediaUrl(iv)) {
            const picked = pickImage(dam, component, hint)
            console.log(`    ↳ [${component}] ${k}[].${ik} → DAM`)
            updatedItem[ik] = picked.image_url
            itemChanged = true
            changed = true
          } else {
            updatedItem[ik] = iv
          }
        }
        return itemChanged ? updatedItem : itemFields
      })
      out[k] = mapped
    } else {
      out[k] = v
    }
  }

  return { out, changed }
}

async function migrateCollection(collection: string, dam: DamAsset[]) {
  console.log(`\n=== ${collection} ===`)
  const summaries = await strapiGet(`/api/${collection}?pagination%5BpageSize%5D=100`) as { data: Record<string, unknown>[] }
  const pages = summaries.data ?? []
  console.log(`${pages.length} entries`)

  for (const page of pages) {
    const slug = String(page.slug ?? '')
    console.log(`\n• ${slug}`)

    const full = await strapiGet(
      `/api/${collection}?filters%5BdocumentId%5D%5B%24eq%5D=${page.documentId}&populate%5Bblocks%5D%5Bpopulate%5D=*`
    ) as { data: Record<string, unknown>[] }
    const blocks = (full.data?.[0]?.blocks ?? []) as Record<string, unknown>[]
    if (!blocks.length) { console.log('  no blocks — skipped'); continue }

    let anyChanged = false
    const updatedBlocks = blocks.map(block => {
      const { out, changed } = prepareBlock(block, dam)
      if (changed) anyChanged = true
      return out
    })

    if (!anyChanged) { console.log('  no Strapi media URLs — skipped'); continue }

    await strapiPut(`/api/${collection}/${page.documentId}`, { blocks: updatedBlocks })
    console.log(`  ✓ Saved`)
  }
}

async function main() {
  console.log('Fetching DAM assets...')
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/dam_assets?status=eq.approved&select=id,image_url,product,tags,workflow_type`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
  if (!res.ok) throw new Error(`DAM fetch failed: ${res.status}`)
  const dam = await res.json() as DamAsset[]
  console.log(`${dam.length} approved assets`)

  if (dam.length === 0) {
    console.error('No DAM assets found — cannot migrate.')
    process.exit(1)
  }

  await migrateCollection('pages', dam)
  await migrateCollection('lab-block-pages', dam)
  console.log('\nDone.')
}

await main()
