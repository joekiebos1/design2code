export type LabProofPointItem = {
  title?: string | null
  description?: string | null
  icon?: string | null
}

export type ProofPointsBlockEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'

export type ProofPointsBlockAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type ProofPointsBlockVariant = 'icon' | 'stat'

export type ProofPointsBlockProps = {
  title?: string | null
  description?: string | null
  callToActions?: { label: string; link?: string | null; style?: 'filled' | 'outlined' | null }[] | null
  variant?: ProofPointsBlockVariant
  emphasis?: ProofPointsBlockEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: ProofPointsBlockAppearance
  items?: LabProofPointItem[] | null
}
