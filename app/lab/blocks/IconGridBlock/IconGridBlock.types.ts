/**
 * IconGridBlock – Lab block types.
 * White rounded cards with circular coloured icon, title, optional body.
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

export type IconGridBlockProps = {
  items: IconGridItem[]
  columns?: 3 | 4 | 5 | 6
}
