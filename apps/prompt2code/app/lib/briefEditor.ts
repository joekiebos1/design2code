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
  value: string,
): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s =>
      s.sectionName === sectionName
        ? { ...s, contentSlots: { ...s.contentSlots, [field]: value } }
        : s
    ),
  }
}

export function updateCtaLabel(
  brief: PageBrief,
  sectionName: string,
  value: string,
): PageBrief {
  return {
    ...brief,
    sections: brief.sections.map(s => {
      if (s.sectionName !== sectionName) return s
      const prev = s.contentSlots.cta
      const cta: SectionCTA = typeof prev === 'string' || prev == null
        ? { label: value, destination: null, rationale: null }
        : { ...prev, label: value }
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
