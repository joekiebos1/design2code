/**
 * Replaces cdn.sanity.io image URLs in Strapi Cloud with Supabase DAM images.
 * Run: node scripts/migrate-sanity-to-dam.mjs
 */

const STRAPI_URL = 'https://fearless-power-59058e4b71.strapiapp.com'
const STRAPI_TOKEN = '6e48309961e9dba45a3284d0bf53cb33b439e1841242f72fd2c67a09ffac035e445db102c718540836a12d21c55a0020c9513a15a3284b40792ea8fedef02cf8134b007976d772b5618de0ea1b9ff18e4a9fd5cc097cf7c7d05ba6b93c8388c578e4b7bd7a4cd6cc066bfcd8628aa79b70942e55813245eeb4adfd271eccd5bc'
const SUPABASE_URL = 'https://lcxdmvcwlpgljetipcxo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeGRtdmN3bHBnbGpldGlwY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDEzMDcsImV4cCI6MjA4ODIxNzMwN30.-MJKMW8Yt9TfgR7k9a6SnCkrUsv1YXgdITaF-gvHlyw'

const BLOCK_TO_WORKFLOW = {
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

function isSanityUrl(val) {
  return typeof val === 'string' && val.includes('cdn.sanity.io')
}

function pickImage(dam, component, hint) {
  const preferred = BLOCK_TO_WORKFLOW[component] ?? null
  const keywords = (hint ?? '').toLowerCase().split(/\s+/).filter(w => w.length > 3)
  let pool = preferred ? dam.filter(a => preferred.includes(a.workflow_type)) : dam
  if (!pool.length) pool = dam
  return pool
    .map(a => ({ a, score: a.tags.filter(t => keywords.includes(t.toLowerCase())).length }))
    .sort((x, y) => y.score - x.score)[0]?.a ?? pool[0]
}

// Strip nested component IDs so Strapi v5 doesn't try to re-match them
function stripSubIds(arr) {
  if (!Array.isArray(arr)) return arr
  return arr.map(({ id: _id, ...rest }) => rest)
}

function prepareBlock(block, dam) {
  const component = block.__component ?? ''
  const hint = block.title ?? block.headline ?? block.blockTitle ?? ''
  let changed = false
  // Omit top-level block id — Strapi v5 recreates components on PUT
  const out = { __component: component }

  for (const [k, v] of Object.entries(block)) {
    if (k === '__component' || k === 'id') continue

    if (isSanityUrl(v)) {
      const picked = pickImage(dam, component, hint)
      console.log(`  ↳ [${component}] ${k} → DAM (${picked.workflow_type})`)
      out[k] = picked.image_url
      changed = true
    } else if (Array.isArray(v)) {
      // Sub-component arrays: strip IDs, replace Sanity URLs inside items
      const mapped = v.map(item => {
        const { id: _id, ...itemFields } = item
        let itemChanged = false
        const updatedItem = {}
        for (const [ik, iv] of Object.entries(itemFields)) {
          if (isSanityUrl(iv)) {
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

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function strapiGet(path, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    })
    if (res.ok) return res.json()
    if (res.status === 503 || res.status === 500) {
      console.log(`  Strapi waking up, retrying in ${(i + 1) * 3}s...`)
      await sleep((i + 1) * 3000)
      continue
    }
    throw new Error(`GET ${path} → ${res.status} ${await res.text()}`)
  }
  throw new Error(`GET ${path} failed after ${retries} retries`)
}

async function strapiPut(path, data) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

async function migrateCollection(collection, dam) {
  console.log(`\n=== ${collection} ===`)
  // Fetch summaries first (lightweight), then fetch each page individually with blocks
  const summaries = await strapiGet(`/api/${collection}?pagination[pageSize]=100`)
  const pages = summaries.data ?? []
  console.log(`${pages.length} entries`)

  for (const page of pages) {
    console.log(`\n• ${page.slug}`)
    // Fetch full page with blocks populated
    const full = await strapiGet(`/api/${collection}?filters[documentId][$eq]=${page.documentId}&populate[blocks][populate]=*`)
    const blocks = full.data?.[0]?.blocks ?? []
    if (!blocks.length) { console.log('  no blocks — skipped'); continue }

    let anyChanged = false
    const updatedBlocks = blocks.map(block => {
      const { out, changed } = prepareBlock(block, dam)
      if (changed) anyChanged = true
      return out
    })

    if (!anyChanged) { console.log('  no Sanity URLs — skipped'); continue }

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
  const dam = await res.json()
  console.log(`${dam.length} approved assets`)

  await migrateCollection('pages', dam)
  await migrateCollection('lab-block-pages', dam)
  console.log('\nDone.')
}

main().catch(err => { console.error(err.message); process.exit(1) })
