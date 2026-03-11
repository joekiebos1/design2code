/**
 * Converts JioKarna PageBrief sections to BlockRenderer block format.
 * Used for the preview step to render a visual mock of the proposed page.
 * Images come from Sanity Image Library when available; otherwise placeholder.
 */

import type { PageBrief, Section } from './types'

/** Grey placeholder for preview (local asset, no external URLs). */
const PLACEHOLDER_IMAGE = '/placeholder-preview.svg'

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

/** Build Art Director payload from brief. Slot naming: hero-{i}-image, mediaTextBlock-{i}-media, cardGrid-{i}-item-{j}-image, carousel-{i}-item-{j}-image */
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
      case 'mediaTextBlock':
        if (s.mediaType === 'image') {
          blocks.push({
            slot: `mediaTextBlock-${i}-media`,
            section: sectionLabel,
            blockType: 'mediaTextBlock',
            headline,
            imageBrief,
            intent,
            mediaStyle,
          })
        }
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
      case 'mediaTextBlock':
        if (s.mediaType === 'image') slots.push({ slot: `mediaTextBlock-${i}-media` })
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

/** Returns true if string is a valid image URL (http, https, or absolute path). */
function isValidImageUrl(s: string | null | undefined): boolean {
  if (!s || typeof s !== 'string' || !s.trim()) return false
  const t = s.trim()
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')
}

/** Picks an image from Sanity pool or falls back to placeholder. */
function resolveImage(
  raw: string | null | undefined,
  sanityUrls: string[],
  index: number
): string {
  if (isValidImageUrl(raw)) return raw!.trim()
  if (sanityUrls.length > 0) return sanityUrls[index % sanityUrls.length]
  return PLACEHOLDER_IMAGE
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
  const label = cta.label || cta.destination
  const href = cta.destination ? `/${cta.destination.toLowerCase().replace(/\s+/g, '-')}` : '#'
  return label ? { label, href } : undefined
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
      case 'cardGrid':
        return {
          cardStyle: (o.cardStyle as string) ?? 'image-above',
          title,
          description,
          image: resolveImage(o.image as string, sanityImageUrls, imgIndex),
          video: o.video,
          ctaText: o.ctaText,
          ctaLink: o.ctaLink ?? (o.link as string),
          surface: (o.surface as string) ?? 'bold',
          imageSlot: `cardGrid-${sectionIndex}-item-${i}-image`,
        }
      case 'carousel':
        return {
          cardType: (o.cardType as string) ?? 'media',
          title,
          description,
          image: resolveImage(o.image as string, sanityImageUrls, imgIndex),
          video: o.video,
          link: o.link,
          ctaText: o.ctaText,
          aspectRatio: (o.aspectRatio as string) ?? '4:5',
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

export function briefToBlocks(brief: PageBrief, sanityImageUrls: string[] = []): Block[] {
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  let itemOffset = 0

  return sections.map((s, i) => {
    const slots = s.contentSlots
    const opts = s.blockOptions ?? {}
    const cta = getCtaFromSlot(slots.cta)
    const base: Block = {
      _type: s.component,
      _key: `preview-${i}-${s.component}`,
      spacingTop: 'large',
      spacingBottom: 'large',
    }

    switch (s.component) {
      case 'hero': {
        return {
          ...base,
          variant: opts.variant ?? 'category',
          productName: brief.meta.pageName,
          headline: slots.headline ?? brief.meta.pageName,
          subheadline: slots.subhead ?? brief.meta.keyMessage,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          cta2Text: undefined,
          cta2Link: undefined,
          image: resolveImage(undefined, sanityImageUrls, 0),
          imageSlot: `hero-${i}-image`,
        }
      }

      case 'mediaTextBlock': {
        const template = opts.template ?? 'Stacked'
        const hasMedia = slots.mediaType === 'image' || slots.mediaType === 'video'
        return {
          ...base,
          template: hasMedia ? template : 'TextOnly',
          size: opts.size ?? 'feature',
          stackImagePosition: (opts.stackImagePosition as 'top' | 'bottom') ?? 'top',
          blockAccent: opts.blockAccent ?? 'primary',
          blockBackground: opts.blockSurface ?? 'ghost',
          contentWidth: 'Default',
          mediaStyle: opts.mediaStyle ?? 'contained',
          title: slots.headline ?? s.sectionName,
          subhead: slots.subhead,
          body: slots.body,
          bulletList: undefined,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          cta2Text: undefined,
          cta2Link: undefined,
          image: hasMedia ? resolveImage(undefined, sanityImageUrls, i) : undefined,
          video: undefined,
          imageSlot: hasMedia ? `mediaTextBlock-${i}-media` : undefined,
        }
      }

      case 'cardGrid': {
        const items = normalizeItems(slots.items, 'cardGrid', i, sanityImageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items.push(
            { cardStyle: 'image-above', title: 'Card 1', description: slots.body ?? '', image: resolveImage(undefined, sanityImageUrls, itemOffset), imageSlot: `cardGrid-${i}-item-0-image` },
            { cardStyle: 'image-above', title: 'Card 2', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 1), imageSlot: `cardGrid-${i}-item-1-image` },
            { cardStyle: 'image-above', title: 'Card 3', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 2), imageSlot: `cardGrid-${i}-item-2-image` }
          )
          itemOffset += 3
        }
        return {
          ...base,
          columns: String(opts.columns ?? 3),
          title: slots.headline ?? s.sectionName,
          blockSurface: opts.blockSurface ?? 'ghost',
          blockAccent: opts.blockAccent ?? 'primary',
          items,
        }
      }

      case 'carousel': {
        const carouselCardSize = opts.cardSize ?? 'compact'
        let items = normalizeItems(slots.items, 'carousel', i, sanityImageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            { cardType: 'media', title: 'Item 1', description: slots.body ?? '', image: resolveImage(undefined, sanityImageUrls, itemOffset), imageSlot: `carousel-${i}-item-0-image`, ...(carouselCardSize === 'compact' && { aspectRatio: '4:5' }) },
            { cardType: 'media', title: 'Item 2', description: '', image: resolveImage(undefined, sanityImageUrls, itemOffset + 1), imageSlot: `carousel-${i}-item-1-image`, ...(carouselCardSize === 'compact' && { aspectRatio: '4:5' }) },
          ]
          itemOffset += 2
        } else if (carouselCardSize === 'large' || carouselCardSize === 'medium') {
          items = items.map(({ aspectRatio: _a, ...rest }) => rest)
        }
        return {
          ...base,
          cardSize: carouselCardSize,
          blockAccent: opts.blockAccent ?? 'primary',
          surface: opts.blockSurface ?? 'ghost',
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'proofPoints': {
        const items = normalizeItems(slots.items, 'proofPoints', i, sanityImageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items.push(
            { title: 'Point 1', description: '', icon: 'IcCheckboxOn' },
            { title: 'Point 2', description: '', icon: 'IcSecured' },
            { title: 'Point 3', description: '', icon: 'IcStar' }
          )
        }
        return {
          ...base,
          title: slots.headline ?? s.sectionName,
          blockSurface: opts.blockSurface ?? 'ghost',
          blockAccent: opts.blockAccent ?? 'primary',
          items,
        }
      }

      default:
        return base
    }
  })
}
