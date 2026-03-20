/**
 * Converts JioKarna PageBrief sections to Sanity block format for document creation.
 * Uses Sanity image asset references (not URLs). Images come from Sanity Image Library.
 */

import type { PageBrief, Section } from './types'

function imageRef(assetId: string | null): { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined {
  if (!assetId) return undefined
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
}

function getAsset(assetIds: string[], index: number): string | null {
  if (assetIds.length === 0) return null
  return assetIds[index % assetIds.length]
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
  assetIds: string[],
  itemOffset: number
): Record<string, unknown>[] {
  if (!Array.isArray(items) || items.length === 0) return []

  return items.map((item, i) => {
    const imgIndex = itemOffset + i
    const o = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
    const title = (o.title as string) ?? (o.headline as string) ?? `Item ${i + 1}`
    const description = (o.description as string) ?? (o.body as string) ?? ''

    switch (component) {
      case 'cardGrid': {
        const assetId = getAsset(assetIds, imgIndex)
        return {
          _type: 'cardGridItem',
          _key: `cg-${imgIndex}`,
          cardStyle: (o.cardStyle as string) ?? 'image-above',
          title,
          description,
          image: assetId ? imageRef(assetId) : undefined,
          ctaText: o.ctaText,
          ctaLink: o.ctaLink ?? (o.link as string),
          surface: (o.surface as string) ?? 'bold',
        }
      }
      case 'carousel': {
        const assetId = getAsset(assetIds, imgIndex)
        return {
          _type: 'cardItem',
          _key: `car-${imgIndex}`,
          cardType: (o.cardType as string) ?? 'media',
          title,
          description,
          image: assetId ? imageRef(assetId) : undefined,
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
      default:
        return { _key: `item-${imgIndex}`, title, description, ...o }
    }
  })
}

export type SanityBlock = {
  _type: string
  _key: string
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  [key: string]: unknown
}

export function briefToSanityBlocks(brief: PageBrief, assetIds: string[]): SanityBlock[] {
  const sections = [...brief.sections].sort((a, b) => a.order - b.order)
  let itemOffset = 0

  return sections.map((s, i) => {
    const slots = s.contentSlots
    const opts = s.blockOptions ?? {}
    const cta = getCtaFromSlot(slots.cta)
    const base: SanityBlock = {
      _type: s.component,
      _key: `section-${i}-${s.component}`,
      spacingTop: 'large',
      spacingBottom: 'large',
    }

    switch (s.component) {
      case 'hero': {
        const assetId = getAsset(assetIds, 0)
        return {
          ...base,
          contentLayout: opts.contentLayout ?? 'stacked',
          emphasis: opts.emphasis,
          surfaceColour: opts.surfaceColour,
          productName: brief.meta.pageName,
          headline: slots.headline ?? brief.meta.pageName,
          subheadline: slots.subhead ?? brief.meta.keyMessage,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          image: assetId ? imageRef(assetId) : undefined,
        }
      }

      case 'mediaTextStacked': {
        const template = opts.template ?? 'Stacked'
        const hasMedia = slots.mediaType === 'image' || slots.mediaType === 'video'
        const assetId = hasMedia ? getAsset(assetIds, i) : null
        const effectiveTemplate = hasMedia ? template : 'TextOnly'
        return {
          ...base,
          template: effectiveTemplate,
          alignment: opts.alignment as 'left' | 'center',
          ...(effectiveTemplate !== 'TextOnly' && opts.mediaSize && { mediaSize: opts.mediaSize as 'edgeToEdge' | 'default' }),
          surfaceColour: opts.surfaceColour,
          emphasis: opts.emphasis,
          contentWidth: 'L',
          mediaStyle: opts.mediaStyle ?? 'contained',
          title: slots.headline ?? s.sectionName,
          subhead: slots.subhead,
          body: slots.body,
          ctaText: cta?.label,
          ctaLink: cta?.href ?? '#',
          image: assetId ? imageRef(assetId) : undefined,
        }
      }

      case 'cardGrid': {
        let items = normalizeItems(slots.items, 'cardGrid', assetIds, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          items = [
            {
              _type: 'cardGridItem',
              _key: 'cg-1',
              cardStyle: 'image-above',
              title: 'Card 1',
              description: slots.body ?? '',
              image: getAsset(assetIds, itemOffset) ? imageRef(getAsset(assetIds, itemOffset)!) : undefined,
            },
            {
              _type: 'cardGridItem',
              _key: 'cg-2',
              cardStyle: 'image-above',
              title: 'Card 2',
              description: '',
              image: getAsset(assetIds, itemOffset + 1) ? imageRef(getAsset(assetIds, itemOffset + 1)!) : undefined,
            },
            {
              _type: 'cardGridItem',
              _key: 'cg-3',
              cardStyle: 'image-above',
              title: 'Card 3',
              description: '',
              image: getAsset(assetIds, itemOffset + 2) ? imageRef(getAsset(assetIds, itemOffset + 2)!) : undefined,
            },
          ]
          itemOffset += 3
        }
        return {
          ...base,
          columns: String(opts.columns ?? 3),
          surfaceColour: opts.surfaceColour,
          emphasis: opts.emphasis,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'carousel': {
        const carouselCardSize = opts.cardSize ?? 'compact'
        let items = normalizeItems(slots.items, 'carousel', assetIds, itemOffset)
        itemOffset += items.length
        if (items.length === 0) {
          const placeholderItem = (key: string, idx: number) => ({
            _type: 'cardItem' as const,
            _key: key,
            cardType: 'media' as const,
            title: idx === 0 ? 'Item 1' : 'Item 2',
            description: idx === 0 ? (slots.body ?? '') : '',
            image: getAsset(assetIds, itemOffset + idx) ? imageRef(getAsset(assetIds, itemOffset + idx)!) : undefined,
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
          surfaceColour: opts.surfaceColour,
          emphasis: opts.emphasis,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      case 'proofPoints': {
        let items = normalizeItems(slots.items, 'proofPoints', assetIds, itemOffset)
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
          surfaceColour: opts.surfaceColour,
          emphasis: opts.emphasis,
          title: slots.headline ?? s.sectionName,
          items,
        }
      }

      default:
        return base
    }
  })
}
