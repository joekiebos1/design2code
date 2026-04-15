/**
 * Converts a PageBrief to Strapi dynamic zone block format.
 * Uses plain imageUrl/videoUrl string fields (URLs from a provided pool).
 *
 * Every block includes all visual presentation fields (theme, appearance, emphasis,
 * spacing, variant, etc.) so Strapi never has missing required fields on new pages.
 *
 * Component mapping (reverse of packages/strapi/src/map-blocks.ts):
 *   hero                 → blocks.hero
 *   mediaTextStacked     → blocks.media-text-stacked
 *   mediaText5050        → blocks.media-text-5050
 *   mediaTextAsymmetric  → blocks.media-text-asymmetric
 *   cardGrid             → blocks.card-grid
 *   carousel             → blocks.carousel
 *   proofPoints          → blocks.proof-points
 *   iconGrid             → blocks.icon-grid
 */

import type { PageBrief, Section } from './types'

const DEFAULT_THEME = 'MyJio'

const COMPONENT_MAP: Record<string, string> = {
  hero: 'blocks.hero',
  mediaTextStacked: 'blocks.media-text-stacked',
  mediaText5050: 'blocks.media-text-5050',
  mediaTextAsymmetric: 'blocks.media-text-asymmetric',
  cardGrid: 'blocks.card-grid',
  carousel: 'blocks.carousel',
  proofPoints: 'blocks.proof-points',
  iconGrid: 'blocks.icon-grid',
}

function getUrl(urls: string[], index: number): string | undefined {
  if (urls.length === 0) return undefined
  return urls[index % urls.length]
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
  imageUrls: string[],
  itemOffset: number
): Record<string, unknown>[] {
  if (!Array.isArray(items) || items.length === 0) return []

  return items.map((item, i) => {
    const imgIndex = itemOffset + i
    const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
    const title = (o.title as string) ?? (o.headline as string) ?? `Item ${i + 1}`
    const description = (o.description as string) ?? (o.body as string) ?? ''
    const imageUrl = getUrl(imageUrls, imgIndex)

    switch (component) {
      case 'cardGrid': {
        return {
          _key: `cg-${imgIndex}`,
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          icon: o.icon,
          backgroundColor: o.backgroundColor,
          imageUrl,
          ctaText: o.ctaText,
          ctaLink: o.ctaLink ?? (o.link as string),
        }
      }
      case 'carousel': {
        return {
          _key: `car-${imgIndex}`,
          cardType: (o.cardType as string) ?? 'mediaTextBelow',
          title,
          description,
          imageUrl,
          link: o.link,
          ctaText: o.ctaText,
          aspectRatio: (o.aspectRatio as string) ?? '4:5',
        }
      }
      case 'proofPoints':
        return {
          _key: `pp-${imgIndex}`,
          title,
          description,
          icon: (o.icon as string) ?? 'IcCheckboxOn',
        }
      case 'mediaText5050': {
        return {
          _key: `mt50-${imgIndex}`,
          subtitle: (o.subtitle as string) ?? title,
          body: (o.body as string) ?? description,
        }
      }
      case 'mediaTextAsymmetric': {
        return {
          _key: `mta-${imgIndex}`,
          title: (o.question as string) ?? title,
          body: (o.answer as string) ?? description,
        }
      }
      default:
        return { _key: `item-${imgIndex}`, title, description, ...o }
    }
  })
}

export type StrapiBlock = {
  __component: string
  [key: string]: unknown
}

function colourFields(opts: Record<string, unknown>) {
  return {
    theme: (opts.theme as string) ?? DEFAULT_THEME,
    appearance: (opts.appearance as string) ?? (opts.surfaceColour as string) ?? 'primary',
    emphasis: (opts.emphasis as string) ?? 'ghost',
    minimalBackgroundStyle: 'block',
  }
}

