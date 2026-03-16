'use client'

/**
 * LabIconGrid – Lab block.
 * Grid of icons with title and optional body. Icons from DS.
 * Column count (3–6) derived from item count; responsive on smaller screens.
 */

import { Headline, Text, Icon } from '@marcelinodzn/ds-react'
import { Grid, useCell } from '../../../components/blocks/Grid'
import { useGridBreakpoint } from '../../../../lib/utils/use-grid-breakpoint'
import { getPrimaryColor } from '../../../../lib/colors/jio-colors'
import { getIconGridIcon } from './icon-grid-icons'
import type { IconGridItem, IconGridAccentColor, IconGridBlockProps } from './IconGridBlock.types'

const ACCENT_COLOR_MAP: Record<IconGridAccentColor, string> = {
  primary: 'var(--ds-color-block-background-bold)',
  secondary: 'var(--ds-color-surface-secondary)',
  tertiary: 'var(--ds-color-card-tertiary)',
  positive: 'var(--ds-color-positive-bold, var(--ds-color-block-background-bold))',
  neutral: 'var(--ds-color-neutral-bold)',
}

function getIconBackgroundColor(item: IconGridItem): string {
  if (item.spectrum) {
    const hex = getPrimaryColor(item.spectrum)
    if (hex) return hex
  }
  const accentColor = (item.accentColor ?? 'primary') as IconGridAccentColor
  return ACCENT_COLOR_MAP[accentColor] ?? ACCENT_COLOR_MAP.primary
}

/**
 * Derives optimal column count (3–6) for n items.
 * Minimizes rows first, then waste. Responsive: caps at grid breakpoint.
 */
function deriveColumns(itemCount: number, explicit?: 3 | 4 | 5 | 6): 3 | 4 | 5 | 6 {
  if (explicit != null) return explicit
  if (itemCount <= 0) return 3
  let best = 3 as 3 | 4 | 5 | 6
  let bestScore = Infinity
  for (const cols of [3, 4, 5, 6] as const) {
    const rows = Math.ceil(itemCount / cols)
    const waste = rows * cols - itemCount
    const score = rows * 1000 + waste
    if (score < bestScore) {
      bestScore = score
      best = cols
    }
  }
  return best
}

function IconGridCard({ item }: { item: IconGridItem }) {
  const IconAsset = getIconGridIcon(item.icon)
  const bgColor = getIconBackgroundColor(item)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--ds-spacing-m)',
      }}
    >
      <div
        style={{
          width: 'var(--ds-spacing-4xl)',
          height: 'var(--ds-spacing-4xl)',
          borderRadius: 'var(--ds-radius-full)',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          asset={<IconAsset />}
          size="L"
          appearance="primary"
          attention="on-contrasting"
        />
      </div>
      <Headline
        size="XS"
        weight="low"
        as="h3"
        align="center"
        style={{
          margin: 0,
          fontSize: 'var(--ds-typography-label-m)',
          color: 'var(--ds-color-text-high)',
          whiteSpace: 'pre-line',
        }}
      >
        {item.title}
      </Headline>
      {item.body && (
        <Text
          size="S"
          weight="low"
          color="low"
          as="p"
          align="center"
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {item.body}
        </Text>
      )}
    </div>
  )
}

export function LabIconGridBlock({ items, columns }: IconGridBlockProps) {
  const { columns: gridColumns } = useGridBreakpoint()
  const items_ = (items ?? []).filter((i) => i?.title).slice(0, 20)
  const cols = deriveColumns(items_.length, columns)

  const colsResponsive =
    gridColumns <= 4 ? 2 : gridColumns <= 8 ? Math.min(3, cols) : 6
  const gridTemplateColumns = `repeat(${colsResponsive}, minmax(0, 1fr))`

  if (items_.length === 0) return null

  const cell = useCell('Wide')

  return (
    <Grid as="section">
      <div
        style={{
          ...cell,
          display: 'grid',
          gridTemplateColumns,
          gap: 'var(--ds-spacing-2xl)',
          alignItems: 'stretch',
        }}
      >
        {items_.map((item, i) => (
          <IconGridCard key={i} item={item} />
        ))}
      </div>
    </Grid>
  )
}
