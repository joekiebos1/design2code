import { defineField } from 'sanity'

/** Block appearance options: Primary, Secondary, Sparkle, Neutral (band / surface colour theme). Aligned with Figma. */
export const BLOCK_ACCENT_OPTIONS = [
  { value: 'primary', title: 'Primary' },
  { value: 'secondary', title: 'Secondary' },
  { value: 'sparkle', title: 'Sparkle' },
  { value: 'neutral', title: 'Neutral' },
] as const

/** Emphasis options: ghost, minimal, subtle, bold (block background strength). */
export const EMPHASIS_OPTIONS = [
  { value: 'ghost', title: 'Ghost (no background)' },
  { value: 'minimal', title: 'Minimal' },
  { value: 'subtle', title: 'Subtle' },
  { value: 'bold', title: 'Bold' },
] as const

/**
 * Appearance field — block-level colour theme (Primary, Secondary, Sparkle, Neutral).
 * Field name: `appearance`. GROQ uses coalesce(appearance, surfaceColour) until legacy documents are migrated.
 */
export function appearanceField(options?: { hidden?: (ctx: { parent?: unknown }) => boolean }) {
  return defineField({
    name: 'appearance',
    type: 'string',
    title: 'Appearance',
    description: 'Primary = brand, Secondary = brand secondary, Sparkle = accent, Neutral = grey.',
    options: {
      list: [...BLOCK_ACCENT_OPTIONS],
      layout: 'radio',
    },
    initialValue: 'primary',
    hidden: options?.hidden,
  })
}

/** @deprecated Use appearanceField — same field; name was surfaceColour before Figma alignment. */
export const surfaceColourField = appearanceField

/**
 * Emphasis field. Choose ghost, minimal, subtle, or bold (block background strength).
 * Field name: emphasis.
 */
export function emphasisField(options?: {
  initialValue?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  hidden?: (ctx: { parent?: unknown }) => boolean
}) {
  return defineField({
    name: 'emphasis',
    type: 'string',
    title: 'Emphasis',
    description:
      'Ghost = no background. Minimal = light tint, Subtle = medium tint, Bold = strong tint. Colour comes from Appearance.',
    options: {
      list: [...EMPHASIS_OPTIONS],
      layout: 'radio',
    },
    initialValue: options?.initialValue ?? 'ghost',
    hidden: options?.hidden,
  })
}
