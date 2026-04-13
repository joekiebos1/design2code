const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

export type DamAsset = {
  id: string
  image_url: string
  product: string
  tags: string[]
  workflow_type: 'device-in-hand' | 'ui-highlight' | 'lifestyle' | 'lifestyle-imagery'
  status: string
  original_prompt: string
  enhanced_prompt: string
}

async function query(params: Record<string, string>): Promise<DamAsset[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/dam_assets`)
  url.searchParams.set('status', 'eq.approved')
  url.searchParams.set('select', '*')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!res.ok) throw new Error(`DAM fetch failed: ${res.status}`)
  return res.json() as Promise<DamAsset[]>
}

export async function fetchApprovedAssets(): Promise<DamAsset[]> {
  return query({})
}

export async function fetchAssetsByProduct(product: string): Promise<DamAsset[]> {
  return query({ product: `eq.${product}` })
}

export async function fetchAssetsByTags(tags: string[]): Promise<DamAsset[]> {
  // cs = contains (array overlap in PostgREST uses cs for "contains any")
  return query({ tags: `cs.{${tags.join(',')}}` })
}

export { selectImage } from './art-director'
export type { ArtDirectorInput, ArtDirectorResult } from './art-director'
