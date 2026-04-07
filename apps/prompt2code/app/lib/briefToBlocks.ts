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

/** Art Director block — JioKarna → Art Director (n8n webhook) contract. */
export type ArtDirectorBlock = {
  slot: string
  section: string
  blockType: string
  headline: string
  imageBrief: string
  intent: string
  mediaStyle?: string
}

/** Art Director payload — full request to image service. */
export type ArtDirectorPayload = {
  jobId: string
  product: string
  audience: string
  blocks: ArtDirectorBlock[]
}

/** Build Art Director payload from brief. Slot naming: hero-{i}-image, mediaTextStacked-{i}-media, cardGrid-{i}-item-{j}-image, carousel-{i}-item-{j}-image */
export function extractArtDirectorPayload(brief: PageBrief, jobId: string): ArtDirectorPayload {
  const blocks: ArtDirectorBlock[] = []
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  const meta = brief.meta

  sections.forEach((section, i) => {
    const s = section.contentSlots
    const opts = section.blockOptions ?? {}
    const sectionLabel = section.narrativeRole || 'engage'
    const headline = s.headline || section.sectionName || ''
    const imageBrief = section.imageBrief || headline || `${meta.pageName} — ${section.sectionName}`
    const intent = section.imageIntent || 'lifestyle'
    const mediaStyle = (opts.mediaStyle as string) || 'contained'

    switch (section.component) {
      case 'hero':
        blocks.push({
          slot: `hero-${i}-image`,
          section: sectionLabel,
          blockType: 'hero',
          headline,
          imageBrief,
          intent,
        })
        break
      case 'mediaTextStacked':
        if (s.mediaType === 'image') {
          blocks.push({
            slot: `mediaTextStacked-${i}-media`,
            section: sectionLabel,
            blockType: 'mediaTextStacked',
            headline,
            imageBrief,
            intent,
            mediaStyle,
          })
        }
        break
      case 'mediaText5050':
        blocks.push({
          slot: `mediaText5050-${i}-media`,
          section: sectionLabel,
          blockType: 'mediaText5050',
          headline,
          imageBrief,
          intent,
          mediaStyle,
        })
        break
      case 'cardGrid': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length === 0 ? 3 : items.length
        for (let j = 0; j < count; j++) {
          const item = items[j] as Record<string, unknown> | undefined
          const itemHeadline = (item?.title as string) || (item?.headline as string) || `Card ${j + 1}`
          const itemBrief = (item?.description as string) || imageBrief
          blocks.push({
            slot: `cardGrid-${i}-item-${j}-image`,
            section: sectionLabel,
            blockType: 'cardGrid',
            headline: itemHeadline,
            imageBrief: itemBrief,
            intent,
          })
        }
        break
      }
      case 'carousel': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length === 0 ? 2 : items.length
        for (let j = 0; j < count; j++) {
          const item = items[j] as Record<string, unknown> | undefined
          const itemHeadline = (item?.title as string) || (item?.headline as string) || `Item ${j + 1}`
          const itemBrief = (item?.description as string) || imageBrief
          blocks.push({
            slot: `carousel-${i}-item-${j}-image`,
            section: sectionLabel,
            blockType: 'carousel',
            headline: itemHeadline,
            imageBrief: itemBrief,
            intent,
          })
        }
        break
      }
      default:
        break
    }
  })

  return {
    jobId,
    product: meta.pageName || 'Untitled',
    audience: meta.audience || 'General audience',
    blocks,
  }
}

/** Slot format: {blockType}-{sectionIndex}-image|media|item-{itemIndex}-image */
export function extractImageSlots(brief: PageBrief): { slot: string }[] {
  const slots: { slot: string }[] = []
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)

  sections.forEach((section, i) => {
    const s = section.contentSlots
    switch (section.component) {
      case 'hero':
        slots.push({ slot: `hero-${i}-image` })
        break
      case 'mediaTextStacked':
        if (s.mediaType === 'image') slots.push({ slot: `mediaTextStacked-${i}-media` })
        break
      case 'mediaText5050':
        slots.push({ slot: `mediaText5050-${i}-media` })
        break
      case 'cardGrid': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length === 0 ? 3 : items.length
        for (let j = 0; j < count; j++) slots.push({ slot: `cardGrid-${i}-item-${j}-image` })
        break
      }
      case 'carousel': {
        const items = Array.isArray(s.items) ? s.items : []
        const count = items.length === 0 ? 2 : items.length
        for (let j = 0; j < count; j++) slots.push({ slot: `carousel-${i}-item-${j}-image` })
        break
      }
      default:
        break
    }
  })
  return slots
}

/** Picks an image: Sanity pool first, then placeholder. Raw brief URLs are ignored. */
function resolveImage(
  _raw: string | null | undefined,
  sanityUrls: string[],
  index: number
): string {
  if (sanityUrls.length > 0) return sanityUrls[index % sanityUrls.length]
  return PLACEHOLDER_IMAGE
}

