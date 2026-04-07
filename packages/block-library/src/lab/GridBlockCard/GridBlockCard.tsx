'use client'

/**
 * Lab: GridCard – Section with centred heading and grid of coloured cards.
 *
 * Cards have icon, title, description, CTAs, and feature list with checkmarks.
 * Uses Grid for layout. Card backgrounds: primary (purple), secondary (orange), tertiary (teal).
 */

import { useRouter } from 'next/navigation'
import { Headline, Text, Button, Icon } from '@marcelinodzn/ds-react'
import { Grid, useCell } from '../../components/blocks/Grid'
import { BlockSurfaceProvider } from '@design2code/ds'
import { getProofPointIcon } from '../../lib/proof-point-icons'
import { labPlainBodyStyle, labStyleTextDenseList } from '@design2code/ds'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
type CardBackgroundColor = 'primary' | 'secondary' | 'tertiary'

type CTAButton = {
  _key?: string
  label: string
  link?: string | null
  style?: 'filled' | 'outlined'
}

type GridCardItem = {
  _key?: string
  backgroundColor?: CardBackgroundColor | null
  icon?: string | null
  iconImage?: string | null
  title: string
  description?: string | null
  callToActionButtons?: CTAButton[] | null
  features?: string[] | null
}

type GridCardProps = {
  sectionTitle?: string | null
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  appearance?: 'primary' | 'secondary' | 'sparkle' | 'neutral'
  cards?: GridCardItem[] | null
}

const CARD_BG_MAP: Record<CardBackgroundColor, string> = {
  primary: 'var(--ds-color-block-background-bold)',
  secondary: 'var(--ds-color-surface-secondary)',
  tertiary: 'var(--ds-color-card-tertiary)',
}

const CheckIcon = getProofPointIcon('IcCheckboxOn')

function GridCardItemCard({ card }: { card: GridCardItem }) {
  const router = useRouter()
  const bg = (card.backgroundColor ?? 'primary') as CardBackgroundColor
  const bgColor = CARD_BG_MAP[bg] ?? CARD_BG_MAP.primary
  const isDark = bg === 'primary' || bg === 'secondary'

  const handleCtaPress = (href: string) => {
    if (href?.startsWith('/')) router.push(href)
    else if (href) window.location.href = href
  }

  const IconAsset = card.icon ? getProofPointIcon(card.icon) : null

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 'var(--ds-radius-card-m)',
        padding: 'var(--ds-spacing-2xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-l)',
        height: '100%',
        color: isDark ? 'white' : 'var(--ds-color-text-high)',
      }}
    >
      {(IconAsset || card.iconImage) && (
        <div style={{ flexShrink: 0 }}>
          {card.iconImage ? (
            <img
              src={card.iconImage}
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
      <Text as="h3" {...labTextPresets.subtitle} style={{ margin: 0, color: 'inherit' }}>
        {card.title}
      </Text>
      {card.description && (
        <Text
          as="p"
          size={labTextPresets.body.size}
          weight={labTextPresets.body.weight}
          style={{
            ...labPlainBodyStyle(isDark ? { color: 'inherit' } : {}),
            margin: 0,
            opacity: isDark ? 0.95 : 1,
          }}
        >
          {card.description}
        </Text>
      )}
      {card.callToActionButtons && card.callToActionButtons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)' }}>
          {card.callToActionButtons.map((cta, i) => (
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
      {card.features && card.features.length > 0 && (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-s)',
          }}
        >
          {card.features.map((f, i) => (
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
                <Icon
                  asset={<CheckIcon />}
                  size="S"
                  appearance={isDark ? 'primary' : 'secondary'}
                  attention="high"
                  tinted={isDark}
                />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function GridCard({
  sectionTitle,
  emphasis = 'ghost',
  appearance = 'primary',
  cards = [],
}: GridCardProps) {
  const cell = useCell('XL')
  const cards_ = cards?.filter((c) => c?.title) ?? []

  if (cards_.length === 0) return null

  return (
    <BlockSurfaceProvider emphasis={emphasis} appearance={appearance} fullWidth>
      <Grid as="section">
        <div
          style={{
            ...cell,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2xl)',
            paddingBlock: 'var(--ds-spacing-2xl)',
          }}
        >
          {sectionTitle && (
            <Headline size="M" as="h2" align="center" {...labHeadlinePresets.block} style={{ margin: 0 }}>
              {sectionTitle}
            </Headline>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--ds-spacing-2xl)',
            }}
          >
            {cards_.map((card, i) => (
              <GridCardItemCard key={card._key ?? i} card={card} />
            ))}
          </div>
        </div>
      </Grid>
    </BlockSurfaceProvider>
  )
}
