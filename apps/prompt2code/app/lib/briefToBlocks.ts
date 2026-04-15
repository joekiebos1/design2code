/**
 * Converts JioKarna PageBrief sections to BlockRenderer block format.
 * Used for the preview step to render a visual mock of the proposed page.
 *
 * Field names MUST match what the P2C BlockRenderer reads (apps/prompt2code/app/components/BlockRenderer.tsx).
 * That renderer reads fields like `block.title`, `block.body`, `block.contentLayout`, `block.appearance`, etc.
 */

import type { PageBrief, Section } from './types'

/** Grey placeholder for preview (local asset, no external URLs). */
const PLACEHOLDER_IMAGE = '/placeholder-preview.svg'

const DEFAULT_THEME = 'MyJio'

/**
 * Stable integer hash of a string.
 * Used to pick a consistent image for a section regardless of its current sort order.
 */
function stableHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

/** Picks an image: uses a pinned URL when set, otherwise draws from the DAM pool. */
function resolveImage(
  raw: string | null | undefined,
  imageUrls: string[],
  index: number
): string {
  if (raw && typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('/'))) return raw
  if (imageUrls.length > 0) return imageUrls[index % imageUrls.length]
  return PLACEHOLDER_IMAGE
}

/** Video URL from pool, or undefined. */
function resolveVideo(
  _raw: string | null | undefined,
  videoUrls: string[],
  index: number
): string | undefined {
  if (videoUrls.length > 0) return videoUrls[index % videoUrls.length]
  return undefined
}

/** Stable image index for a section — never changes when blocks are reordered. */
function sectionImageIndex(sectionName: string, imageUrls: string[]): number {
  return imageUrls.length > 0 ? stableHash(sectionName) % imageUrls.length : 0
}

/** Stable image index for an item inside a section. */
function itemImageIndex(sectionName: string, itemIndex: number, imageUrls: string[]): number {
  return imageUrls.length > 0 ? stableHash(`${sectionName}-item-${itemIndex}`) % imageUrls.length : 0
}

type Block = {
  _type: string
  _key: string
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  [key: string]: unknown
}

function getCtaFromSlot(cta: Section['contentSlots']['cta']): { label?: string; href?: string } | undefined {
  if (!cta) return undefined
  if (typeof cta === 'string') return cta ? { label: cta, href: '#' } : undefined
  const rawLabel = cta.label || cta.destination
  const label = typeof rawLabel === 'string' ? rawLabel : null
  const rawDest = typeof cta.destination === 'string' ? cta.destination : null
  const href = rawDest ? `/${rawDest.toLowerCase().replace(/\s+/g, '-')}` : '#'
  return label ? { label, href } : undefined
}

function colourFields(opts: Record<string, unknown>) {
  return {
    theme: (opts.theme as string) ?? DEFAULT_THEME,
    appearance: (opts.appearance as string) ?? (opts.surfaceColour as string) ?? 'primary',
    emphasis: (opts.emphasis as string) ?? 'ghost',
    minimalBackgroundStyle: 'block',
  }
}

function normalizeItems(
  items: unknown[] | null | undefined,
  component: string,
  _sectionIndex: number,
  imageUrls: string[],
  itemOffset: number
): Record<string, unknown>[] {
  if (!Array.isArray(items) || items.length === 0) return []

  return items.map((item, i) => {
    const imgIndex = itemOffset + i
    const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
    const title = (o.title as string) ?? (o.headline as string) ?? `Item ${i + 1}`
    const description = (o.description as string) ?? (o.body as string) ?? ''

    switch (component) {
      case 'mediaTextAsymmetric':
        return {
          title: (o.question as string) ?? title,
          body: (o.answer as string) ?? description,
        }
      case 'mediaText5050':
        return {
          subtitle: (o.subtitle as string) ?? title,
          body: (o.body as string) ?? description,
          image: resolveImage(o.image as string, imageUrls, imgIndex),
        }
      case 'cardGrid':
        return {
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          icon: o.icon,
          backgroundColor: o.backgroundColor,
          image: resolveImage(o.image as string, imageUrls, imgIndex),
          video: o.video,
          ctaText: o.ctaText,
          ctaLink: o.ctaLink ?? (o.link as string),
        }
      case 'carousel':
        return {
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          image: resolveImage(o.image as string, imageUrls, imgIndex),
          video: o.video,
          link: o.link,
          ctaText: o.ctaText,
          aspectRatio: o.aspectRatio,
        }
      case 'proofPoints':
        return {
          title,
          description,
          icon: (o.icon as string) ?? 'IcCheckboxOn',
        }
      default:
        return { title, description, ...o }
    }
  })
}