export function briefToStrapiBlocks(
  brief: PageBrief,
  imageUrls: string[],
  videoUrls: string[] = [],
): StrapiBlock[] {
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  let itemOffset = 0

  return sections.map((s, i) => {
    const slots = s.contentSlots
    const opts = s.blockOptions ?? {}
    const cta = getCtaFromSlot(slots.cta)
    const colours = colourFields(opts)
    const __component = COMPONENT_MAP[s.component] ?? `blocks.${s.component.toLowerCase()}`

    const base: StrapiBlock = {
      __component,
      spacingTop: i === 0 ? 'none' : 'large',
      spacingBottom: 'large',
    }

    switch (s.component) {
      case 'hero': {
        const imageUrl = getUrl(imageUrls, 0)
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
          cta2Text: slots.cta2?.label,
          cta2Link: slots.cta2?.destination ? `/${slots.cta2.destination.toLowerCase().replace(/\s+/g, '-')}` : undefined,
          imageUrl,
        }
      }

      case 'mediaTextStacked': {
        const template = opts.template ?? 'stacked'
        const hasMedia = slots.mediaType === 'image' || slots.mediaType === 'video'
        const isVideo = slots.mediaType === 'video'
        const imageUrl = hasMedia ? getUrl(imageUrls, i) : undefined
        const videoUrl = hasMedia && isVideo && videoUrls.length > 0 ? getUrl(videoUrls, i) : undefined
        const effectiveTemplate = hasMedia ? template : 'textOnly'
        return {
          ...base,
          template: effectiveTemplate,
          mediaSize: effectiveTemplate !== 'textOnly' ? (opts.mediaSize ?? 'edgeToEdge') : undefined,
          alignment: (opts.alignment as string) ?? 'left',
          ...colours,
          eyebrow: slots.eyebrow,
          title: slots.headline ?? s.sectionName,
          subhead: slots.subhead,
          body: slots.body,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          imageUrl,
          videoUrl,
        }
      }

      case 'mediaText5050': {
        const rawVariant = (opts.variant as string) ?? 'paragraphs'
        const variant = rawVariant === 'single' ? 'paragraphs' : (rawVariant === 'accordion' ? 'accordion' : 'paragraphs')
        const paragraphColumnLayout = rawVariant === 'single' || opts.paragraphColumnLayout === 'single' ? 'single' : 'multi'
        const imageUrl = getUrl(imageUrls, i)

        let items: Record<string, unknown>[] = []
        if (variant === 'paragraphs' && paragraphColumnLayout === 'multi') {
          items = normalizeItems(slots.items, 'mediaText5050', imageUrls, itemOffset)
          itemOffset += items.length
          if (items.length === 0) {
            items = [
              { _key: 'mt50-1', subtitle: 'Section 1', body: slots.body ?? '' },
              { _key: 'mt50-2', subtitle: 'Section 2', body: '' },
              { _key: 'mt50-3', subtitle: 'Section 3', body: '' },
            ]
          }
        }

        let accordionItems: Record<string, unknown>[] | undefined
        if (variant === 'accordion') {
          accordionItems = (slots.items ?? []).map((item, j) => {
            const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
            return {
              _key: `acc-${j}`,
              subtitle: (o.question as string) ?? (o.subtitle as string) ?? (o.title as string) ?? (o.headline as string) ?? `Panel ${j + 1}`,
              body: (o.answer as string) ?? (o.body as string) ?? (o.description as string) ?? '',
              imageUrl: getUrl(imageUrls, itemOffset + j),
            }
          })
          if (!accordionItems.length) {
            accordionItems = [
              { _key: 'acc-1', subtitle: 'Panel 1', body: slots.body ?? '' },
              { _key: 'acc-2', subtitle: 'Panel 2', body: '' },
              { _key: 'acc-3', subtitle: 'Panel 3', body: '' },
            ]
          }
          itemOffset += accordionItems.length
        }

        return {
          ...base,
          imagePosition: (opts.imagePosition as string) ?? 'right',
          blockFramingAlignment: 'left',
          variant,
          paragraphColumnLayout: variant === 'paragraphs' ? paragraphColumnLayout : undefined,
          imageAspectRatio: (opts.imageAspectRatio as string) ?? '1:1',
          ...colours,
          headline: slots.headline ?? s.sectionName,
          ...(variant === 'paragraphs' && paragraphColumnLayout === 'single' && (() => {
            const firstItem = Array.isArray(slots.items) && slots.items[0] && typeof slots.items[0] === 'object'
              ? (slots.items[0] as Record<string, unknown>)
              : null
            return {
              singleSubtitle: slots.subhead ?? (firstItem?.subtitle as string) ?? (firstItem?.title as string) ?? '',
              singleBody: slots.body ?? (firstItem?.body as string) ?? (firstItem?.description as string) ?? '',
            }
          })()),
          ...(variant === 'paragraphs' && paragraphColumnLayout === 'multi' && { items }),
          ...(variant === 'accordion' && { accordionItems }),
          imageUrl,
        }
      }

      case 'mediaTextAsymmetric': {
        const variant = (opts.variant as string) ?? 'faq'
        const imageUrl = getUrl(imageUrls, i)
        let items = normalizeItems(slots.items, 'mediaTextAsymmetric', imageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            { _key: 'mta-1', title: 'Question 1', body: 'Answer 1' },
            { _key: 'mta-2', title: 'Question 2', body: 'Answer 2' },
            { _key: 'mta-3', title: 'Question 3', body: 'Answer 3' },
          ]
        }
        return {
          ...base,
          variant,
          size: (opts.size as string) ?? 'feature',
          ...colours,
          blockTitle: slots.headline ?? s.sectionName,
          imageAspectRatio: (opts.imageAspectRatio as string) ?? '5:4',
          imageUrl,
          items,
        }
      }

      case 'cardGrid': {
        let items = normalizeItems(slots.items, 'cardGrid', imageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            { _key: 'cg-1', cardType: 'mediaTextBelow', title: 'Card 1', description: slots.body ?? '', imageUrl: getUrl(imageUrls, itemOffset) },
            { _key: 'cg-2', cardType: 'mediaTextBelow', title: 'Card 2', description: '', imageUrl: getUrl(imageUrls, itemOffset + 1) },
            { _key: 'cg-3', cardType: 'mediaTextBelow', title: 'Card 3', description: '', imageUrl: getUrl(imageUrls, itemOffset + 2) },
          ]
          itemOffset += 3
        }
        return {
          ...base,
          columns: String(opts.columns ?? 3),
          ...colours,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'carousel': {
        const carouselCardSize = opts.cardSize ?? 'compact'
        let items = normalizeItems(slots.items, 'carousel', imageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          const placeholderItem = (key: string, idx: number) => ({
            _key: key,
            cardType: 'mediaTextBelow' as const,
            title: idx === 0 ? 'Item 1' : 'Item 2',
            description: idx === 0 ? (slots.body ?? '') : '',
            imageUrl: getUrl(imageUrls, itemOffset + idx),
            ...(carouselCardSize === 'compact' && { aspectRatio: '4:5' as const }),
          })
          items = [placeholderItem('car-1', 0), placeholderItem('car-2', 1)]
          itemOffset += 2
        } else if (carouselCardSize === 'large' || carouselCardSize === 'medium') {
          items = items.map(({ aspectRatio: _a, ...rest }) => rest)
        }
        return {
          ...base,
          cardSize: carouselCardSize,
          ...colours,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'proofPoints': {
        let items = normalizeItems(slots.items, 'proofPoints', imageUrls, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            { _key: 'pp-1', title: 'Point 1', description: '', icon: 'IcCheckboxOn' },
            { _key: 'pp-2', title: 'Point 2', description: '', icon: 'IcSecured' },
            { _key: 'pp-3', title: 'Point 3', description: '', icon: 'IcStar' },
          ]
        }
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
