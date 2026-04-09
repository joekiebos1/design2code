/**
 * DS colour picker options for Sanity.
 * First row: Primary, Secondary, Sparkle × Minimal, Subtle, Bold — swatches from
 * official jioColours labels (reliance / gold / violet) so Studio does not need
 * `@marcelinodzn/ds-tokens` at build time. Values are the same semantic keys as before.
 * Below: Full spectrum from jioColors.json (spectrum.primaryShade).
 */

import { getJioColor, getPrimaryShade, SPECTRUM_NAMES } from './jio-colors'

export type DsColorPickerValue = string

export type ColorPickerOption = {
  value: string
  title: string
  hex: string
}

/** Official jioColours labels approximating Primary / Secondary / Sparkle surface ramps. */
const PRIORITY_SPECS = [
  { value: 'primary-minimal', title: 'Primary Minimal', jioLabel: 'reliance.2500' },
  { value: 'primary-subtle', title: 'Primary Subtle', jioLabel: 'reliance.2300' },
  { value: 'primary-bold', title: 'Primary Bold', jioLabel: 'reliance.800' },
  { value: 'secondary-minimal', title: 'Secondary Minimal', jioLabel: 'gold.2500' },
  { value: 'secondary-subtle', title: 'Secondary Subtle', jioLabel: 'gold.2300' },
  { value: 'secondary-bold', title: 'Secondary Bold', jioLabel: 'gold.1600' },
  { value: 'sparkle-minimal', title: 'Sparkle Minimal', jioLabel: 'violet.2500' },
  { value: 'sparkle-subtle', title: 'Sparkle Subtle', jioLabel: 'violet.2300' },
  { value: 'sparkle-bold', title: 'Sparkle Bold', jioLabel: 'violet.1200' },
] as const

/** First row: Primary, Secondary, Sparkle × Minimal, Subtle, Bold */
const PRIORITY_OPTIONS: ColorPickerOption[] = PRIORITY_SPECS.map((spec) => ({
  value: spec.value,
  title: spec.title,
  hex: getJioColor(spec.jioLabel) ?? '#000000',
}))

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