export function briefToBlocks(
  brief: PageBrief,
  imageUrls: string[] = [],
  videoUrls: string[] = [],
): Block[] {
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)

  return sections.map((s, i) => {
    const slots = s.contentSlots
    const opts = s.blockOptions ?? {}
    const cta = getCtaFromSlot(slots.cta)
    const colours = colourFields(opts)
    // Support image pinned by the direct editor (_imageUrl set via briefEditor.pinImage)
    const pinnedImage = (s as Record<string, unknown>)._imageUrl as string | undefined
    const base: Block = {
      _type: s.component,
      _key: `preview-${s.sectionName}-${s.component}`,
      spacingTop: i === 0 ? 'none' : 'large',
      spacingBottom: 'large',
    }

    // Stable image index — based on sectionName, never changes on reorder
    const imgIdx = sectionImageIndex(s.sectionName, imageUrls)

    switch (s.component) {
      case 'hero': {
        return {
          ...base,
          spacingTop: undefined,
          contentLayout: opts.contentLayout ?? 'stacked',
          containerLayout: opts.containerLayout ?? 'edgeToEdge',
          imageAnchor: opts.imageAnchor ?? 'center',
          textAlign: opts.textAlign ?? 'left',
          theme: colours.theme,
          emphasis: opts.emphasis ?? 'ghost',
          appearance: colours.appearance,
          eyebrow: slots.eyebrow,
          title: slots.headline ?? brief.meta.pageName,
          body: slots.subhead ?? brief.meta.keyMessage,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          cta2Text: undefined,
          cta2Link: undefined,
          image: pinnedImage ?? resolveImage(undefined, imageUrls, imgIdx),
        }
      }

      case 'mediaTextStacked': {
        const template = opts.template ?? 'stacked'
        const hasMedia = slots.mediaType === 'image' || slots.mediaType === 'video'
        const isVideo = slots.mediaType === 'video'
        const videoUrl = isVideo ? resolveVideo(undefined, videoUrls, imgIdx) : undefined
        return {
          ...base,
          template: hasMedia ? template : 'textOnly',
          mediaSize: hasMedia && template !== 'textOnly' ? (opts.mediaSize ?? 'contained') : undefined,
          alignment: (opts.alignment as string) ?? 'left',
          ...colours,
          eyebrow: slots.eyebrow,
          title: slots.headline ?? s.sectionName,
          subhead: slots.subhead,
          body: slots.body,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          cta2Text: undefined,
          cta2Link: undefined,
          image: hasMedia ? (pinnedImage ?? resolveImage(undefined, imageUrls, imgIdx)) : undefined,
          video: videoUrl,
        }
      }

      case 'mediaText5050': {
        const rawVariant = opts.variant ?? 'paragraphs'
        const isAccordion = rawVariant === 'accordion'
        const isSingle = rawVariant === 'single' || (rawVariant === 'paragraphs' && opts.paragraphColumnLayout === 'single')
        const rawItems = Array.isArray(slots.items) ? slots.items : []

        const accordionItems = isAccordion
          ? rawItems.map((item, j) => {
              const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
              return {
                subtitle: (o.question as string) ?? (o.subtitle as string) ?? (o.title as string) ?? '',
                body: (o.answer as string) ?? (o.body as string) ?? '',
                image: resolveImage(o.image as string | undefined, imageUrls, itemImageIndex(s.sectionName, j, imageUrls)),
              }
            })
          : undefined

        const isMulti = !isAccordion && !isSingle
        const paragraphItems = isMulti
          ? rawItems.map((item) => {
              const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
              return {
                subtitle: (o.subtitle as string) ?? (o.title as string) ?? '',
                body: (o.body as string) ?? (o.description as string) ?? '',
              }
            })
          : undefined

        const firstItem = rawItems[0] as Record<string, unknown> | undefined
        return {
          ...base,
          variant: isAccordion ? 'accordion' : 'paragraphs',
          paragraphColumnLayout: isSingle ? 'single' : 'multi',
          imagePosition: opts.imagePosition ?? 'right',
          blockFramingAlignment: 'left',
          imageAspectRatio: opts.imageAspectRatio ?? '1:1',
          ...colours,
          headline: slots.headline ?? s.sectionName,
          description: null,
          image: pinnedImage ?? resolveImage(undefined, imageUrls, imgIdx),
          ...(isAccordion && accordionItems ? { accordionItems } : {}),
          ...(isSingle
            ? {
                singleSubtitle: (firstItem?.subtitle as string) ?? (firstItem?.title as string) ?? slots.subhead ?? slots.headline ?? '',
                singleBody: (firstItem?.body as string) ?? (firstItem?.description as string) ?? slots.body ?? '',
              }
            : {}),
          ...(isMulti && paragraphItems ? { items: paragraphItems } : {}),
        }
      }

      case 'mediaTextAsymmetric': {
        const items = normalizeItems(slots.items, 'mediaTextAsymmetric', i, imageUrls, 0)
        const isFaq = opts.variant === 'faq'
        return {
          ...base,
          blockTitle: isFaq ? 'Questions, answered' : (slots.headline ?? s.sectionName),
          variant: opts.variant ?? 'faq',
          size: (opts.size as string) ?? 'feature',
          ...colours,
          image: pinnedImage ?? resolveImage(undefined, imageUrls, imgIdx),
          imageAspectRatio: (opts.imageAspectRatio as string) ?? '5:4',
          items: items.length > 0 ? items : undefined,
        }
      }

      case 'cardGrid': {
        const items = normalizeItems(slots.items, 'cardGrid', i, imageUrls, 0)
        if (items.length === 0) {
          items.push(
            { cardType: 'mediaTextBelow', title: 'Card 1', description: slots.body ?? '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 0, imageUrls)) },
            { cardType: 'mediaTextBelow', title: 'Card 2', description: '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 1, imageUrls)) },
            { cardType: 'mediaTextBelow', title: 'Card 3', description: '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 2, imageUrls)) }
          )
        }
        return {
          ...base,
          columns: opts.columns ?? 3,
          ...colours,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'carousel': {
        let items = normalizeItems(slots.items, 'carousel', i, imageUrls, 0)
        if (items.length === 0) {
          items = [
            { cardType: 'mediaTextBelow', title: 'Item 1', description: slots.body ?? '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 0, imageUrls)) },
            { cardType: 'mediaTextBelow', title: 'Item 2', description: '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 1, imageUrls)) },
            { cardType: 'mediaTextBelow', title: 'Item 3', description: '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 2, imageUrls)) },
            { cardType: 'mediaTextBelow', title: 'Item 4', description: '', image: resolveImage(undefined, imageUrls, itemImageIndex(s.sectionName, 3, imageUrls)) },
          ]
        }
        return {
          ...base,
          cardSize: opts.cardSize ?? 'compact',
          ...colours,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'proofPoints': {
        let items = normalizeItems(slots.items, 'proofPoints', i, imageUrls, 0)
        if (items.length === 0) {
          items = [
            { title: 'Point 1', description: '', icon: 'IcCheckboxOn' },
            { title: 'Point 2', description: '', icon: 'IcSecured' },
            { title: 'Point 3', description: '', icon: 'IcStar' },
            { title: 'Point 4', description: '', icon: 'IcStar' },
          ]
        }
        items = items.slice(0, 4)
        return {
          ...base,
          variant: (opts.variant as string) ?? 'icon',
          ...colours,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      default:
        return {
          ...base,
          ...colours,
          title: slots.headline ?? s.sectionName,
          body: slots.body,
        }
    }
  })
}
