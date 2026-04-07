/**
 * Maps Figma INSTANCE `componentProperties` to Sanity `pageBuilder` enum fields.
 * Property names in Figma should match Sanity field names (camelCase), e.g. `contentLayout`, `cardSize`.
 * Values match Studio list labels or stored values (see FIGMA_COMPONENT_PROPERTIES.md).
 */

import type { FigmaMappedSanityBlockType } from './figma-block-types.ts'
import { BLOCK_ACCENT_OPTIONS, EMPHASIS_OPTIONS } from '../../src/schemaTypes/shared/blockColourFields.ts'
import { DS_THEMES } from '../../src/schemaTypes/shared/dsThemes.ts'
import {
  collectFigmaStringComponentProperties,
  figmaPropertyKeyMatchesFieldName,
  matchOptionValue,
} from './figma-variant-matching.ts'

/** Single-select enum field: value + Studio label (for Figma variant matching). */
export type FigmaEnumOption = { value: string | number; title: string }

export type FigmaBlockEnumManifest = Record<string, readonly FigmaEnumOption[]>

/** Re-exported for `variantFieldsFromFigmaHint` (instance name suffix). */
export const HERO_LAYOUT_OPTIONS: FigmaEnumOption[] = [
  { value: 'stacked', title: 'stacked' },
  { value: 'sideBySide', title: 'Side by side' },
  { value: 'mediaOverlay', title: 'Media overlay' },
  { value: 'textOnly', title: 'Text only' },
  { value: 'category', title: 'Category' },
]

const HERO_CONTAINER_LAYOUT: FigmaEnumOption[] = [
  { value: 'edgeToEdge', title: 'Edge to edge' },
  { value: 'contained', title: 'Contained' },
]

const HERO_IMAGE_ANCHOR: FigmaEnumOption[] = [
  { value: 'center', title: 'Center' },
  { value: 'bottom', title: 'Top to bottom' },
]

const HERO_TEXT_ALIGN: FigmaEnumOption[] = [
  { value: 'left', title: 'Left' },
  { value: 'center', title: 'Center' },
]

export const MEDIA_TEXT_STACKED_TEMPLATE_OPTIONS: FigmaEnumOption[] = [
  { value: 'textOnly', title: 'Text only' },
  { value: 'stacked', title: 'Stacked – Text above/below image' },
  { value: 'overlay', title: 'Overlay – Text on top of image' },
]

const MEDIA_TEXT_STACKED_MEDIA_SIZE: FigmaEnumOption[] = [
  { value: 'edgeToEdge', title: 'Edge to edge' },
  { value: 'default', title: 'Contained' },
]

const MEDIA_TEXT_STACKED_ALIGNMENT: FigmaEnumOption[] = [
  { value: 'left', title: 'Left' },
  { value: 'center', title: 'Center' },
]

const MEDIA_TEXT_5050_IMAGE_POSITION: FigmaEnumOption[] = [
  { value: 'left', title: 'Image left' },
  { value: 'right', title: 'Image right' },
]

const MEDIA_TEXT_5050_BLOCK_FRAMING_ALIGNMENT: FigmaEnumOption[] = [
  { value: 'left', title: 'Left' },
  { value: 'center', title: 'Centre' },
]

export const MEDIA_TEXT_5050_VARIANT_OPTIONS: FigmaEnumOption[] = [
  { value: 'paragraphs', title: 'Paragraphs – stacked sections' },
  { value: 'accordion', title: 'Accordion – collapsible sections' },
]

const MEDIA_TEXT_5050_PARAGRAPH_COLUMN_LAYOUT: FigmaEnumOption[] = [
  { value: 'single', title: 'Single section (larger type)' },
  { value: 'multi', title: 'Multiple sections (smaller type)' },
]

const MEDIA_TEXT_5050_IMAGE_ASPECT_RATIO: FigmaEnumOption[] = [
  { value: '5:4', title: '5:4' },
  { value: '1:1', title: '1:1' },
  { value: '4:5', title: '4:5' },
]

export const PROOF_POINTS_VARIANT_OPTIONS: FigmaEnumOption[] = [
  { value: 'icon', title: 'Icon (default)' },
  { value: 'stat', title: 'Statistics' },
]

export const MEDIA_TEXT_ASYMMETRIC_VARIANT_OPTIONS: FigmaEnumOption[] = [
  { value: 'textList', title: 'Paragraph rows – title + body + optional link' },
  { value: 'paragraphs', title: 'Paragraphs – optional title, body size, optional link (merged)' },
  { value: 'faq', title: 'FAQ – accordion (question + answer)' },
  { value: 'links', title: 'Links – clickable labels' },
  { value: 'longForm', title: 'Long form – body on the right' },
  { value: 'image', title: 'Image – photo in main column (aspect ratio + rounded corners)' },
]

