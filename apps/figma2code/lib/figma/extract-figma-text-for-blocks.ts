/**
 * Walk Figma REST node trees and map TEXT layers to Sanity block fields.
 * Layer names drive matching (e.g. "Headline", "Subhead", "Card / Title").
 */

import type { FigmaFileNode } from './figma-rest-api.ts'
import {
  variantFieldsFromFigmaComponentProperties,
  type FigmaMappedSanityBlockType,
} from './figma-block-map.ts'
import type { FigmaImportedContent } from './figma-import-types.ts'
import {
  collectFigmaStringComponentProperties,
  matchOptionValue,
  NORMALISE,
} from './figma-variant-matching.ts'

type TextHit = { name: string; text: string }

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Depth-first TEXT nodes with non-empty characters */
export function collectTextNodes(node: FigmaFileNode | undefined): TextHit[] {
  if (!node) return []
  const out: TextHit[] = []
  if (node.type === 'TEXT' && typeof node.characters === 'string') {
    const t = node.characters.replace(/\r\n/g, '\n').trim()
    if (t.length > 0) out.push({ name: node.name, text: t })
  }
  for (const ch of node.children ?? []) {
    out.push(...collectTextNodes(ch))
  }
  return out
}

function sortByVisualPosition(nodes: FigmaFileNode[]): FigmaFileNode[] {
  return [...nodes].sort((a, b) => {
    const ay = a.absoluteBoundingBox?.y ?? 0
    const by = b.absoluteBoundingBox?.y ?? 0
    if (Math.abs(ay - by) > 1) return ay - by
    const ax = a.absoluteBoundingBox?.x ?? 0
    const bx = b.absoluteBoundingBox?.x ?? 0
    return ax - bx
  })
}

function pickByNamePatterns(texts: TextHit[], patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const hit = texts.find((t) => re.test(norm(t.name)))
    if (hit?.text) return hit.text
  }
  return undefined
}

/** TEXT layers used for card title/body/CTA — excludes Alt text (accessibility), not card copy. */
function collectTextNodesExcludingAlt(node: FigmaFileNode | undefined): TextHit[] {
  return collectTextNodes(node).filter((t) => !/alt|alt text|image description/i.test(norm(t.name)))
}

const CARD_ASPECT_FIGMA_OPTIONS: ReadonlyArray<{ value: '4:5' | '8:5' | '2:1'; title: string }> = [
  { value: '4:5', title: '4:5' },
  { value: '8:5', title: '8:5' },
  { value: '2:1', title: '2:1' },
]

/** Figma VARIANTs use `4x5`, `8x5`, etc.; Sanity `cardItem.aspectRatio` uses the same order with `:` only. */
function normalizeFigmaAspectRatioToken(value: string): string {
  return value.trim().replace(/\s+/g, '').replace(/[xX]/g, ':')
}

function matchCardAspectFromFigmaValue(value: string): '4:5' | '8:5' | '2:1' | undefined {
  const token = normalizeFigmaAspectRatioToken(value)
  return (
    matchOptionValue(token, CARD_ASPECT_FIGMA_OPTIONS) ??
    matchOptionValue(value, CARD_ASPECT_FIGMA_OPTIONS)
  )
}

/**
 * Team Library encodes aspect in INSTANCE `name` (e.g. `CardItem 8x5 textInside`).
 * First `digits x|: digits` substring that maps to Sanity `aspectRatio` wins.
 */
function parseAspectRatioFromCardInstanceName(name: string): '4:5' | '8:5' | '2:1' | undefined {
  const re = /(\d+)\s*[xX:]\s*(\d+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(name)) !== null) {
    const token = `${m[1]}:${m[2]}`
    const hit = matchCardAspectFromFigmaValue(token)
    if (hit) return hit
  }
  return undefined
}

/**
 * Maps Figma card template VARIANT labels to Sanity `cardItem.cardType`.
 * Text inside / Text below → mediaTextBelow; Text on colour → colourFeatured.
 */
function matchCardTemplateToSanity(value: string): 'mediaTextBelow' | 'colourFeatured' | undefined {
  const h = NORMALISE(value)
  if (!h) return undefined
  if (/^\d+\s*[x:]\s*\d+$/.test(h.replace(/\s/g, ''))) return undefined
  if (/\btext\s+on\s+colou?r\b/.test(h) || h === 'colourFeatured' || h === 'text-on-colour') return 'colourFeatured'
  if (/\btext\s+inside\b/.test(h) || /\btext\s+below\b/.test(h)) return 'mediaTextBelow'
  if (h === 'media' || h === 'mediaTextBelow' || h === 'image' || /\bmedia\s+card\b/.test(h)) return 'mediaTextBelow'
  const fromTitle = matchOptionValue(value, [
    { value: 'colourFeatured' as const, title: 'Text on colour' },
    { value: 'mediaTextBelow' as const, title: 'Text inside' },
    { value: 'mediaTextBelow' as const, title: 'Text below' },
  ])
  return fromTitle
}

