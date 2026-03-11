'use client'

import { useEffect, useState } from 'react'
import { Headline } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../components/GridBlock'
import { BlockContainer } from '../BlockContainer'
import { BlockReveal } from '../BlockReveal'
import { CardRenderer } from './CardRenderer'
import { useGridBreakpoint } from '../../lib/use-grid-breakpoint'
import { normalizeHeadingLevel, TYPOGRAPHY } from '../../lib/semantic-headline'
import { BlockSurfaceProvider } from '../../lib/block-surface'
import type { CardGridBlockProps } from './CardGridBlock.types'

const MAX_ITEMS = 12

export function CardGridBlock({
  columns,
  title,
  blockSurface,
  minimalBackgroundStyle,
  blockAccent,
  items,
  images,
}: CardGridBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const items_ = (items ?? []).filter((i) => i?.title || (i as { image?: string })?.image || (i as { video?: string })?.video).slice(0, MAX_ITEMS)
  const cell = useGridCell('Default')
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
      <BlockSurfaceProvider blockSurface={blockSurface} blockAccent={blockAccent} minimalBackgroundStyle={minimalBackgroundStyle} fullWidth>
        <GridBlock as="section">
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xl)' }}>
            {title && (
              <BlockContainer contentWidth="Default">
                <Headline size="S" weight="high" as={level} align="center" style={{ margin: 0, fontSize: TYPOGRAPHY.h2, whiteSpace: 'pre-line' }}>
                  {title}
                </Headline>
              </BlockContainer>
            )}
            <BlockContainer contentWidth="Default">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns,
                  gap: 'var(--ds-spacing-2xl)',
                  alignItems: 'stretch',
                }}
              >
                {items_.map((item, i) => (
                  <CardRenderer
                    key={(item as { _key?: string })._key ?? i}
                    item={item}
                    prefersReducedMotion={prefersReducedMotion}
                    imageState={(item as { imageSlot?: string }).imageSlot && images
                      ? images[(item as { imageSlot: string }).imageSlot]
                      : undefined}
                  />
                ))}
              </div>
            </BlockContainer>
          </div>
        </GridBlock>
      </BlockSurfaceProvider>
    </BlockReveal>
  )
}
