'use client'

/**
 * Resolve card background colour for text-on-colour cards.
 * Supports:
 * - DS theme tokens: primary-minimal, primary-subtle, primary-bold, secondary-minimal, etc., sparkle-minimal, etc.
 * - Spectrum shades: reliance.800, indigo.600, etc. (from jioColors)
 * - Legacy: primary, secondary, tertiary (maps to CSS vars)
 */

import { colors, getVariableByName, createTokenContext } from '@marcelinodzn/ds-tokens'
import {
  COLLECTION_NAMES,
  PLATFORM_MODES,
  DENSITY_MODES,
  COLOR_MODE_MODES,
} from '@marcelinodzn/ds-tokens'
import { getJioColor } from '../colors/jio-colors'

const LEGACY_BG_MAP: Record<string, string> = {
  primary: 'var(--ds-color-block-background-bold)',
  secondary: 'var(--ds-color-surface-secondary)',
  tertiary: 'var(--ds-color-card-tertiary)',
}

const DS_VARIANT_MAP: Record<string, string> = {
  minimal: 'Background/Minimal',
  subtle: 'Background/Subtle',
  bold: 'Background/Bold',
}

const DEFAULT_CTX = createTokenContext({
  [COLLECTION_NAMES.PLATFORM]: PLATFORM_MODES.DESKTOP_1440,
  [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  [COLLECTION_NAMES.COLOR_MODE]: COLOR_MODE_MODES.LIGHT,
  [COLLECTION_NAMES.THEME]: '↓Pack1',
  [COLLECTION_NAMES.THEME_PACK1]: 'MyJio',
})

/**
 * Resolve background colour. Use tokenContext from useDsContext() for theme-aware DS tokens.
 */
export function resolveCardBackgroundColor(
  value: string | null | undefined,
  tokenContext: Record<string, string> | undefined
): string {
  if (!value) return LEGACY_BG_MAP.primary

  // Legacy: primary, secondary, tertiary
  const legacy = LEGACY_BG_MAP[value]
  if (legacy) return legacy

  // Spectrum: spectrum.shade (e.g. reliance.800)
  if (value.includes('.')) {
    const hex = getJioColor(value)
    if (hex) return hex
  }

  // DS theme token: primary-minimal, secondary-subtle, sparkle-bold, etc.
  const [appearance, variant] = value.split('-')
  if (appearance && variant && DS_VARIANT_MAP[variant]) {
    const dsAppearance = appearance.charAt(0).toUpperCase() + appearance.slice(1)
    const resolved = dsAppearance === 'Sparkle'
      ? getVariableByName(`Sparkle/Background/${variant.charAt(0).toUpperCase() + variant.slice(1)}`, tokenContext ?? DEFAULT_CTX)
      : colors.appearance(dsAppearance as 'Primary' | 'Secondary', DS_VARIANT_MAP[variant], tokenContext ?? DEFAULT_CTX)
    if (resolved != null) return String(resolved)
  }

  return LEGACY_BG_MAP.primary
}
