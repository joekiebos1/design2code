/**
 * Jio official colours — use ONLY when explicitly instructed.
 *
 * Priority: THEME (DsProvider) → MCP DS (resolve-token) → jioColors.
 * This module is for the fallback case when a specific colour is requested.
 *
 * Use official labels (e.g. "reliance.800"), never hardcoded hex values.
 */

import jioColors from './jioColors.json'

type SpectrumName = keyof Omit<typeof jioColors, 'primary'>
type Shade = keyof (typeof jioColors)[SpectrumName]

const colors = jioColors as {
  primary: Record<string, string>
  [key: string]: Record<string, string> | undefined
}

/**
 * Resolve a colour by official label: "spectrum.shade" (e.g. "reliance.800", "sand.1500").
 * Returns the hex value or null if not found.
 */
export function getJioColor(label: string): string | null {
  const [spectrum, shade] = label.split('.') as [SpectrumName?, string?]
  if (!spectrum || !shade) return null
  const spectrumData = colors[spectrum]
  if (!spectrumData || typeof spectrumData !== 'object') return null
  const hex = (spectrumData as Record<string, string>)[shade]
  return typeof hex === 'string' ? hex : null
}

/**
 * Get the primary shade for a spectrum (from primary mapping).
 * e.g. getPrimaryShade("reliance") → "800"
 */
export function getPrimaryShade(spectrum: string): string | null {
  const primary = colors.primary as Record<string, string>
  return primary[spectrum] ?? null
}

/**
 * Get the primary colour for a spectrum (primary shade's hex).
 * e.g. getPrimaryColor("reliance") → "#6d17ce" (reliance.800)
 */
export function getPrimaryColor(spectrum: string): string | null {
  const shade = getPrimaryShade(spectrum)
  if (!shade) return null
  return getJioColor(`${spectrum}.${shade}`)
}

/** All spectrum names from the JSON (excluding "primary"). */
export const SPECTRUM_NAMES = Object.keys(colors).filter((k) => k !== 'primary') as SpectrumName[]