function propertyKeySuggestsCardAspect(displayKey: string): boolean {
  const k = NORMALISE(displayKey).replace(/\s+/g, '')
  return /aspect|atio|ratio|slot|width|format|proportion|cardsize/.test(k) && !/cardtype|type\b/.test(k)
}

function propertyKeySuggestsCardTemplate(displayKey: string): boolean {
  const k = NORMALISE(displayKey).replace(/\s+/g, '')
  if (/aspect|atio|ratio|slot|width|format|proportion|cardsize/.test(k)) return false
  return /type|template|variant|layout|style|mode|kind|cardtype/.test(k)
}

function parseCardItemVariantFields(node: FigmaFileNode): {
  cardType?: 'mediaTextBelow' | 'colourFeatured'
  aspectRatio?: '4:5' | '8:5' | '2:1'
} {
  const props = node.componentProperties as Record<string, unknown> | undefined
  const entries = props ? collectFigmaStringComponentProperties(props) : []
  let cardType: 'mediaTextBelow' | 'colourFeatured' | undefined
  let aspectRatio: '4:5' | '8:5' | '2:1' | undefined

  for (const e of entries) {
    const ar = matchCardAspectFromFigmaValue(e.value)
    if (ar && propertyKeySuggestsCardAspect(e.displayKey)) {
      aspectRatio = ar
      break
    }
  }
  if (!aspectRatio) {
    for (const e of entries) {
      const ar = matchCardAspectFromFigmaValue(e.value)
      if (ar) {
        aspectRatio = ar
        break
      }
    }
  }
  if (!aspectRatio) {
    aspectRatio = parseAspectRatioFromCardInstanceName(node.name)
  }

  for (const e of entries) {
    const ct = matchCardTemplateToSanity(e.value)
    if (!ct) continue
    if (propertyKeySuggestsCardTemplate(e.displayKey)) {
      cardType = ct
      break
    }
  }
  if (!cardType) {
    for (const e of entries) {
      const ct = matchCardTemplateToSanity(e.value)
      if (ct) {
        cardType = ct
        break
      }
    }
  }

  return { cardType, aspectRatio }
}

/**
 * Figma Heading block: Eyebrow, Title, Description layer names.
 */
function extractHeadingEyebrowTitleDescription(headingNode: FigmaFileNode): {
  eyebrow?: string
  title?: string
  description?: string
} {
  const texts = collectTextNodes(headingNode)
  const byExactName = (re: RegExp) => texts.find((t) => re.test(t.name.trim()))?.text?.trim()

  let eyebrow =
    byExactName(/^Eyebrow$/i) ||
    pickByNamePatterns(texts, [/^eyebrow$/i, /^overline$/i, /^kicker$/i])
  let title =
    byExactName(/^Title$/i) ||
    pickByNamePatterns(texts, [/^title$/i, /^display$/i, /^headline$/i, /^heading$/i])
  let description =
    byExactName(/^Description$/i) ||
    pickByNamePatterns(texts, [/^description$/i, /^body$/i, /^text$/i, /subhead|subtitle/i])

  if (!eyebrow) {
    eyebrow = pickByNamePatterns(texts, [/^label$/i, /category/i])
  }

  const out: { eyebrow?: string; title?: string; description?: string } = {}
  if (eyebrow) out.eyebrow = eyebrow
  if (title) out.title = title
  if (description) out.description = description
  return out
}

function extractHero(node: FigmaFileNode): NonNullable<FigmaImportedContent['hero']> {
  const texts = collectTextNodes(node)
  let eyebrow = pickByNamePatterns(texts, [/product|device|eyebrow|label above|sku/i, /^label$/i])
  let title = pickByNamePatterns(texts, [/headline|hero title|display|main title/i, /^title$/i])
  let body = pickByNamePatterns(texts, [
    /^body$/i,
    /subhead|subtitle|description|intro|body copy|tagline/i,
  ])
  let ctaText = pickByNamePatterns(texts, [/^cta$/i, /primary button|shop now|learn more|get started/i])
  let cta2Text = pickByNamePatterns(texts, [/secondary|cta 2|second button/i])

  const assigned = new Set([eyebrow, title, body, ctaText, cta2Text].filter(Boolean) as string[])
  const byOrder = texts.map((t) => t.text).filter((t) => !assigned.has(t))

  if (!title && byOrder[0]) title = byOrder[0]
  if (title) assigned.add(title)
  const order2 = texts.map((t) => t.text).filter((t) => !assigned.has(t))
  if (!body && order2[0]) body = order2[0]
  if (body) assigned.add(body)
  const order3 = texts.map((t) => t.text).filter((t) => !assigned.has(t))
  if (!ctaText && order3[0] && order3[0].length < 72) ctaText = order3[0]

  const out: NonNullable<FigmaImportedContent['hero']> = {}
  if (eyebrow) out.eyebrow = eyebrow
  if (title) out.title = title
  if (body) out.body = body
  if (ctaText) out.ctaText = ctaText
  if (cta2Text) out.cta2Text = cta2Text
  return out
}