/** Video URL: Sanity file assets first, then placeholder. Raw brief URLs are ignored. */
function resolveVideo(
  _raw: string | null | undefined,
  sanityVideoUrls: string[],
  index: number
): string | undefined {
  if (sanityVideoUrls.length > 0) return sanityVideoUrls[index % sanityVideoUrls.length]
  return undefined
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
  sectionIndex: number,
  sanityImageUrls: string[],
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
      case 'cardGrid':
        return {
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          icon: o.icon,
          backgroundColor: o.backgroundColor,
          image: resolveImage(o.image as string, sanityImageUrls, imgIndex),
          video: o.video,
          ctaText: o.ctaText,
          ctaLink: o.ctaLink ?? (o.link as string),
          imageSlot: `cardGrid-${sectionIndex}-item-${i}-image`,
        }
      case 'carousel':
        return {
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          image: resolveImage(o.image as string, sanityImageUrls, imgIndex),
          video: o.video,
          link: o.link,
          ctaText: o.ctaText,
          aspectRatio: o.aspectRatio,
          imageSlot: `carousel-${sectionIndex}-item-${i}-image`,
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
  sanityImageUrls: string[] = [],
  sanityVideoUrls: string[] = [],
): Block[] {
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  let itemOffset = 0

  return sections.map((s, i) => {
    const slots = s.contentSlots
    const opts = s.blockOptions ?? {}
    const cta = getCtaFromSlot(slots.cta)
    const colours = colourFields(opts)
    const base: Block = {
      _type: s.component,
      _key: `preview-${i}-${s.component}`,
      spacingTop: i === 0 ? 'none' : 'large',
      spacingBottom: 'large',
    }

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
          image: resolveImage(undefined, sanityImageUrls, 0),
          imageSlot: `hero-${i}-image`,
        }
      }

      case 'mediaTextStacked': {
        const template = opts.template ?? 'stacked'
        const hasMedia = slots.mediaType === 'image' || slots.mediaType === 'video'
        const isVideo = slots.mediaType === 'video'
        const videoUrl = isVideo ? resolveVideo(undefined, sanityVideoUrls, i) : undefined
        return {
          ...base,
          template: hasMedia ? template : 'textOnly',
          mediaSize: hasMedia && template !== 'textOnly' ? (opts.mediaSize ?? 'edgeToEdge') : undefined,
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
          image: hasMedia ? resolveImage(undefined, sanityImageUrls, i) : undefined,
          video: videoUrl,
          imageSlot: hasMedia ? `mediaTextStacked-${i}-media` : undefined,
        }
      }

      case 'mediaText5050': {
        const rawVariant = opts.variant ?? 'paragraphs'
        const isAccordion = rawVariant === 'accordion'
        const isSingle = rawVariant === 'single' || (rawVariant === 'paragraphs' && opts.paragraphColumnLayout === 'single')
        const image = resolveImage(undefined, sanityImageUrls, i)
        const rawItems = Array.isArray(slots.items) ? slots.items : []

        const accordionItems = isAccordion
          ? rawItems.map((item, j) => {
              const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
              return {
                subtitle: (o.question as string) ?? (o.subtitle as string) ?? (o.title as string) ?? '',
                body: (o.answer as string) ?? (o.body as string) ?? '',
                image: resolveImage(o.image as string | undefined, sanityImageUrls, itemOffset + j),
              }
            })
          : undefined
        if (isAccordion) itemOffset += accordionItems?.length ?? 0

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
          image,
          imageSlot: `mediaText5050-${i}-media`,
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
        const items = normalizeItems(slots.items, 'mediaTextAsymmetric', i, sanityImageUrls, itemOffset)
        const isFaq = opts.variant === 'faq'
        return {
          ...base,
          blockTitle: isFaq ? 'Questions, answered' : (slots.headline ?? s.sectionName),
          variant: opts.variant ?? 'faq',
          size: (opts.size as string) ?? 'feature',
          ...colours,
          image: resolveImage(undefined, sanityImageUrls, i),
          imageAspectRatio: (opts.imageAspectRatio as string) ?? '5:4',
          items: items.length > 0 ? items : undefined,
        }
      }

      case 'cardGrid': {
        const items = normalizeItems(slots.items, 'cardGrid', i, sanityImageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items.push(
            { cardType: 'mediaTextBelow', title: 'Card 1', description: slots.body ?? '', image: resolveImage(undefined, sanityImageUrls, itemOffset), imageSlot: `cardGrid-${i}-item-0-image` },
            { cardType: 'mediaTextBelow', title: 'Card 2', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 1), imageSlot: `cardGrid-${i}-item-1-image` },
            { cardType: 'mediaTextBelow', title: 'Card 3', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 2), imageSlot: `cardGrid-${i}-item-2-image` }
          )
          itemOffset += 3
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
        let items = normalizeItems(slots.items, 'carousel', i, sanityImageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            { cardType: 'mediaTextBelow', title: 'Item 1', description: slots.body ?? '', image: resolveImage(undefined, sanityImageUrls, itemOffset), imageSlot: `carousel-${i}-item-0-image` },
            { cardType: 'mediaTextBelow', title: 'Item 2', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 1), imageSlot: `carousel-${i}-item-1-image` },
            { cardType: 'mediaTextBelow', title: 'Item 3', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 2), imageSlot: `carousel-${i}-item-2-image` },
            { cardType: 'mediaTextBelow', title: 'Item 4', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 3), imageSlot: `carousel-${i}-item-3-image` },
          ]
          itemOffset += 4
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
        let items = normalizeItems(slots.items, 'proofPoints', i, sanityImageUrls, itemOffset)
        if (items.length === 0) {
          items = [
            { title: 'Point 1', description: '', icon: 'IcCheckboxOn' },
            { title: 'Point 2', description: '', icon: 'IcSecured' },
            { title: 'Point 3', description: '', icon: 'IcStar' },
            { title: 'Point 4', description: '', icon: 'IcStar' },
          ]
        }
        items = items.slice(0, 4)
        itemOffset += items.length
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
