'use client'

/**
 * Text on colour card for grid context.
 * Size: large (title + description only) or small (full card with icon, CTAs, features).
 * When size is large, icon, CTAs, and features are not rendered.
 * backgroundColor: DS theme tokens (primary-minimal, etc.), spectrum shades (reliance.800), or legacy (primary, secondary, tertiary).
 */

import { useRouter } from 'next/navigation'
import { Button, Icon } from '@marcelinodzn/ds-react'
import { useDsContextOptional } from '@design2code/ds'
import { getProofPointIcon } from '@/lib/proof-point-icons'
import { resolveCardBackgroundColor } from '@design2code/ds'
import {
  LAB_TYPOGRAPHY_VARS,
  labCardGridTypography,
  labStyleTextDenseList,
} from '@design2code/ds'

export type TextOnColourCardGridBackground = string

/** Card size from grid context: 1 col = large, 2 cols = medium, 3–4 cols = small. Drives typography scale. */
export type TextOnColourCardGridCardSize = 'large' | 'medium' | 'small'

export type TextOnColourCardGridProps = {
  size?: 'large' | 'small'
  /** Card size from grid columns (1, 2, 3–4 cols). Smaller cards get smaller text. */
  cardSize?: TextOnColourCardGridCardSize
  icon?: string | null
  iconImage?: string | null
  title: string
  description?: string | null
  callToActionButtons?: { _key?: string; label: string; link?: string | null; style?: 'filled' | 'outlined' }[] | null
  features?: string[] | null
  backgroundColor?: TextOnColourCardGridBackground | null
}

/** Legacy and bold DS tokens typically need light text. */
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

export function TextOnColourCardGrid({
  size = 'small',
  cardSize = 'medium',
  icon,
  iconImage,
  title,
  description,
  callToActionButtons,
  features,
  backgroundColor = 'primary',
}: TextOnColourCardGridProps) {
  const router = useRouter()
  const ctx = useDsContextOptional()
  const tokenContext = ctx?.tokenContext
  const bgColor = resolveCardBackgroundColor(backgroundColor ?? 'primary', tokenContext)
  const isDark = isDarkBackground(backgroundColor)
  const isLarge = size === 'large'
  const typography = labCardGridTypography[cardSize]

  const handleCtaPress = (href: string) => {
    if (href?.startsWith('/')) router.push(href)
    else if (href) window.location.href = href
  }

  const IconAsset = !isLarge && icon ? getProofPointIcon(icon) : null
  const CheckIcon = getProofPointIcon('IcCheckboxOn')

  const showIcon = !isLarge && (IconAsset || iconImage)
  const showCtas = !isLarge && callToActionButtons && callToActionButtons.length > 0
  const showFeatures = !isLarge && features && features.length > 0

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 'var(--ds-radius-card-m)',
        padding: isLarge ? 'var(--ds-spacing-3xl)' : 'var(--ds-spacing-2xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: isLarge ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-l)',
        height: '100%',
        color: isDark ? 'white' : 'var(--ds-color-text-high)',
      }}
    >
      {showIcon && (
        <div style={{ flexShrink: 0 }}>
          {iconImage ? (
            <img
              src={typeof iconImage === 'string' ? iconImage : undefined}
              alt=""
              style={{ width: 32, height: 32, objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : undefined }}
            />
          ) : IconAsset ? (
            <Icon
              asset={<IconAsset />}
              size="L"
              appearance={isDark ? 'primary' : 'secondary'}
              attention="high"
              tinted={isDark}
            />
          ) : null}
        </div>
      )}
      <p
        style={{
          margin: 0,
          color: 'inherit',
          fontSize: typography.titleFontSize,
          fontWeight: typography.titleWeight,
          lineHeight: 1.4,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            margin: 0,
            opacity: isDark ? 0.95 : 1,
            color: 'inherit',
            fontSize: typography.descFontSize,
            fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
            lineHeight: 1.5,
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </p>
      )}
      {showCtas && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)' }}>
          {callToActionButtons!.map((cta, i) => (
            <Button
              key={cta._key ?? i}
              appearance={cta.style === 'outlined' ? 'secondary' : 'primary'}
              size="M"
              attention="high"
              onPress={() => cta.link && handleCtaPress(cta.link)}
            >
              {cta.label}
            </Button>
          ))}
        </div>
      )}
      {showFeatures && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
          {features!.map((f, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-s)',
                ...labStyleTextDenseList,
                color: 'inherit',
                opacity: isDark ? 0.95 : 1,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex' }}>
                <Icon asset={<CheckIcon />} size="S" appearance={isDark ? 'primary' : 'secondary'} attention="high" tinted={isDark} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