function looksLikeUrl(s: string): boolean {
  const t = s.trim()
  return /^https?:\/\//i.test(t) || (t.startsWith('/') && t.length > 1 && !/\s/.test(t))
}

/** TEXT nodes whose subtrees rooted at `excludeRootIds` are skipped (e.g. card bodies). */
function collectTextHitsOutsideExcludedSubtrees(
  node: FigmaFileNode | undefined,
  excludeRootIds: ReadonlySet<string>,
): TextHit[] {
  if (!node) return []
  const out: TextHit[] = []
  function walk(n: FigmaFileNode, insideExcluded: boolean) {
    const excludedHere = insideExcluded || excludeRootIds.has(n.id)
    if (n.type === 'TEXT' && typeof n.characters === 'string' && !excludedHere) {
      const t = n.characters.replace(/\r\n/g, '\n').trim()
      if (t.length > 0) out.push({ name: n.name, text: t })
    }
    for (const ch of n.children ?? []) walk(ch, excludedHere)
  }
  walk(node, false)
  return out
}

const CAROUSEL_CHROME_FRAME =
  /^(section )?(header|intro|framing|title row|eyebrow|label row|description row|section header|block header|heading row|overline)$/i

function isCarouselChromeFrame(name: string): boolean {
  return CAROUSEL_CHROME_FRAME.test(norm(name))
}

/** Named like a slide / card instance in common libraries. */
function isSlideLikeLayerName(name: string): boolean {
  return /card|slide|item|tile|panel|column|cell/i.test(norm(name))
}

/**
 * Likely a content card (not a section chrome frame with a single short label).
 */
function looksLikeCarouselSlideFrame(n: FigmaFileNode): boolean {
  if (isCarouselChromeFrame(n.name)) return false
  const texts = collectTextNodes(n)
  if (texts.length === 0) return false
  if (isSlideLikeLayerName(n.name)) return true
  if (texts.length >= 2) return true
  const len = texts[0].text.length
  const childCount = n.children?.length ?? 0
  if (len >= 40 && childCount <= 1 && !isSlideLikeLayerName(n.name)) return false
  if (len >= 40) return true
  if (len > 12 && childCount > 1) return true
  if (len <= 12) return false
  return len > 12
}

/**
 * Shallow heuristics: direct children, track unwrap, single-wrapper unwrap.
 */
function getCarouselCardRootsShallow(node: FigmaFileNode): FigmaFileNode[] {
  const children = sortByVisualPosition(node.children ?? [])
  let structural = children.filter((c) =>
    ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type),
  )

  const withoutChrome = structural.filter((c) => !isCarouselChromeFrame(c.name))
  if (withoutChrome.length > 0) structural = withoutChrome

  const trackChild = structural.find((c) =>
    /track|slides|cards|items|carousel row|card row|content$/i.test(norm(c.name)),
  )
  if (trackChild) {
    const inner = sortByVisualPosition(trackChild.children ?? []).filter((c) =>
      ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type),
    )
    if (inner.length >= 1) return inner
  }

  if (structural.length === 1) {
    const only = structural[0]
    const inner = sortByVisualPosition(only.children ?? []).filter((c) =>
      ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type),
    )
    if (inner.length >= 2) return inner
    if (inner.length === 1) {
      const nested = sortByVisualPosition(inner[0].children ?? []).filter((c) =>
        ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type),
      )
      if (nested.length >= 2) return nested
    }
  }

  return structural
}

/**
 * DFS: find a node whose **direct** structural children form the largest row of text-bearing
 * slide-like frames. Picks deeper rows (e.g. track with 3 cards) over shallow pairs (header + track).
 */
