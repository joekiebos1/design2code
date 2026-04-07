/**
 * Lab-only typography presets — **lab blocks should import from this file** and spread one preset per node
 * (`...labTextPresets.body`, `...labHeadlinePresets.block`, …).
 *
 * - **`Text` / `Headline`:** no `color` (inherit surface / DS defaults) so bold `SurfaceProvider` bands can adjust ink.
 * - **`Display` / `Label`:** keep semantic `color` (DS conventions for hero + eyebrows).
 * - Token overrides (`labStyle*`, plain `<p>`) stay in `block-typography.ts` for edge cases.
 * - Shared framing layout (margins, title font-size) stays in `lib/lab/lab-block-framing-typography.ts`.
 */

export const labTextPresets = {
  body: { size: 'S' as const, weight: 'low' as const },
  bodyLead: { size: 'L' as const, weight: 'low' as const },
  /** Secondary emphasis; still semantic `medium` for hierarchy on default surfaces. */
  bodyMedium: { size: 'M' as const, weight: 'low' as const, color: 'medium' as const },
  subtitle: { size: 'M' as const, weight: 'medium' as const },
  subtitleAlt: { size: 'S' as const, weight: 'medium' as const },
  caption: { size: 'XS' as const, weight: 'low' as const },
  /** Section intro under framing title (carousel, card grid, etc.). */
  framingIntro: { size: 'M' as const, weight: 'low' as const },
} as const

/** Pass `size` in JSX (`L` / `M` / `S` from `getHeadlineSize` or layout). */
export const labHeadlinePresets = {
  block: { weight: 'high' as const },
  blockAlt: { weight: 'medium' as const },
} as const

export const labDisplayPreset = {
  size: 'L' as const,
  color: 'high' as const,
} as const

export const labLabelPreset = {
  size: 'S' as const,
  color: 'medium' as const,
} as const
