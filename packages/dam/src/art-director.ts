import { fetchApprovedAssets, fetchAssetsByProduct, type DamAsset } from './index'

export type ArtDirectorInput = {
  blockType: string
  section: 'setup' | 'engage' | 'resolve'
  product?: string
  headline: string
  mood?: string
}

export type ArtDirectorResult = {
  imageUrl: string
  reason: string
  alternatives: string[]
}

type WorkflowType = DamAsset['workflow_type']

const BLOCK_TO_WORKFLOW: Record<string, WorkflowType[]> = {
  hero: ['lifestyle', 'lifestyle-imagery'],
  mediaTextStacked: ['lifestyle', 'lifestyle-imagery'],
  mediaText5050: ['lifestyle', 'device-in-hand'],
  iconGrid: ['ui-highlight'],
  proofPts: ['ui-highlight'],
}

const SECTION_MOOD_TAGS: Record<string, string[]> = {
  setup: ['joyful', 'vibrant', 'warm', 'bright'],
  engage: ['modern', 'india', 'outdoor'],
  resolve: ['calm', 'neutral', 'natural'],
}

function scoreAsset(asset: DamAsset, keywords: string[], moodTags: string[]): number {
  const assetTags = asset.tags.map((t) => t.toLowerCase())
  let score = 0
  for (const kw of keywords) {
    if (assetTags.includes(kw)) score += 2
  }
  for (const tag of moodTags) {
    if (assetTags.includes(tag)) score += 1
  }
  return score
}

export async function selectImage(input: ArtDirectorInput): Promise<ArtDirectorResult> {
  const { blockType, section, product, headline, mood } = input

  let pool = product ? await fetchAssetsByProduct(product) : []
  if (!pool.length) pool = await fetchApprovedAssets()

  const preferredWorkflows = BLOCK_TO_WORKFLOW[blockType] ?? null
  const filtered = preferredWorkflows
    ? pool.filter((a) => preferredWorkflows.includes(a.workflow_type))
    : pool
  const candidates = filtered.length ? filtered : pool

  const moodTags = [
    ...SECTION_MOOD_TAGS[section] ?? [],
    ...(mood ? mood.toLowerCase().split(/\s+/) : []),
  ]
  const keywords = headline
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)

  const scored = candidates
    .map((asset) => ({ asset, score: scoreAsset(asset, keywords, moodTags) }))
    .sort((a, b) => b.score - a.score)

  if (!scored.length) {
    throw new Error('No approved DAM assets found')
  }

  const [first, second, third] = scored
  const workflowLabel = first.asset.workflow_type.replace(/-/g, ' ')
  const reason = `Selected a ${workflowLabel} image for its relevance to "${headline}" in the ${section} section.`

  return {
    imageUrl: first.asset.image_url,
    reason,
    alternatives: [second?.asset.image_url, third?.asset.image_url].filter(Boolean) as string[],
  }
}
