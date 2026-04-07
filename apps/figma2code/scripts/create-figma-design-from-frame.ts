#!/usr/bin/env node
/**
 * Create or replace a `figmaDesign` document from Figma instance layer names.
 *
 * Requires: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_API_TOKEN (Editor)
 * Run: node --env-file=.env --experimental-strip-types scripts/create-figma-design-from-frame.ts --stdin < payload.json
 *
 * Payload JSON:
 * {
 *   "title": "Page name",
 *   "figmaFileUrl": "https://www.figma.com/design/…?node-id=…",
 *   "figmaInstanceNames": ["DotCom BETA - Hero", "DotCom BETA - Carousel"],
 *   "slug": "optional-slug"
 * }
 *
 * Document _id: `figmaDesign.{fileKey}.{node-id-with-hyphens}` so re-imports update the same doc.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { sanityBlockShapeFromFigmaInstanceName } from '../lib/figma/figma-block-map.ts'
import { expandFigmaSectionForSanity } from '../lib/figma/figma-design-placeholders.ts'
import { parseFigmaDesignUrl } from '../lib/figma/parse-figma-design-url.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

type Payload = {
  title: string
  figmaFileUrl: string
  figmaInstanceNames: string[]
  slug?: string
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'figma-design'
  )
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8').trim()
}

function parseArgs(): { file: string | null; useStdin: boolean } {
  const args = process.argv.slice(2)
  let file: string | null = null
  let useStdin = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stdin') useStdin = true
    if (args[i] === '--file' && args[i + 1]) file = args[++i]
  }
  return { file, useStdin }
}

async function main() {
  const { file, useStdin } = parseArgs()

  let raw: string
  if (file) {
    raw = await readFile(file, 'utf8')
  } else if (useStdin || !process.stdin.isTTY) {
    raw = await readStdin()
  } else {
    console.error(
      'Usage: node --env-file=.env --experimental-strip-types scripts/create-figma-design-from-frame.ts --stdin < payload.json',
    )
    console.error(
      '   or: node --env-file=.env --experimental-strip-types scripts/create-figma-design-from-frame.ts --file payload.json',
    )
    process.exit(1)
  }

  const payload = JSON.parse(raw) as Payload
  if (!payload.title || !payload.figmaFileUrl || !Array.isArray(payload.figmaInstanceNames)) {
    console.error('JSON must include title (string), figmaFileUrl (string), figmaInstanceNames (string[])')
    process.exit(1)
  }

  const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId || projectId === 'your-project-id') {
    console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
    process.exit(1)
  }
  if (!token) {
    console.error('Set SANITY_API_TOKEN in .env (Editor token)')
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  const imageRows = await client.fetch<Array<{ _id: string }>>(`*[_type == "sanity.imageAsset"]{ _id }`)
  let assetId: string | undefined = imageRows[0]?._id

  if (!assetId) {
    const placeholderPath = join(__dirname, '../public/placeholder-preview.svg')
    const buffer = readFileSync(placeholderPath)
    const asset = await client.assets.upload('image', buffer, {
      contentType: 'image/svg+xml',
      filename: 'placeholder-preview.svg',
    })
    assetId = asset._id
    console.log('Media Library was empty; uploaded public/placeholder-preview.svg')
  }

  const imageRef = (id: string) => ({
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: id },
  })

  const newKey = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)

  const errors: string[] = []
  const sections: Record<string, unknown>[] = []

  for (const name of payload.figmaInstanceNames) {
    const shape = sanityBlockShapeFromFigmaInstanceName(name)
    if (!shape) {
      errors.push(`Unmapped Figma instance: "${name}"`)
      continue
    }
    const sectionKey = newKey()
    sections.push(
      expandFigmaSectionForSanity(shape, sectionKey, {
        assetId,
        imageRef,
        newKey,
      }),
    )
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  const parsed = parseFigmaDesignUrl(payload.figmaFileUrl)
  const fileKey = parsed?.fileKey ?? 'unknown'
  const nodePart = parsed?.nodeId ? parsed.nodeId.replace(/:/g, '-') : 'no-node'
  const _id = `figmaDesign.${fileKey}.${nodePart}`

  const slug = payload.slug ?? slugify(payload.title)

  const doc = {
    _type: 'figmaDesign' as const,
    _id,
    title: payload.title,
    slug: { _type: 'slug' as const, current: slug },
    figmaFileUrl: payload.figmaFileUrl,
    sections,
  }

  await client.createOrReplace(doc)
  console.log(`OK createOrReplace ${_id}`)
  console.log(`slug: ${slug}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
