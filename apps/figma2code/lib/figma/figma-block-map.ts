/**
 * Maps Figma DotCom Beta block instance names to Sanity `pageBuilder` block `_type`
 * values and optional variant fields. When no variant is parsed or matched, omit
 * variant fields so Sanity schema `initialValue` applies (default variant).
 *
 * Component VARIANT properties are mapped via `variantFieldsFromFigmaComponentProperties`
 * in `figma-block-field-manifest.ts` (property names = Sanity field names).
 */

import type { FigmaMappedSanityBlockType } from './figma-block-types.ts'
import {
  CAROUSEL_CARD_SIZE_OPTIONS,
  CARD_GRID_COLUMNS_OPTIONS,
  HERO_LAYOUT_OPTIONS,
  ICON_GRID_COLUMNS_OPTIONS,
  MEDIA_TEXT_5050_VARIANT_OPTIONS,
  MEDIA_TEXT_ASYMMETRIC_VARIANT_OPTIONS,
  MEDIA_TEXT_STACKED_TEMPLATE_OPTIONS,
  PROOF_POINTS_VARIANT_OPTIONS,
} from './figma-block-field-manifest.ts'
import { matchOptionValue, NORMALISE } from './figma-variant-matching.ts'

/** Prefix on Figma main components / frames for DotCom Beta blocks. */
export const FIGMA_DOTCOM_BETA_BLOCK_PREFIX = 'DotCom Beta - '

export type { FigmaMappedSanityBlockType } from './figma-block-types.ts'
export { variantFieldsFromFigmaComponentProperties } from './figma-block-field-manifest.ts'

/**
 * Normalised Figma / Sanity block titles → `_type`.
 * Keys are lowercase, collapsed whitespace (British “centre” vs “center” tolerated).
 */
const LABEL_TO_TYPE = new Map<string, FigmaMappedSanityBlockType>([
  ['hero', 'hero'],
  ['media + text: stacked', 'mediaTextStacked'],
  ['media + text stacked', 'mediaTextStacked'],
  ['media + text: 50/50', 'mediaText5050'],
  ['media + text 50/50', 'mediaText5050'],
  // Figma Team Library uses “5050” without a slash in component names
  ['media + text: 5050', 'mediaText5050'],
  ['media + text 5050', 'mediaText5050'],
  ['card grid', 'cardGrid'],
  ['carousel', 'carousel'],
  ['proof points', 'proofPoints'],
  ['icon grid', 'iconGrid'],
  ['media + text asymmetric', 'mediaTextAsymmetric'],
  // Sanity `_type` as label (if Figma uses technical name)
  ['mediatextstacked', 'mediaTextStacked'],
  ['mediatext5050', 'mediaText5050'],
  ['cardgrid', 'cardGrid'],
  ['proofpoints', 'proofPoints'],
  ['icongrid', 'iconGrid'],
  ['mediatextasymmetric', 'mediaTextAsymmetric'],
])

const VARIANT_SPLIT_SEPARATORS = [' / ', ' · ', ' | ', ' — ', '\n'] as const

export function stripDotComBetaPrefix(raw: string): string {
  const t = raw.trim()
  const p = FIGMA_DOTCOM_BETA_BLOCK_PREFIX
  if (t.startsWith(p)) return t.slice(p.length).trim()
  // Case-insensitive fallback for hand-typed labels
  const lower = t.toLowerCase()
  const pl = p.toLowerCase()
  if (lower.startsWith(pl)) return t.slice(pl.length).trim()
  return t
}

export function splitBlockLabelAndVariantHint(rest: string): {
  blockLabel: string
  variantHint?: string
} {
  const trimmed = rest.trim()
  for (const sep of VARIANT_SPLIT_SEPARATORS) {
    const i = trimmed.indexOf(sep)
    if (i !== -1) {
      const blockLabel = trimmed.slice(0, i).trim()
      const variantHint = trimmed.slice(i + sep.length).trim()
      if (blockLabel.length > 0 && variantHint.length > 0) {
        return { blockLabel, variantHint }
      }
    }
  }
  return { blockLabel: trimmed }
}

export function parseFigmaBlockInstanceName(raw: string): {
  blockLabel: string
  variantHint?: string
} {
  return splitBlockLabelAndVariantHint(stripDotComBetaPrefix(raw))
}

export function figmaBlockLabelToSanityType(
  blockLabel: string,
): FigmaMappedSanityBlockType | null {
  const key = NORMALISE(blockLabel)
  const direct = LABEL_TO_TYPE.get(key)
  if (direct) return direct
  const noColon = LABEL_TO_TYPE.get(key.replace(/:/g, ''))
  return noColon ?? null
}

/**
 * Returns patch fields for the block object when Figma encodes a variant after ` / ` etc.
 * Empty object when there is no hint or no match — rely on Sanity `initialValue`.
 * Prefer component properties on the instance for layout enums (see manifest).
 */
export function variantFieldsFromFigmaHint(
  _type: FigmaMappedSanityBlockType,
  variantHint: string | undefined,
): Record<string, string | number> {
  if (!variantHint || !variantHint.trim()) return {}
  const hint = variantHint.trim()

  switch (_type) {
    case 'hero': {
      const v = matchOptionValue(hint, HERO_LAYOUT_OPTIONS)
      return v ? { contentLayout: v } : {}
    }
    case 'mediaTextStacked': {
      const v = matchOptionValue(hint, MEDIA_TEXT_STACKED_TEMPLATE_OPTIONS)
      return v ? { template: v } : {}
    }
    case 'proofPoints': {
      const v = matchOptionValue(hint, PROOF_POINTS_VARIANT_OPTIONS)
      return v ? { variant: v } : {}
    }
    case 'mediaText5050': {
      const v = matchOptionValue(hint, MEDIA_TEXT_5050_VARIANT_OPTIONS)
      return v ? { variant: v } : {}
    }
    case 'mediaTextAsymmetric': {
      const v = matchOptionValue(hint, MEDIA_TEXT_ASYMMETRIC_VARIANT_OPTIONS)
      return v ? { variant: v } : {}
    }
    case 'carousel': {
      const v = matchOptionValue(hint, CAROUSEL_CARD_SIZE_OPTIONS)
      return v ? { cardSize: v } : {}
    }
    case 'cardGrid': {
      const v = matchOptionValue(hint, CARD_GRID_COLUMNS_OPTIONS)
      return v ? { columns: v } : {}
    }
    case 'iconGrid': {
      const v = matchOptionValue(hint, ICON_GRID_COLUMNS_OPTIONS)
      return typeof v === 'number' ? { columns: v } : {}
    }
    default:
      return {}
  }
}

/**
 * Resolve a full Figma instance name to `{ _type, …variantFields }` for creating a pageBuilder item.
 * Does not set `_key`; callers should add a stable key when inserting into Sanity.
 */
export function sanityBlockShapeFromFigmaInstanceName(figmaName: string): {
  _type: FigmaMappedSanityBlockType
} & Record<string, string | number> | null {
  const { blockLabel, variantHint } = parseFigmaBlockInstanceName(figmaName)
  const _type = figmaBlockLabelToSanityType(blockLabel)
  if (!_type) return null
  const extra = variantFieldsFromFigmaHint(_type, variantHint)
  return { _type, ...extra }
}
