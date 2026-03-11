export type RotatingMediaVariant = 'small' | 'large' | 'combined'

export type RotatingMediaItem = {
  image: string
  title?: string | null
  label?: string | null
}

export type RotatingMediaBlockAccent = 'primary' | 'secondary' | 'neutral'

export type RotatingMediaBlockProps = {
  variant?: RotatingMediaVariant
  items?: RotatingMediaItem[] | null
  surface?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  blockAccent?: RotatingMediaBlockAccent
}
