'use client'

import { useEffect, useState } from 'react'
import { Headline } from '@marcelinodzn/ds-react'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap } from '../WidthCap'
import { BlockReveal } from '../BlockReveal'
import { CardRenderer } from './CardRenderer'
import { useGridBreakpoint } from '@design2code/ds'
import { normalizeHeadingLevel, TYPOGRAPHY } from '@design2code/ds'
import type { CardGridBlockProps } from './CardGridBlock.types'

const MAX_ITEMS = 12

export function CardGrid({
  columns,
  interaction = 'information',
  title,
  headingAlignment = 'center',
  items,
  images,
}: CardGridBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const items_ = (items ?? []).filter((i) => i?.title || (i as { image?: string })?.image || (i as { video?: string })?.video || i?.backgroundColor).slice(0, MAX_ITEMS)
  const cell = useCell('L')
  const { columns: gridColumns } = useGridBreakpoint()

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (items_.length === 0) return null

  const colsDesktop = Math.min(columns!, 4)
  const cols =
    gridColumns <= 4 ? 1 : gridColumns <= 8 ? Math.min(2, colsDesktop) : colsDesktop
  const gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`

  return (
    <BlockReveal>
      <Grid as="section">
        <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3xl)' }}>
          {title && (
            <WidthCap contentWidth="L">
              <Headline size="S" weight="high" as={level} align={headingAlignment} style={{ margin: 0, fontSize: TYPOGRAPHY.h2, whiteSpace: 'pre-line' }}>
                {title}
              </Headline>
            </WidthCap>
          )}
          <WidthCap contentWidth="L">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns,
                gap: 'var(--ds-spacing-l)',
                alignItems: 'stretch',
              }}
            >
              {items_.map((item, i) => (
                <CardRenderer
                  key={(item as { _key?: string })._key ?? i}
                  item={item}
                  prefersReducedMotion={prefersReducedMotion}
                  gridColumns={cols}
                  interaction={interaction}
                  imageState={(item as { imageSlot?: string }).imageSlot && images
                    ? images[(item as { imageSlot: string }).imageSlot]
                    : undefined}
                />
              ))}
            </div>
          </WidthCap>
        </div>
      </Grid>
    </BlockReveal>
  )
}

export { CardGrid as CardGridBlock }
