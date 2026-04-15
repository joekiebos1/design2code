/**
 * Pure functions for mutating a PageBrief in the direct editor.
 * All functions return a new brief — they never mutate in place.
 */

import type { PageBrief, Section, SectionCTA } from './types'

// ─── Field updates ─────────────────────────────────────────────────────────

export function updateField(
  brief: PageBrief,
  sectionName: string,
  field: 'headline' | 'body' | 'subhead' | 'eyebrow',
  value: string | null,
): PageBrief {
  const normalised = value === '' ? null : value
  return {
    ...brief,
    sections: brief.sections.map(s =>
      s.sectionName === sectionName
        ? { ...s, contentSlots: { ...s.contentSlots, [field]: normalised } }
        : s
    ),
  }
}

export function updateCtaLabel(
  brief: PageBrief,
  sectionName: string,
  value: string | null,
): PageBrief {
  const normalised = value === '' ? null : value
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s
      const prev = s.contentSlots.cta
      if (!normalised) {
        // Clear label but keep destination if it already exists as an object
        const cta = typeof prev === 'object' && prev != null
          ? { ...prev, label: null }
          : null
        return { ...s, contentSlots: { ...s.contentSlots, cta } }
      }
      const cta: SectionCTA = typeof prev === 'string' || prev == null
        ? { label: normalised, destination: null, rationale: null }
        : { ...prev, label: normalised }
      return { ...s, contentSlots: { ...s.contentSlots, cta } }
    }),
  }
}

// ─── Item updates ──────────────────────────────────────────────────────────

export function updateItemField(
  brief: PageBrief,
  sectionName: string,
  itemIndex: number,
  field: string,
  value: string,
): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s
      const items = Array.isArray(s.contentSlots.items) ? [...s.contentSlots.items] : []
      items[itemIndex] = { ...(items[itemIndex] as Record<string, unknown> ?? {}), [field]: value }
      return { ...s, contentSlots: { ...s.contentSlots, items } }
    }),
  }
}

function defaultItem(component: string): Record<string, unknown> {
  switch (component) {
    case 'cardGrid':             return { cardType: 'mediaTextBelow', title: 'New card', description: '' }
    case 'carousel':             return { cardType: 'mediaTextBelow', title: 'New item', description: '' }
    case 'proofPoints':          return { title: 'New point', description: '', icon: 'IcStar' }
    case 'mediaText5050':        return { subtitle: 'New question', body: 'Answer here' }
    case 'mediaTextAsymmetric':  return { title: 'New question', body: 'Answer here' }
    default:                     return { title: 'New item', description: '' }
  }
}

export function addItem(brief: PageBrief, sectionName: string): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s
      const items = Array.isArray(s.contentSlots.items) ? [...s.contentSlots.items] : []
      return { ...s, contentSlots: { ...s.contentSlots, items: [...items, defaultItem(s.component)] } }
    }),
  }
}

export function removeItem(brief: PageBrief, sectionName: string, itemIndex: number): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s
      const items = Array.isArray(s.contentSlots.items) ? [...s.contentSlots.items] : []
      return { ...s, contentSlots: { ...s.contentSlots, items: items.filter((_, i) => i !== itemIndex) } }
    }),
  }
}

// ─── Add section ─────────────────────────────────────────────────────────────

/**
 * Appends a new section to the end of the engage zone (before resolve sections).
 * Seeds default content so the block renders immediately without placeholders.
 */
/** Block types that can be added via the Layers panel Add button (hero excluded). */
export const ADDABLE_COMPONENTS = [
  'mediaTextStacked',
  'mediaText5050',
  'mediaTextAsymmetric',
  'cardGrid',
  'carousel',
  'proofPoints',
] as const

