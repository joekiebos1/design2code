import type { LabBlockCallToAction } from '../../lab-utils/lab-block-framing-typography'

export type RotatingMediaVariant = 'small' | 'large' | 'combined'

export type RotatingMediaItem = {
  image: string
  title?: string | null
  label?: string | null
}

export type RotatingMediaBlockAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use RotatingMediaBlockAppearance */
export type RotatingMediaBlockSurfaceColour = RotatingMediaBlockAppearance

export type RotatingMediaBlockProps = {
  variant?: RotatingMediaVariant
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  items?: RotatingMediaItem[] | null
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  appearance?: RotatingMediaBlockAppearance
}
