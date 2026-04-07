import type { LabBlockCallToAction } from '../../lab-utils/lab-block-framing-typography'

export type LabProofPointItem = {
  title?: string | null
  description?: string | null
  icon?: string | null
}

export type LabProofPointsBlockEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'

export type LabProofPointsBlockAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type LabProofPointsBlockVariant = 'icon' | 'stat'

export type LabProofPointsBlockProps = {
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  variant?: LabProofPointsBlockVariant
  emphasis?: LabProofPointsBlockEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: LabProofPointsBlockAppearance
  items?: LabProofPointItem[] | null
}