export function addSection(
  brief: PageBrief,
  component: string,
): { brief: PageBrief; sectionName: string } {
  const heroSections    = brief.sections.filter(s => s.component === 'hero')
  const engageSections  = brief.sections.filter(s => s.component !== 'hero' && s.narrativeRole !== 'resolve')
  const resolveSections = brief.sections.filter(s => s.narrativeRole === 'resolve')

  const maxOrder = brief.sections.reduce((m, s) => Math.max(m, s.order), 0)
  const sectionName = `${component}-${Date.now()}`

  const needsItems = ITEMS_REQUIRED.has(component)
  const count = DEFAULT_ITEM_COUNT[component] ?? 3
  const items = needsItems
    ? Array.from({ length: count }, () => defaultItem(component))
    : null

  const hasMedia = component === 'mediaTextStacked' || component === 'mediaText5050'

  const newSection: Section = {
    order: maxOrder + 1,
    sectionName,
    component,
    rationale: '',
    narrativeRole: 'explain',
    flags: [],
    blockOptions: {},
    contentSlots: {
      headline: 'New block',
      subhead: null,
      body: null,
      cta: null,
      mediaType: hasMedia ? 'image' : null,
      items,
    },
  }

  return {
    sectionName,
    brief: {
      ...brief,
      sections: [
        ...heroSections,
        ...engageSections,
        newSection,
        ...resolveSections.map(s => ({ ...s, order: s.order + 1 })),
      ],
    },
  }
}

// ─── Image override ────────────────────────────────────────────────────────

/** Pins a specific DAM image URL to a section (stored as _imageUrl, read by briefToBlocks). */
export function pinImage(brief: PageBrief, sectionName: string, imageUrl: string): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s =>
      s.sectionName === sectionName
        ? { ...s, _imageUrl: imageUrl } as Section & { _imageUrl: string }
        : s
    ),
  }
}

// ─── Component swap ───────────────────────────────────────────────────────

/** Block types that require an `items` array to render meaningfully. */
const ITEMS_REQUIRED = new Set([
  'cardGrid', 'carousel', 'proofPoints', 'mediaTextAsymmetric', 'mediaText5050',
])

/** Default number of placeholder items injected when swapping to an items-based block. */
const DEFAULT_ITEM_COUNT: Record<string, number> = {
  cardGrid: 3, carousel: 4, proofPoints: 3, mediaTextAsymmetric: 3, mediaText5050: 2,
}

/**
 * Swaps the component type on a section.
 * - All contentSlots are preserved (nothing wiped).
 * - emphasis / appearance in blockOptions are preserved; variant-specific keys are reset.
 * - If the new component needs items and none exist, placeholder items are injected.
 */
export function swapComponent(
  brief: PageBrief,
  sectionName: string,
  newComponent: string,
): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s

      // Keep visual style, discard component-specific layout keys
      const { emphasis, appearance } = s.blockOptions ?? {}
      const nextOptions = { emphasis: emphasis ?? null, appearance: appearance ?? null }

      // Ensure items exist if the new component requires them
      const existingItems = Array.isArray(s.contentSlots.items) ? s.contentSlots.items : []
      const count = DEFAULT_ITEM_COUNT[newComponent] ?? 3
      const items = ITEMS_REQUIRED.has(newComponent) && existingItems.length === 0
        ? Array.from({ length: count }, () => defaultItem(newComponent))
        : s.contentSlots.items

      return {
        ...s,
        component: newComponent,
        blockOptions: nextOptions,
        contentSlots: { ...s.contentSlots, items },
      }
    }),
  }
}

// ─── Section reorder ──────────────────────────────────────────────────────

/**
 * Reorders non-resolve sections.
 * Receives an array of sectionNames (non-resolve only) in the new desired order.
 * Resolve sections are always preserved at the end, in their original order.
 */
export function reorderSections(brief: PageBrief, newOrder: string[]): PageBrief {
  const resolve = brief.sections
    .filter(s => s.narrativeRole === 'resolve')
    .sort((a, b) => a.order - b.order)

  const nonResolveByName = new Map(
    brief.sections.filter(s => s.narrativeRole !== 'resolve').map(s => [s.sectionName, s])
  )

  const reordered = newOrder
    .map(name => nonResolveByName.get(name))
    .filter((s): s is Section => s != null)

  return {
    ...brief,
    sections: [
      ...reordered.map((s, i) => ({ ...s, order: i + 1 })),
      ...resolve.map((s, i) => ({ ...s, order: reordered.length + i + 1 })),
    ],
  }
}
