/**
 * IconGridBlock – Production block types.
 * Grid of icons with title and optional body. Supports block surface (ghost, minimal, subtle, bold).
 */

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

export type IconGridBlockSurface = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type IconGridBlockAccent = 'primary' | 'secondary' | 'neutral'

export type IconGridBlockProps = {
  items: IconGridItem[]
  columns?: 3 | 4 | 5 | 6
  blockSurface?: IconGridBlockSurface
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  blockAccent?: IconGridBlockAccent
}
