/**
 * Image Request Manifest — structured payload sent to the Content Manager.
 *
 * Builds one ImageSlotRequest per image the page needs, enriched with
 * page context, block configuration, aspect ratio (from D2C contracts),
 * and adjacent text so the Content Manager can pick the right asset.
 */

import type { PageBrief, BlockOptions } from './types'

// ─── Types (shared with the Content Manager) ─────────────────────────────────

export type ImageRequestManifest = {
  jobId: string
  callbackUrl: string
  page: {
    product: string
    intent: string
    audience: string
    keyMessage: string
    pageType: string
  }
  slots: ImageSlotRequest[]
}

export type ImageSlotRequest = {
  slotId: string
  blockType: string
  blockIndex: number
  narrativeRole: string

  aspectRatio: string | null
  imageRole: ImageRole
  visualDirection: string
  required: boolean

  adjacentText: {
    headline: string | null
    description: string | null
  }
  imageBrief: string | null

  cardType?: string
  cardIndex?: number
}

export type ImageRole =
  | 'hero-background'
  | 'block-media'
  | 'card-thumbnail'
  | 'accordion-panel'

export type ImageSlotResponse = {
  jobId: string
  slotId: string
  url: string
  alt: string
  source: 'library' | 'generated' | 'stock'
  width?: number
  height?: number
  metadata?: Record<string, unknown>
}

// ─── Aspect ratio derivation (from D2C contracts) ────────────────────────────

function getBlockMediaAspectRatio(
  blockType: string,
  opts: BlockOptions,
): string | null {
  switch (blockType) {
    case 'hero':
      return '16:9'
    case 'mediaTextStacked':
      return '16:9'
    case 'mediaText5050':
      return opts.imageAspectRatio ?? '5:4'
    case 'mediaTextAsymmetric':
      return opts.imageAspectRatio ?? '5:4'
    default:
      return null
  }
}

function getCardAspectRatio(
  parentBlockType: string,
  opts: BlockOptions,
): string | null {
  if (parentBlockType === 'carousel') {
    if (opts.cardSize === 'large') return '2:1'
    if (opts.cardSize === 'medium') return '4:5'
    return '4:5' // compact default
  }
  if (parentBlockType === 'cardGrid') {
    if (opts.columns === 2) return '4:5'
    return null // 3/4 col grids are text-driven
  }
  return null
}

// ─── Card type helpers ───────────────────────────────────────────────────────

const COLOUR_CARD_TYPES = new Set([
  'colourFeatured',
  'colourIconText',
  'colourTextOnly',
])

function cardNeedsImage(cardType: string | undefined): boolean {
  if (!cardType) return true
  return !COLOUR_CARD_TYPES.has(cardType)
}

// ─── Manifest builder ────────────────────────────────────────────────────────

