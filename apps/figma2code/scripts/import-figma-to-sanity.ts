#!/usr/bin/env node
/**
 * Import a Figma frame into Sanity (Figma2Code) using the Figma REST API + extracted TEXT.
 *
 * Requires:
 *   - FIGMA_ACCESS_TOKEN (Figma → Settings → Personal access tokens; file must be readable)
 *   - SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_API_TOKEN
 *
 * Usage:
 *   node --env-file=.env --experimental-strip-types scripts/import-figma-to-sanity.ts --url "https://www.figma.com/design/…?node-id=1005-652"
 *   node … --url "…" --title "My page" --slug my-page
 *
 * Document _id: figmaDesign.{fileKey}.{node-id-with-hyphens}
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  sanityBlockShapeFromFigmaInstanceName,
  variantFieldsFromFigmaComponentProperties,
} from '../lib/figma/figma-block-map.ts'
import { expandFigmaSectionForSanity } from '../lib/figma/figma-design-placeholders.ts'
import { parseFigmaDesignUrl } from '../lib/figma/parse-figma-design-url.ts'
import { fetchFigmaFileNodes, getDocumentRoot } from '../lib/figma/figma-rest-api.ts'
import {
  extractImportedContentForBlock,
  getPageSectionRoots,
} from '../lib/figma/extract-figma-text-for-blocks.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

type CliJson = { url: string; title?: string; slug?: string }

function parseCli(): { url: string | null; title: string | null; slug: string | null; file: string | null; stdin: boolean } {
  const args = process.argv.slice(2)
  let url: string | null = null
  let title: string | null = null
  let slug: string | null = null
  let file: string | null = null
  let stdin = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[++i]
    else if (args[i] === '--title' && args[i + 1]) title = args[++i]
    else if (args[i] === '--slug' && args[i + 1]) slug = args[++i]
    else if (args[i] === '--file' && args[i + 1]) file = args[++i]
    else if (args[i] === '--stdin') stdin = true
  }
  return { url, title, slug, file, stdin }
}

async function main() {
  const cli = parseCli()

  let url: string | null = cli.url
  let titleOverride = cli.title
  let slugOverride = cli.slug

  if (cli.file) {
    const j = JSON.parse(await readFile(cli.file, 'utf8')) as CliJson
    url = j.url
    titleOverride = titleOverride ?? j.title ?? null
    slugOverride = slugOverride ?? j.slug ?? null
  } else if (cli.stdin || (!url && !process.stdin.isTTY)) {
    // Do not read stdin when --url is already set and stdin is non-TTY (e.g. CI/Cursor),
    // or readStdin() waits forever for EOF.
    const raw = await readStdin()
    if (raw) {
      const j = JSON.parse(raw) as CliJson
      url = url ?? j.url
      titleOverride = titleOverride ?? j.title ?? null
      slugOverride = slugOverride ?? j.slug ?? null
    }
  }

  if (!url) {
    console.error(
      'Usage: node --env-file=.env --experimental-strip-types scripts/import-figma-to-sanity.ts --url "<figma design url>" [--title "..."] [--slug my-slug]',
    )
    console.error('   or: echo \'{"url":"…"}\' | … --stdin')
    process.exit(1)
  }

  const figmaToken = process.env.FIGMA_ACCESS_TOKEN
  if (!figmaToken) {
    console.error('Set FIGMA_ACCESS_TOKEN in .env (Figma → Settings → Personal access tokens)')
    process.exit(1)
  }

  const parsed = parseFigmaDesignUrl(url)
  if (!parsed?.fileKey || !parsed.nodeId) {
    console.error('Could not parse Figma URL (need /design/… and node-id=…)')
    process.exit(1)
  }

  const { fileKey, nodeId } = parsed

  const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const sanityToken = process.env.SANITY_API_TOKEN

  if (!projectId || projectId === 'your-project-id') {
    console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
    process.exit(1)
  }
  if (!sanityToken) {
    console.error('Set SANITY_API_TOKEN in .env')
    process.exit(1)
  }

  console.log('Fetching Figma nodes…')
  const figmaJson = await fetchFigmaFileNodes(fileKey, [nodeId], figmaToken)
  const frame = getDocumentRoot(figmaJson, nodeId)
  if (!frame) {
    console.error('Figma API returned no document for this node id. Check token access and node-id.')
    process.exit(1)
  }

  const sectionRoots = getPageSectionRoots(frame)
  if (sectionRoots.length === 0) {
    console.error(
      'No INSTANCE/COMPONENT children found on the frame. Add DotCom BETA block instances as direct children (or one wrapper FRAME containing them).',
    )
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token: sanityToken,
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

  for (const root of sectionRoots) {
    const fromName = sanityBlockShapeFromFigmaInstanceName(root.name)
    if (!fromName) {
      errors.push(`Skipped unmapped instance: "${root.name}"`)
      continue
    }
    const fromProps = variantFieldsFromFigmaComponentProperties(
      fromName._type,
      root.componentProperties as Record<string, unknown> | undefined,
    )
    const shape = { ...fromName, ...fromProps }
    const imported = extractImportedContentForBlock(shape._type, root)
    const sectionKey = newKey()
    sections.push(
      expandFigmaSectionForSanity(shape, sectionKey, { assetId, imageRef, newKey }, imported),
    )
  }

  if (sections.length === 0) {
    console.error(errors.join('\n') || 'No sections to import.')
    process.exit(1)
  }
  if (errors.length > 0) console.warn(errors.join('\n'))

  const title = titleOverride?.trim() || frame.name || 'Figma import'
  const slug = slugOverride?.trim() || slugify(title)
  const nodePart = nodeId.replace(/:/g, '-')
  const _id = `figmaDesign.${fileKey}.${nodePart}`

  const doc = {
    _type: 'figmaDesign' as const,
    _id,
    title,
    slug: { _type: 'slug' as const, current: slug },
    figmaFileUrl: url,
    sections,
  }

  await client.createOrReplace(doc)
  console.log(`OK createOrReplace ${_id}`)
  console.log(`slug: ${slug} → /figma2code/${slug}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
