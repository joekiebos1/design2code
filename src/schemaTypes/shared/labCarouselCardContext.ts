/** Parent of `labCardItem` when nested as `sections[i].items[j]`. */
export type LabSectionBlock = {
  _type?: string
  cardSize?: string
  _key?: string
}

type LabDoc = { sections?: LabSectionBlock[] | null } | null | undefined

/**
 * Same `labCardItem` object is used inside `labCarousel` and `labCardGrid`. Carousel aspect rules
 * depend on the parent block’s `cardSize`; the grid keeps all ratio options.
 */
export function getParentBlockForLabCardItemPath(
  document: LabDoc,
  path: readonly unknown[] | undefined,
): LabSectionBlock | undefined {
  if (!document?.sections || !path || !Array.isArray(path) || path[0] !== 'sections') return undefined
  if (path[2] !== 'items') return undefined
  const sectionSegment = path[1]
  const sections = document.sections
  if (typeof sectionSegment === 'number') return sections[sectionSegment]
  if (sectionSegment && typeof sectionSegment === 'object' && '_key' in sectionSegment) {
    const key = (sectionSegment as { _key: string })._key
    return sections.find((s) => s?._key === key)
  }
  return undefined
}

const LIST_GRID: { value: string; title: string }[] = [
  { value: '4:5', title: '4:5' },
  { value: '8:5', title: '8:5' },
  { value: '2:1', title: '2:1' },
]

/** Options shown in Studio for this card’s placement (carousel size vs card grid). */
export function labCardAspectRatioListForPath(document: LabDoc, path: readonly unknown[] | undefined) {
  const block = getParentBlockForLabCardItemPath(document, path)
  if (block?._type !== 'labCarousel') return LIST_GRID
  if (block.cardSize === 'compact')
    return [
      { value: '4:5', title: '4:5' },
      { value: '8:5', title: '8:5' },
    ]
  if (block.cardSize === 'medium') return [{ value: '4:5', title: '4:5' }]
  if (block.cardSize === 'large') return [{ value: '2:1', title: '2:1' }]
  return LIST_GRID
}

export function validateLabCardAspectRatioForPath(
  value: string | undefined,
  document: LabDoc,
  path: readonly unknown[] | undefined,
): true | string {
  if (value === undefined || value === '') return true
  const allowed = labCardAspectRatioListForPath(document, path).map((o) => o.value)
  if (allowed.includes(value)) return true
  const block = getParentBlockForLabCardItemPath(document, path)
  if (block?._type === 'labCarousel') {
    if (block.cardSize === 'compact') return 'Compact carousel: choose 4:5 or 8:5.'
    if (block.cardSize === 'medium') return 'Medium carousel: 4:5 only.'
    if (block.cardSize === 'large') return 'Large carousel: 2:1 only.'
  }
  return true
}