export function buildImageManifest(
  brief: PageBrief,
  jobId: string,
  callbackUrl: string,
): ImageRequestManifest {
  const meta = brief.meta
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  const slots: ImageSlotRequest[] = []

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const s = section.contentSlots
    const opts = section.blockOptions ?? {}
    const narrativeRole = section.narrativeRole || 'engage'
    const visualDirection = section.imageIntent || 'lifestyle'
    const imageBrief =
      section.imageBrief ||
      s.headline ||
      `${meta.pageName} — ${section.sectionName}`

    switch (section.component) {
      case 'hero': {
        const isTextOnly = opts.contentLayout === 'textOnly'
        slots.push({
          slotId: `hero-${i}-image`,
          blockType: 'hero',
          blockIndex: i,
          narrativeRole,
          aspectRatio: getBlockMediaAspectRatio('hero', opts),
          imageRole: 'hero-background',
          visualDirection,
          required: !isTextOnly,
          adjacentText: {
            headline: s.headline ?? meta.pageName,
            description: s.subhead ?? meta.keyMessage,
          },
          imageBrief,
        })
        break
      }

      case 'mediaTextStacked': {
        const hasMedia =
          s.mediaType === 'image' || s.mediaType === 'video'
        if (hasMedia) {
          slots.push({
            slotId: `mediaTextStacked-${i}-media`,
            blockType: 'mediaTextStacked',
            blockIndex: i,
            narrativeRole,
            aspectRatio: getBlockMediaAspectRatio('mediaTextStacked', opts),
            imageRole: 'block-media',
            visualDirection,
            required: true,
            adjacentText: {
              headline: s.headline ?? section.sectionName,
              description: s.body,
            },
            imageBrief,
          })
        }
        break
      }

      case 'mediaText5050': {
        const variant = opts.variant ?? 'paragraphs'
        slots.push({
          slotId: `mediaText5050-${i}-media`,
          blockType: 'mediaText5050',
          blockIndex: i,
          narrativeRole,
          aspectRatio: getBlockMediaAspectRatio('mediaText5050', opts),
          imageRole: 'block-media',
          visualDirection,
          required: true,
          adjacentText: {
            headline: s.headline ?? section.sectionName,
            description: s.body,
          },
          imageBrief,
        })

        if (variant === 'accordion') {
          const items = Array.isArray(s.items) ? s.items : []
          for (let j = 0; j < items.length; j++) {
            const item =
              typeof items[j] === 'object' && items[j] !== null
                ? (items[j] as Record<string, unknown>)
                : {}
            slots.push({
              slotId: `mediaText5050-${i}-accordion-${j}-image`,
              blockType: 'mediaText5050',
              blockIndex: i,
              narrativeRole,
              aspectRatio: opts.imageAspectRatio ?? '5:4',
              imageRole: 'accordion-panel',
              visualDirection,
              required: false,
              adjacentText: {
                headline:
                  (item.subtitle as string) ??
                  (item.title as string) ??
                  null,
                description: (item.body as string) ?? null,
              },
              imageBrief: (item.subtitle as string) ?? imageBrief,
            })
          }
        }
        break
      }

      case 'mediaTextAsymmetric': {
        slots.push({
          slotId: `mediaTextAsymmetric-${i}-media`,
          blockType: 'mediaTextAsymmetric',
          blockIndex: i,
          narrativeRole,
          aspectRatio: getBlockMediaAspectRatio('mediaTextAsymmetric', opts),
          imageRole: 'block-media',
          visualDirection,
          required: false,
          adjacentText: {
            headline: s.headline ?? section.sectionName,
            description: s.body,
          },
          imageBrief,
        })
        break
      }

      case 'cardGrid': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length || 3
        const ratio = getCardAspectRatio('cardGrid', opts)

        for (let j = 0; j < count; j++) {
          const item =
            j < items.length &&
            typeof items[j] === 'object' &&
            items[j] !== null
              ? (items[j] as Record<string, unknown>)
              : {}
          const cardType = (item.cardType as string) ?? 'mediaTextBelow'

          if (!cardNeedsImage(cardType)) continue

          slots.push({
            slotId: `cardGrid-${i}-item-${j}-image`,
            blockType: 'cardGrid',
            blockIndex: i,
            narrativeRole,
            aspectRatio: ratio,
            imageRole: 'card-thumbnail',
            visualDirection,
            required: cardType === 'mediaTextOverlay',
            adjacentText: {
              headline: (item.title as string) ?? (item.headline as string) ?? null,
              description: (item.description as string) ?? (item.body as string) ?? null,
            },
            imageBrief:
              (item.description as string) ?? imageBrief,
            cardType,
            cardIndex: j,
          })
        }
        break
      }

      case 'carousel': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length || 3
        const ratio = getCardAspectRatio('carousel', opts)

        for (let j = 0; j < count; j++) {
          const item =
            j < items.length &&
            typeof items[j] === 'object' &&
            items[j] !== null
              ? (items[j] as Record<string, unknown>)
              : {}
          const cardType = (item.cardType as string) ?? 'mediaTextBelow'

          if (!cardNeedsImage(cardType)) continue

          const perCardRatio =
            opts.cardSize === 'compact'
              ? (item.aspectRatio as string) ?? '4:5'
              : ratio

          slots.push({
            slotId: `carousel-${i}-item-${j}-image`,
            blockType: 'carousel',
            blockIndex: i,
            narrativeRole,
            aspectRatio: perCardRatio,
            imageRole: 'card-thumbnail',
            visualDirection,
            required: cardType === 'mediaTextOverlay',
            adjacentText: {
              headline: (item.title as string) ?? (item.headline as string) ?? null,
              description: (item.description as string) ?? (item.body as string) ?? null,
            },
            imageBrief:
              (item.description as string) ?? imageBrief,
            cardType,
            cardIndex: j,
          })
        }
        break
      }

      default:
        break
    }
  }

  return {
    jobId,
    callbackUrl,
    page: {
      product: meta.pageName || 'Untitled',
      intent: meta.intent || '',
      audience: meta.audience || '',
      keyMessage: meta.keyMessage || '',
      pageType: meta.pageType || 'other',
    },
    slots,
  }
}

/**
 * Flat list of slotIds for a brief — convenience for stream tracking.
 */
export function extractSlotIds(brief: PageBrief): string[] {
  const manifest = buildImageManifest(brief, '', '')
  return manifest.slots.map((s) => s.slotId)
}