function findLargestSlideSiblingGroup(root: FigmaFileNode): FigmaFileNode[] | null {
  let best: FigmaFileNode[] | null = null
  let bestLen = 0

  function consider(parent: FigmaFileNode) {
    const structural = sortByVisualPosition(parent.children ?? []).filter((c) =>
      ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type),
    )
    const candidates = structural.filter(
      (c) => !isCarouselChromeFrame(c.name) && collectTextNodes(c).length > 0,
    )
    const slides = candidates.filter((c) => looksLikeCarouselSlideFrame(c))
    const group = slides.length >= 2 ? slides : candidates.length >= 2 ? candidates : []
    if (group.length > bestLen) {
      best = group
      bestLen = group.length
    }
  }

  function walk(n: FigmaFileNode) {
    consider(n)
    for (const ch of n.children ?? []) walk(ch)
  }
  walk(root)
  return bestLen >= 2 ? best : null
}

function pickBetterCardRoots(shallow: FigmaFileNode[], deep: FigmaFileNode[] | null): FigmaFileNode[] {
  if (!deep || deep.length < 2) return shallow
  if (shallow.length <= 1) return deep
  if (deep.length > shallow.length) return deep
  if (deep.length === shallow.length) return deep
  return shallow
}

/**
 * Card rows: shallow unwrap + deep slide-row search so nested tracks (3+ cards) map without Figma edits.
 */
function getCarouselCardRoots(node: FigmaFileNode): FigmaFileNode[] {
  const shallow = getCarouselCardRootsShallow(node)
  const deep = findLargestSlideSiblingGroup(node)
  return pickBetterCardRoots(shallow, deep)
}

/** TEXT layers visually above the top edge of the card strip (section title sitting above slides). */
function collectFramingTextsAboveCardStrip(
  root: FigmaFileNode,
  cardRoots: FigmaFileNode[],
): TextHit[] {
  const boxes = cardRoots
    .map((r) => r.absoluteBoundingBox)
    .filter((b): b is NonNullable<typeof b> => b != null && typeof b.y === 'number')
  if (boxes.length === 0) return []
  const minTopY = Math.min(...boxes.map((b) => b.y))
  const out: TextHit[] = []
  function walk(n: FigmaFileNode) {
    if (
      n.type === 'TEXT' &&
      typeof n.characters === 'string' &&
      n.absoluteBoundingBox &&
      typeof n.absoluteBoundingBox.y === 'number'
    ) {
      const cy = n.absoluteBoundingBox.y + (n.absoluteBoundingBox.height ?? 0) / 2
      if (cy < minTopY - 1) {
        const t = n.characters.replace(/\r\n/g, '\n').trim()
        if (t.length > 0) out.push({ name: n.name, text: t })
      }
    }
    for (const ch of n.children ?? []) walk(ch)
  }
  walk(root)
  return out
}

