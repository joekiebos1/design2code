import type { LabBlockCallToAction } from '../../../../lib/lab/lab-block-framing-typography'

export type RotatingMediaVariant = 'small' | 'large' | 'combined'

export type RotatingMediaItem = {
  image: string
  title?: string | null
  label?: string | null
}

export type RotatingMediaBlockSurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type RotatingMediaBlockProps = {
  variant?: RotatingMediaVariant
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  items?: RotatingMediaItem[] | null
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  surfaceColour?: RotatingMediaBlockSurfaceColour
}
