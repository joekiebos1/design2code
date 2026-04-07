'use client'

import { Icon } from '@marcelinodzn/ds-react'
import { getProofPointIcon } from '../../../lib/proof-point-icons'
import { useDsContextOptional, resolveCardBackgroundColor } from '@design2code/ds'

export type ColourCardVariant = 'feature' | 'icon' | 'text'
export type ColourCardAspectRatio = '4:5' | '1:1' | '4:3'

export type ColourCardProps = {
  variant: ColourCardVariant
  title: string
  description?: string | null
  icon?: string | null
  iconImage?: string | null
  aspectRatio?: ColourCardAspectRatio
  backgroundColor?: string | null
  cardSize?: 'large' | 'medium' | 'small'
}

const ASPECT_MAP: Record<ColourCardAspectRatio, string> = { '4:5': '4/5', '1:1': '1/1', '4:3': '4/3' }

const DARK_BG_VALUES = new Set([
  'primary', 'secondary', 'primary-bold', 'secondary-bold', 'sparkle-bold',
  'reliance.800', 'indigo.600', 'purple.800', 'crimson.800', 'red.1100', 'scarlet.1000',
])

function isDarkBackground(value: string | null | undefined): boolean {
  if (!value) return true
  if (DARK_BG_VALUES.has(value)) return true
  if (value.includes('.') && parseInt(value.split('.')[1], 10) < 1200) return true
  return false
}

const TYPOGRAPHY = {
  feature: {
    large:  { title: 'var(--ds-typography-h2)', desc: 'var(--ds-typography-label-m)' },
    medium: { title: 'var(--ds-typography-h3)', desc: 'var(--ds-typography-label-m)' },
    small:  { title: 'var(--ds-typography-h4)', desc: 'var(--ds-typography-label-s)' },
  },
  icon: {
    large:  { title: 'var(--ds-typography-h4)', desc: 'var(--ds-typography-label-m)' },
    medium: { title: 'var(--ds-typography-h5)', desc: 'var(--ds-typography-label-s)' },
    small:  { title: 'var(--ds-typography-body-l)', desc: 'var(--ds-typography-label-s)' },
  },
  text: {
    large:  { title: 'var(--ds-typography-h4)', desc: 'var(--ds-typography-label-m)' },
    medium: { title: 'var(--ds-typography-h5)', desc: 'var(--ds-typography-label-s)' },
    small:  { title: 'var(--ds-typography-body-l)', desc: 'var(--ds-typography-label-s)' },
  },
} as const

export function ColourCard({
  variant,
  title,
  description,
  icon,
  iconImage,
  aspectRatio = '4:5',
  backgroundColor = 'primary',
  cardSize = 'medium',
}: ColourCardProps) {
  const ctx = useDsContextOptional()
  const tokenContext = ctx?.tokenContext
  const bgColor = resolveCardBackgroundColor(backgroundColor ?? 'primary', tokenContext)
  const isDark = isDarkBackground(backgroundColor)
  const typography = TYPOGRAPHY[variant][cardSize]
  const isFeature = variant === 'feature'

  const IconAsset = variant === 'icon' && icon ? getProofPointIcon(icon) : null

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 'var(--ds-radius-card-m)',
        padding: isFeature ? 'var(--ds-spacing-3xl)' : 'var(--ds-spacing-2xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isFeature ? 'center' : 'flex-start',
        gap: isFeature ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-l)',
        height: '100%',
        aspectRatio: ASPECT_MAP[aspectRatio],
        color: isDark ? 'white' : 'var(--ds-color-text-high)',
        boxSizing: 'border-box',
      }}
    >
      {variant === 'icon' && (IconAsset || iconImage) && (
        <div style={{ flexShrink: 0, opacity: 0.8 }}>
          {iconImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof iconImage === 'string' ? iconImage : undefined} alt="" style={{ width: 47, height: 47, objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : undefined }} />
          ) : IconAsset ? (
            <Icon asset={<IconAsset />} size="XL" appearance={isDark ? 'primary' : 'secondary'} attention="high" tinted={isDark} />
          ) : null}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)', flex: variant === 'icon' ? 1 : undefined, justifyContent: variant === 'icon' ? 'flex-end' : undefined }}>
        <p style={{ margin: 0, fontSize: typography.title, fontWeight: isFeature ? 'var(--ds-typography-weight-high)' : 'var(--ds-typography-weight-medium)', color: 'inherit', lineHeight: isFeature ? 1.1 : 1.3, whiteSpace: 'pre-line' }}>
          {title}
        </p>
        {description && (
          <p style={{ margin: 0, opacity: isDark ? 0.95 : 1, color: 'inherit', fontSize: typography.desc, fontWeight: 'var(--ds-typography-weight-low)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