function mergeTextHitsUnique(a: TextHit[], b: TextHit[]): TextHit[] {
  const seen = new Set<string>()
  const out: TextHit[] = []
  for (const h of [...a, ...b]) {
    const key = `${norm(h.name)}::${h.text}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(h)
  }
  return out
}

function figmaIdCanonical(id: string): string {
  return id.replace(/-/g, ':')
}

function figmaIdsEqual(a: string, b: string): boolean {
  return figmaIdCanonical(a) === figmaIdCanonical(b)
}

/** Keys used to look up a node id from the Figma REST tree. */
function normalizeFigmaNodeIdKeys(id: string): string[] {
  const withColon = id.includes(':') ? id : id.replace(/-/g, ':')
  const withHyphen = withColon.replace(/:/g, '-')
  return [...new Set([id, withColon, withHyphen])]
}

function buildNodeIdIndex(root: FigmaFileNode): Map<string, FigmaFileNode> {
  const map = new Map<string, FigmaFileNode>()
  function walk(n: FigmaFileNode) {
    for (const key of normalizeFigmaNodeIdKeys(n.id)) {
      map.set(key, n)
    }
    for (const ch of n.children ?? []) walk(ch)
  }
  walk(root)
  return map
}

/** Order INSTANCE_SWAP slots (e.g. "Compact Card 1#…", "Card 2"). */
function slotOrderFromSwapKey(key: string): number {
  const hashNum = key.match(/#(\d+)\s*$/i)
  if (hashNum) return parseInt(hashNum[1], 10)
  const cardNum = key.match(/card\s*(\d+)/i)
  if (cardNum) return parseInt(cardNum[1], 10)
  const tailNum = key.match(/(\d+)\s*$/)
  return tailNum ? parseInt(tailNum[1], 10) : 0
}

type CarouselSwapSlot = { key: string; value: string; order: number }

/**
 * INSTANCE_SWAP rows on the carousel root — one resolved card subtree per slot (REST-first).
 * Keys are typically named like card/slide/item; skips unrelated swaps (e.g. icons).
 */
function parseCarouselSwapSlots(
  componentProperties: Record<string, unknown> | undefined,
): CarouselSwapSlot[] {
  if (!componentProperties) return []
  const slots: CarouselSwapSlot[] = []
  for (const [key, raw] of Object.entries(componentProperties)) {
    const prop = raw as { type?: string; value?: unknown }
    if (prop?.type !== 'INSTANCE_SWAP' || typeof prop.value !== 'string' || !prop.value.trim()) continue
    if (!/card|slide|item|tile|panel/i.test(key)) continue
    slots.push({ key, value: prop.value.trim(), order: slotOrderFromSwapKey(key) })
  }
  slots.sort((a, b) =>
    a.order === b.order ? a.key.localeCompare(b.key) : a.order - b.order,
  )
  return slots
}

function collectInstancesMatchingComponentId(
  root: FigmaFileNode,
  componentId: string,
): FigmaFileNode[] {
  const out: FigmaFileNode[] = []
  function walk(n: FigmaFileNode) {
    if (n.type === 'INSTANCE' && n.componentId && figmaIdsEqual(n.componentId, componentId)) {
      out.push(n)
    }
    for (const ch of n.children ?? []) walk(ch)
  }
  walk(root)
  return sortByVisualPosition(out)
}

/**
 * Map each INSTANCE_SWAP value to a card root: prefer document node id, else nth INSTANCE with
 * matching componentId (sorted left-to-right).
 */
function resolveCarouselCardRootsFromSwaps(
  root: FigmaFileNode,
  slots: CarouselSwapSlot[],
): FigmaFileNode[] | null {
  if (slots.length === 0) return null
  const idMap = buildNodeIdIndex(root)
  const used = new Set<string>()
  const cards: FigmaFileNode[] = []
  const takeIndexByValue = new Map<string, number>()

  for (const slot of slots) {
    let node: FigmaFileNode | null = null
    for (const id of normalizeFigmaNodeIdKeys(slot.value)) {
      const n = idMap.get(id)
      if (n && !used.has(n.id)) {
        node = n
        break
      }
    }
    if (node) {
      used.add(node.id)
      cards.push(node)
      continue
    }
    const pool = collectInstancesMatchingComponentId(root, slot.value).filter((n) => !used.has(n.id))
    const idx = takeIndexByValue.get(slot.value) ?? 0
    takeIndexByValue.set(slot.value, idx + 1)
    const picked = pool[idx]
    if (!picked) return null
    used.add(picked.id)
    cards.push(picked)
  }
  return cards.length === slots.length ? cards : null
}

/**
 * Section chrome: Surface → Heading (title / description), not card rows.
 */
function findCarouselHeadingSubtree(root: FigmaFileNode): FigmaFileNode | null {
  function walkDepthFirst(n: FigmaFileNode): FigmaFileNode | null {
    const nm = n.name.trim().toLowerCase()
    if (nm === 'heading') return n
    for (const ch of n.children ?? []) {
      const hit = walkDepthFirst(ch)
      if (hit) return hit
    }
    return null
  }
  const direct = walkDepthFirst(root)
  if (direct) return direct

  let found: FigmaFileNode | null = null
  function walkPattern(n: FigmaFileNode) {
    if (found) return
    const t = n.name.trim()
    if (/heading row|section heading|block heading/i.test(t)) found = n
    for (const ch of n.children ?? []) walkPattern(ch)
  }
  walkPattern(root)
  return found
}

function extractCarouselCardItem(root: FigmaFileNode): {
  title: string
  description?: string
  ctaText?: string
  link?: string
  cardType?: 'mediaTextBelow' | 'colourFeatured'
  aspectRatio?: '4:5' | '8:5' | '2:1'
} | null {
  const variants = parseCardItemVariantFields(root)
  const texts = collectTextNodesExcludingAlt(root)
  if (texts.length === 0) return null

  let title =
    pickByNamePatterns(texts, [/^title$/i, /^card title$/i, /^heading$/i, /card heading|^name$/i]) ??
    undefined
  let description =
    pickByNamePatterns(texts, [/^description$/i, /^body$/i, /subtitle|card copy|deck|excerpt/i]) ??
    undefined
  let ctaText = pickByNamePatterns(texts, [
    /^ctaText$/i,
    /^cta$/i,
    /^button$/i,
    /button label|primary button|shop now|learn more|read more/i,
  ])
  let link = pickByNamePatterns(texts, [/^link$/i, /^url$/i, /^href$/i])

  if (!link) {
    const urlHit = texts.find(
      (t) => looksLikeUrl(t.text) && !/alt/i.test(norm(t.name)),
    )
    if (urlHit) link = urlHit.text.trim()
  }

  const assigned = new Set([title, description, ctaText, link].filter(Boolean) as string[])
  const rest = texts.map((t) => t.text).filter((t) => !assigned.has(t))
  if (!title && rest[0]) title = rest[0]
  if (!title) return null
  assigned.add(title)
  const rest2 = texts.map((t) => t.text).filter((t) => !assigned.has(t))
  if (!description && rest2[0] && !looksLikeUrl(rest2[0])) description = rest2[0]
  if (description) assigned.add(description)
  const rest3 = texts.map((t) => t.text).filter((t) => !assigned.has(t))
  if (!ctaText && rest3[0] && rest3[0].length < 96 && !looksLikeUrl(rest3[0])) ctaText = rest3[0]

  return {
    title,
    ...(description && description !== title ? { description } : {}),
    ...(ctaText ? { ctaText } : {}),
    ...(link ? { link } : {}),
    ...(variants.cardType ? { cardType: variants.cardType } : {}),
    ...(variants.aspectRatio ? { aspectRatio: variants.aspectRatio } : {}),
  }
}

function extractCarouselSectionFraming(outsideTexts: TextHit[]): {
  title?: string
  description?: string
  callToActions?: Array<{ label: string; link?: string }>
} {
  const title = pickByNamePatterns(outsideTexts, [
    /^section title$/i,
    /carousel title|block title|section heading|section headline/i,
    /^heading$/i,
    /^title$/i,
    /^display$/i,
    /headline/i,
  ])
  const description = pickByNamePatterns(outsideTexts, [
    /^section description$/i,
    /^description$/i,
    /^body$/i,
    /^text$/i,
    /intro|subtitle|deck|subhead/i,
  ])

  const labelHits = outsideTexts.filter(
    (t) =>
      /cta|button|section cta|primary|secondary/i.test(norm(t.name)) &&
      !looksLikeUrl(t.text) &&
      !/alt/i.test(norm(t.name)),
  )
  const urlHits = outsideTexts.filter((t) => looksLikeUrl(t.text))
  const callToActions: Array<{ label: string; link?: string }> = []
  for (let i = 0; i < labelHits.length; i++) {
    const label = labelHits[i].text.trim()
    if (!label) continue
    const link = urlHits[i]?.text.trim() ?? urlHits[0]?.text.trim()
    callToActions.push({ label, ...(link ? { link } : {}) })
  }

  const out: {
    title?: string
    description?: string
    callToActions?: Array<{ label: string; link?: string }>
  } = {}
  if (title) out.title = title
  if (description && description !== title) out.description = description
  if (callToActions.length > 0) out.callToActions = callToActions
  return out
}

/** Card slides + section framing (title, description, CTAs) from named layers and structure. */
function extractCarousel(node: FigmaFileNode): NonNullable<FigmaImportedContent['carousel']> {
  const swapSlots = parseCarouselSwapSlots(
    node.componentProperties as Record<string, unknown> | undefined,
  )
  const swapRoots =
    swapSlots.length > 0 ? resolveCarouselCardRootsFromSwaps(node, swapSlots) : null
  const cardRoots = swapRoots ?? getCarouselCardRoots(node)

  const excludeIds = new Set(cardRoots.map((r) => r.id))
  const headingNode = findCarouselHeadingSubtree(node)
  const fallbackFramingPool = mergeTextHitsUnique(
    collectTextHitsOutsideExcludedSubtrees(node, excludeIds),
    collectFramingTextsAboveCardStrip(node, cardRoots),
  )
  const headingTexts = headingNode ? collectTextNodes(headingNode) : []
  const framingPoolForPatterns =
    headingTexts.length > 0 ? headingTexts : fallbackFramingPool
  const patternFraming = extractCarouselSectionFraming(framingPoolForPatterns)

  const structuredHeading =
    headingNode && headingTexts.length > 0
      ? extractHeadingEyebrowTitleDescription(headingNode)
      : {}

  const title = structuredHeading.title ?? patternFraming.title
  const description = structuredHeading.description ?? patternFraming.description
  const eyebrow = structuredHeading.eyebrow
  const callToActions = patternFraming.callToActions

  const variantFields = variantFieldsFromFigmaComponentProperties(
    'carousel',
    node.componentProperties as Record<string, unknown> | undefined,
  )
  const cardSizeRaw = variantFields.cardSize
  const cardSize =
    typeof cardSizeRaw === 'string' && ['compact', 'medium', 'large'].includes(cardSizeRaw)
      ? (cardSizeRaw as 'compact' | 'medium' | 'large')
      : undefined

  const items: NonNullable<FigmaImportedContent['carousel']>['items'] = []
  for (const root of cardRoots) {
    const card = extractCarouselCardItem(root)
    if (card) items.push(card)
  }

  if (items.length === 0) {
    const all = collectTextNodesExcludingAlt(node)
    if (all.length >= 1) {
      items.push({
        title: all[0].text,
        ...(all[1] && !looksLikeUrl(all[1].text) ? { description: all[1].text } : {}),
      })
    }
  }

  const framingOut: NonNullable<FigmaImportedContent['carousel']> = {
    items: items.length > 0 ? items : [{ title: 'Card title' }],
  }
  if (eyebrow) framingOut.eyebrow = eyebrow
  if (title) framingOut.title = title
  if (description) framingOut.description = description
  if (callToActions?.length) framingOut.callToActions = callToActions
  if (cardSize) framingOut.cardSize = cardSize

  return framingOut
}

function extractMediaText5050(node: FigmaFileNode): NonNullable<FigmaImportedContent['mediaText5050']> {
  const children = sortByVisualPosition(node.children ?? [])
  const headline =
    pickByNamePatterns(collectTextNodes(node), [/block title|^title$/i, /headline|section heading/i]) ??
    undefined

  const rowRoots = children.filter((c) => ['FRAME', 'INSTANCE', 'GROUP', 'COMPONENT'].includes(c.type))

  const items: { subtitle?: string; body?: string }[] = []

  for (const root of rowRoots) {
    const texts = collectTextNodes(root)
    if (texts.length === 0) continue
    const subtitle =
      pickByNamePatterns(texts, [/subtitle|section title|panel title|heading/i]) ?? texts[0]?.text
    const body =
      pickByNamePatterns(texts, [/body|description|copy|paragraph/i]) ??
      (texts.slice(1).map((t) => t.text).join('\n\n') || undefined)
    if (subtitle || body) {
      items.push({
        ...(subtitle ? { subtitle } : {}),
        ...(body ? { body } : {}),
      })
    }
  }

  if (items.length === 0) {
    const all = collectTextNodes(node)
    if (all.length >= 1) {
      items.push({
        subtitle: all[0].text,
        body: all.slice(1).map((t) => t.text).join('\n\n') || undefined,
      })
    }
  }

  return {
    ...(headline ? { headline } : {}),
    items: items.length > 0 ? items : [{ subtitle: 'Section title', body: 'Body — replace from design.' }],
  }
}

export function extractImportedContentForBlock(
  blockType: FigmaMappedSanityBlockType,
  instanceRoot: FigmaFileNode,
): FigmaImportedContent {
  switch (blockType) {
    case 'hero':
      return { hero: extractHero(instanceRoot) }
    case 'carousel':
      return { carousel: extractCarousel(instanceRoot) }
    case 'mediaText5050':
      return { mediaText5050: extractMediaText5050(instanceRoot) }
    default:
      return {}
  }
}

/**
 * Top-level section roots inside a page FRAME: DotCom BETA instances, sorted top-to-bottom.
 * Unwraps a single full-width wrapper FRAME once if needed.
 */
export function getPageSectionRoots(frame: FigmaFileNode): FigmaFileNode[] {
  let kids = sortByVisualPosition(frame.children ?? [])
  if (
    kids.length === 1 &&
    kids[0].type === 'FRAME' &&
    (kids[0].children?.length ?? 0) >= 1
  ) {
    const inner = sortByVisualPosition(kids[0].children ?? [])
    const looksLikeWrapper = inner.some((c) => c.type === 'INSTANCE' || c.type === 'COMPONENT')
    if (looksLikeWrapper) kids = inner
  }
  return kids.filter((c) => c.type === 'INSTANCE' || c.type === 'COMPONENT')
}

// ---------------------------------------------------------------------------
// Image slot collection — identifies Figma nodes that represent media areas
// ---------------------------------------------------------------------------

export type ImageSlot = {
  nodeId: string
  slotName: string
  blockType: FigmaMappedSanityBlockType
  blockIndex: number
  cardIndex?: number
}

const MIN_IMAGE_AREA = 2000

const MEDIA_NAME_RE = /^(image|media|photo|background|hero image|card image|thumbnail|cover|poster|visual|artwork)$/i

function nodeArea(n: FigmaFileNode): number {
  const b = n.absoluteBoundingBox
  if (!b) return 0
  return (b.width ?? 0) * (b.height ?? 0)
}

/** Count real text nodes (excluding alt text / accessibility labels). */
function countSignificantTextNodes(n: FigmaFileNode): number {
  let count = 0
  function walk(node: FigmaFileNode) {
    if (node.type === 'TEXT' && typeof node.characters === 'string') {
      const name = norm(node.name)
      if (!/alt|alt text|image description|accessibility/i.test(name)) count++
    }
    for (const ch of node.children ?? []) walk(ch)
  }
  walk(n)
  return count
}

/**
 * Find the Figma node that represents the media area within a block or card.
 *
 * Strategy (in priority order):
 * 1. Name match: INSTANCE/FRAME named "Image", "Media", etc. (common in DS libraries)
 * 2. Largest non-text node: any node type with few text descendants and large area
 */
function findMediaNode(root: FigmaFileNode): FigmaFileNode | null {
  let byName: FigmaFileNode | null = null
  let byNameArea = 0
  let bySize: FigmaFileNode | null = null
  let bySizeArea = 0

  function walk(n: FigmaFileNode, isRoot: boolean) {
    if (!isRoot) {
      const a = nodeArea(n)
      if (a >= MIN_IMAGE_AREA) {
        if (MEDIA_NAME_RE.test(n.name.trim())) {
          if (a > byNameArea) { byName = n; byNameArea = a }
        }
        const textCount = countSignificantTextNodes(n)
        if (textCount <= 1 && a > bySizeArea) {
          bySize = n
          bySizeArea = a
        }
      }
    }
    for (const ch of n.children ?? []) walk(ch, false)
  }
  walk(root, true)
  return byName ?? bySize
}

/**
 * For carousel/cardGrid, find the media node inside each card root.
 */
function imageSlotForCard(
  cardRoot: FigmaFileNode,
  blockType: FigmaMappedSanityBlockType,
  blockIndex: number,
  cardIndex: number,
): ImageSlot | null {
  const imgNode = findMediaNode(cardRoot)
  if (!imgNode) return null
  return {
    nodeId: imgNode.id,
    slotName: `${blockType}-${blockIndex}-card-${cardIndex}`,
    blockType,
    blockIndex,
    cardIndex,
  }
}

function collectHeroImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const img = findMediaNode(root)
  if (!img) return []
  return [{ nodeId: img.id, slotName: `hero-${blockIndex}-media`, blockType: 'hero', blockIndex }]
}

function collectCarouselImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const swapSlots = parseCarouselSwapSlots(
    root.componentProperties as Record<string, unknown> | undefined,
  )
  const swapRoots = swapSlots.length > 0 ? resolveCarouselCardRootsFromSwaps(root, swapSlots) : null
  const cardRoots = swapRoots ?? getCarouselCardRoots(root)
  const slots: ImageSlot[] = []
  for (let i = 0; i < cardRoots.length; i++) {
    const slot = imageSlotForCard(cardRoots[i], 'carousel', blockIndex, i)
    if (slot) slots.push(slot)
  }
  return slots
}

function collectCardGridImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const cardRoots = getCarouselCardRoots(root)
  const slots: ImageSlot[] = []
  for (let i = 0; i < cardRoots.length; i++) {
    const slot = imageSlotForCard(cardRoots[i], 'cardGrid', blockIndex, i)
    if (slot) slots.push(slot)
  }
  return slots
}

function collectMediaText5050ImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const img = findMediaNode(root)
  if (!img) return []
  return [{ nodeId: img.id, slotName: `mediaText5050-${blockIndex}-media`, blockType: 'mediaText5050', blockIndex }]
}

function collectMediaTextStackedImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const img = findMediaNode(root)
  if (!img) return []
  return [{ nodeId: img.id, slotName: `mediaTextStacked-${blockIndex}-media`, blockType: 'mediaTextStacked', blockIndex }]
}

function collectMediaTextAsymmetricImageSlots(root: FigmaFileNode, blockIndex: number): ImageSlot[] {
  const img = findMediaNode(root)
  if (!img) return []
  return [{ nodeId: img.id, slotName: `mediaTextAsymmetric-${blockIndex}-media`, blockType: 'mediaTextAsymmetric', blockIndex }]
}

/**
 * Collects all image slots for a given block section root.
 * Each slot represents one media area that should be rendered from Figma.
 */
export function collectImageSlots(
  blockType: FigmaMappedSanityBlockType,
  sectionRoot: FigmaFileNode,
  blockIndex: number,
): ImageSlot[] {
  switch (blockType) {
    case 'hero':
      return collectHeroImageSlots(sectionRoot, blockIndex)
    case 'carousel':
      return collectCarouselImageSlots(sectionRoot, blockIndex)
    case 'cardGrid':
      return collectCardGridImageSlots(sectionRoot, blockIndex)
    case 'mediaText5050':
      return collectMediaText5050ImageSlots(sectionRoot, blockIndex)
    case 'mediaTextStacked':
      return collectMediaTextStackedImageSlots(sectionRoot, blockIndex)
    case 'mediaTextAsymmetric':
      return collectMediaTextAsymmetricImageSlots(sectionRoot, blockIndex)
    case 'proofPoints':
    case 'iconGrid':
      return []
  }
}
