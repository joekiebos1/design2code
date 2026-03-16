/**
 * DS colour picker options for Sanity.
 * First row: Primary, Secondary, Sparkle × Minimal, Subtle, Bold (theme tokens).
 * Below: Full spectrum from jioColors.json (spectrum.primaryShade).
 */

import {
  colors,
  getVariableByName,
  createTokenContext,
  COLLECTION_NAMES,
  PLATFORM_MODES,
  DENSITY_MODES,
  COLOR_MODE_MODES,
} from '@marcelinodzn/ds-tokens'
import { getJioColor, getPrimaryShade, SPECTRUM_NAMES } from './jio-colors'

export type DsColorPickerValue = string

const DS_CTX = createTokenContext({
  [COLLECTION_NAMES.PLATFORM]: PLATFORM_MODES.DESKTOP_1440,
  [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  [COLLECTION_NAMES.COLOR_MODE]: COLOR_MODE_MODES.LIGHT,
  [COLLECTION_NAMES.THEME]: '↓Pack1',
  [COLLECTION_NAMES.THEME_PACK1]: 'MyJio',
})

function resolveDsToken(appearance: string, variant: string): string | null {
  if (appearance === 'Sparkle') {
    return getVariableByName(`Sparkle/Background/${variant}`, DS_CTX) as string | null
  }
  return colors.appearance(appearance as 'Primary' | 'Secondary', `Background/${variant}`, DS_CTX) as string | null
}

export type ColorPickerOption = {
  value: string
  title: string
  hex: string
}

/** First row: Primary, Secondary, Sparkle × Minimal, Subtle, Bold */
const PRIORITY_OPTIONS: ColorPickerOption[] = (() => {
  const appearances = [
    { key: 'primary', label: 'Primary', ds: 'Primary' as const },
    { key: 'secondary', label: 'Secondary', ds: 'Secondary' as const },
    { key: 'sparkle', label: 'Sparkle', ds: 'Sparkle' as const },
  ]
  const variants = [
    { key: 'minimal', label: 'Minimal' },
    { key: 'subtle', label: 'Subtle' },
    { key: 'bold', label: 'Bold' },
  ]
  const options: ColorPickerOption[] = []
  for (const a of appearances) {
    for (const v of variants) {
      const hex = a.ds === 'Sparkle'
        ? resolveDsToken('Sparkle', v.label)
        : resolveDsToken(a.ds, v.label)
      if (hex) {
        options.push({
          value: `${a.key}-${v.key}`,
          title: `${a.label} ${v.label}`,
          hex,
        })
      }
    }
  }
  return options
})()

/** Full spectrum from jioColors (spectrum.primaryShade) */
const SPECTRUM_OPTIONS: ColorPickerOption[] = SPECTRUM_NAMES.map((spectrum) => {
  const shade = getPrimaryShade(spectrum)
  const value = shade ? `${spectrum}.${shade}` : spectrum
  const hex = getJioColor(value) ?? '#000000'
  const title = spectrum.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { value, title, hex }
})

export const COLOR_PICKER_OPTIONS: ColorPickerOption[] = [...PRIORITY_OPTIONS, ...SPECTRUM_OPTIONS]

export function getColorPickerOption(value: string | null | undefined): ColorPickerOption | undefined {
  if (!value) return undefined
  return COLOR_PICKER_OPTIONS.find((o) => o.value === value)
}
