/**
 * IconGridBlock – Production block types.
 * Grid of icons with title and optional body. Supports block surface (ghost, minimal, subtle, bold).
 */

import type { LabBlockCallToAction } from '../../lab-utils/lab-block-framing-typography'

export type IconGridAccentColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'positive'
  | 'neutral'

export type IconGridSpectrum =
  | 'indigo'
  | 'sky'
  | 'pink'
  | 'gold'
  | 'red'
  | 'purple'
  | 'mint'
  | 'violet'
  | 'marigold'
  | 'green'
  | 'crimson'
  | 'orange'

export type IconGridItem = {
  title: string
  body?: string | null
  icon: string
  accentColor: IconGridAccentColor
  spectrum?: IconGridSpectrum | null
}

export type IconGridBlockEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type IconGridBlockAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use IconGridBlockAppearance */
export type IconGridBlockSurfaceColour = IconGridBlockAppearance

export type IconGridBlockProps = {
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  items: IconGridItem[]
  columns?: 3 | 4 | 5 | 6
  emphasis?: IconGridBlockEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: IconGridBlockAppearance
}