export const CAROUSEL_CARD_SIZE_OPTIONS: FigmaEnumOption[] = [
  { value: 'compact', title: 'Compact' },
  { value: 'medium', title: 'Medium' },
  { value: 'large', title: 'Large' },
]

export const CARD_GRID_COLUMNS_OPTIONS: FigmaEnumOption[] = [
  { value: '2', title: '2' },
  { value: '3', title: '3' },
  { value: '4', title: '4' },
]

export const ICON_GRID_COLUMNS_OPTIONS: FigmaEnumOption[] = [
  { value: 3, title: '3 columns' },
  { value: 4, title: '4 columns' },
  { value: 5, title: '5 columns' },
  { value: 6, title: '6 columns' },
]

const MINIMAL_BACKGROUND_STYLE: FigmaEnumOption[] = [
  { value: 'block', title: 'Block (solid)' },
  { value: 'gradient', title: 'Gradient (white to minimal)' },
]

/**
 * Per-block Sanity enum fields the Figma importer may set from component VARIANT/TEXT properties.
 * Keys are exact Sanity field names — use these as Figma component property names (camelCase).
 */
export const FIGMA_BLOCK_ENUM_MANIFEST: Record<FigmaMappedSanityBlockType, FigmaBlockEnumManifest> = {
  hero: {
    contentLayout: HERO_LAYOUT_OPTIONS,
    containerLayout: HERO_CONTAINER_LAYOUT,
    imageAnchor: HERO_IMAGE_ANCHOR,
    textAlign: HERO_TEXT_ALIGN,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
  },
  mediaTextStacked: {
    template: MEDIA_TEXT_STACKED_TEMPLATE_OPTIONS,
    mediaSize: MEDIA_TEXT_STACKED_MEDIA_SIZE,
    alignment: MEDIA_TEXT_STACKED_ALIGNMENT,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  mediaText5050: {
    imagePosition: MEDIA_TEXT_5050_IMAGE_POSITION,
    blockFramingAlignment: MEDIA_TEXT_5050_BLOCK_FRAMING_ALIGNMENT,
    variant: MEDIA_TEXT_5050_VARIANT_OPTIONS,
    paragraphColumnLayout: MEDIA_TEXT_5050_PARAGRAPH_COLUMN_LAYOUT,
    imageAspectRatio: MEDIA_TEXT_5050_IMAGE_ASPECT_RATIO,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  mediaTextAsymmetric: {
    variant: MEDIA_TEXT_ASYMMETRIC_VARIANT_OPTIONS,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  cardGrid: {
    columns: CARD_GRID_COLUMNS_OPTIONS,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  carousel: {
    cardSize: CAROUSEL_CARD_SIZE_OPTIONS,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  proofPoints: {
    variant: PROOF_POINTS_VARIANT_OPTIONS,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
  iconGrid: {
    columns: ICON_GRID_COLUMNS_OPTIONS,
    theme: [...DS_THEMES],
    emphasis: [...EMPHASIS_OPTIONS],
    appearance: [...BLOCK_ACCENT_OPTIONS],
    minimalBackgroundStyle: MINIMAL_BACKGROUND_STYLE,
  },
}

function findFieldNameForFigmaKey(
  manifest: FigmaBlockEnumManifest,
  figmaDisplayKey: string,
): string | undefined {
  for (const fieldName of Object.keys(manifest)) {
    if (figmaPropertyKeyMatchesFieldName(figmaDisplayKey, fieldName)) return fieldName
  }
  return undefined
}

/**
 * Maps INSTANCE `componentProperties` from the Figma REST API to Sanity block fields.
 * Property display names must match Sanity field names (spacing/case-insensitive).
 * Later properties override earlier ones for the same field.
 */
export function variantFieldsFromFigmaComponentProperties(
  _type: FigmaMappedSanityBlockType,
  props: Record<string, unknown> | undefined,
): Record<string, string | number> {
  if (!props || typeof props !== 'object') return {}
  const manifest = FIGMA_BLOCK_ENUM_MANIFEST[_type]
  if (!manifest) return {}

  const entries = collectFigmaStringComponentProperties(props)
  if (entries.length === 0) return {}

  const out: Record<string, string | number> = {}

  for (const e of entries) {
    const fieldName = findFieldNameForFigmaKey(manifest, e.displayKey)
    if (!fieldName) continue
    const options = manifest[fieldName]
    const matched = matchOptionValue(e.value, options)
    if (matched !== undefined) out[fieldName] = matched
  }

  return out
}
