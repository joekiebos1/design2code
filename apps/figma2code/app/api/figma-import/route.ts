import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { parseFigmaDesignUrl } from '../../../lib/figma/parse-figma-design-url'
import {
  fetchFigmaFileNodes,
  fetchFigmaRenderedImages,
  getDocumentRoot,
} from '../../../lib/figma/figma-rest-api'
import {
  getPageSectionRoots,
  extractImportedContentForBlock,
  collectImageSlots,
  type ImageSlot,
} from '../../../lib/figma/extract-figma-text-for-blocks'
import {
  sanityBlockShapeFromFigmaInstanceName,
  variantFieldsFromFigmaComponentProperties,
} from '../../../lib/figma/figma-block-map'
import { expandFigmaSectionForSanity } from '../../../lib/figma/figma-design-placeholders'

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'figma-import'
  )
}

/**
 * Download an image from a URL as an ArrayBuffer.
 * Figma CDN URLs are temporary — fetch immediately after rendering.
 */
async function downloadImage(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const formatJson = requestUrl.searchParams.get('format') === 'json'

    const body = await request.json()
    const { url, title: titleOverride, slug: slugOverride } = body as {
      url: string
      title?: string
      slug?: string
    }

    if (!url) {
      return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 })
    }

    const figmaToken = process.env.FIGMA_ACCESS_TOKEN
    if (!figmaToken) {
      return NextResponse.json(
        { error: 'Server missing FIGMA_ACCESS_TOKEN — add it to .env' },
        { status: 500 },
      )
    }

    const parsed = parseFigmaDesignUrl(url)
    if (!parsed?.fileKey || !parsed.nodeId) {
      return NextResponse.json(
        { error: 'Could not parse Figma URL — need a /design/ URL with node-id parameter' },
        { status: 400 },
      )
    }

    const { fileKey, nodeId } = parsed

    const figmaJson = await fetchFigmaFileNodes(fileKey, [nodeId], figmaToken)
    const frame = getDocumentRoot(figmaJson, nodeId)
    if (!frame) {
      return NextResponse.json(
        { error: 'Figma API returned no document for this node. Check the URL and token access.' },
        { status: 404 },
      )
    }

    const sectionRoots = getPageSectionRoots(frame)
    if (sectionRoots.length === 0) {
      return NextResponse.json(
        {
          error:
            'No block instances found on the frame. Ensure your Figma frame contains DotCom Beta block instances as direct children.',
        },
        { status: 422 },
      )
    }

    // --- Parse sections and collect image slots ---

    const newKey = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    const warnings: string[] = []
    const sections: Record<string, unknown>[] = []
    const blockSummary: string[] = []
    const allImageSlots: ImageSlot[] = []

    let blockIndex = 0
    for (const root of sectionRoots) {
      const fromName = sanityBlockShapeFromFigmaInstanceName(root.name)
      if (!fromName) {
        warnings.push(`Skipped unmapped instance: "${root.name}"`)
        continue
      }

      const fromProps = variantFieldsFromFigmaComponentProperties(
        fromName._type,
        root.componentProperties as Record<string, unknown> | undefined,
      )
      const shape = { ...fromName, ...fromProps }
      const imported = extractImportedContentForBlock(shape._type, root)
      const sectionKey = newKey()

      const slots = collectImageSlots(shape._type, root, blockIndex)
      allImageSlots.push(...slots)

      const imageRef = (id: string) => ({
        _type: 'image' as const,
        asset: { _type: 'reference' as const, _ref: id },
      })
      const bi = blockIndex
      const bt = shape._type
      const ctx = {
        assetId: `image-${bt}-${bi}-media`,
        cardAssetId: (cardIndex: number) => `image-${bt}-${bi}-card-${cardIndex}`,
        imageRef,
        newKey,
      }
      sections.push(expandFigmaSectionForSanity(shape, sectionKey, ctx, imported))
      blockSummary.push(shape._type)
      blockIndex++
    }

    if (sections.length === 0) {
      return NextResponse.json(
        { error: warnings.join('\n') || 'No sections could be parsed.' },
        { status: 422 },
      )
    }

    const title = titleOverride?.trim() || frame.name || 'Figma import'
    const slug = slugOverride?.trim() || slugify(title)

    const pageDoc = {
      _type: 'page',
      _id: `drafts.page-${slug}`,
      title,
      slug: { _type: 'slug', current: slug },
      sections,
    }

    const ndjson = JSON.stringify(pageDoc)

    // --- JSON-only mode (backward compat) ---

    if (formatJson) {
      return NextResponse.json({
        title,
        slug,
        blockSummary,
        warnings,
        sectionCount: sections.length,
        imageCount: allImageSlots.length,
        ndjson,
      })
    }

    // --- ZIP mode (default): render images from Figma and bundle ---

    const nodeIds = allImageSlots.map((s) => s.nodeId)
    let renderedUrls = new Map<string, string>()
    if (nodeIds.length > 0) {
      try {
        renderedUrls = await fetchFigmaRenderedImages(fileKey, nodeIds, figmaToken)
      } catch (err) {
        warnings.push(
          `Image rendering failed: ${err instanceof Error ? err.message : 'unknown'}. ZIP will contain NDJSON only.`,
        )
      }
    }

    const zip = new JSZip()
    zip.file('data.ndjson', ndjson)

    const manifest: {
      pageTitle: string
      slug: string
      generatedAt: string
      images: Array<{
        file: string
        block: string
        blockIndex: number
        slot: string
        cardIndex?: number
      }>
    } = {
      pageTitle: title,
      slug,
      generatedAt: new Date().toISOString(),
      images: [],
    }

    const imagesFolder = zip.folder('images')!
    const downloadPromises: Array<{
      slot: ImageSlot
      filename: string
      promise: Promise<ArrayBuffer | null>
    }> = []

    for (const slot of allImageSlots) {
      const cdnUrl = renderedUrls.get(slot.nodeId)
      if (!cdnUrl) {
        warnings.push(`No render for image slot "${slot.slotName}" (node ${slot.nodeId})`)
        continue
      }
      const filename = `${slot.slotName}.png`
      downloadPromises.push({ slot, filename, promise: downloadImage(cdnUrl) })
    }

    const results = await Promise.all(downloadPromises.map((d) => d.promise))
    for (let i = 0; i < downloadPromises.length; i++) {
      const { slot, filename } = downloadPromises[i]
      const imageData = results[i]
      if (!imageData) {
        warnings.push(`Failed to download image for "${slot.slotName}"`)
        continue
      }
      imagesFolder.file(filename, imageData)
      manifest.images.push({
        file: `images/${filename}`,
        block: slot.blockType,
        blockIndex: slot.blockIndex,
        slot: slot.cardIndex != null ? 'card' : 'media',
        ...(slot.cardIndex != null ? { cardIndex: slot.cardIndex } : {}),
      })
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}.zip"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
