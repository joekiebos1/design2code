'use client'

import { useEffect, useState } from 'react'
import { Headline, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../components/GridBlock'
import { BlockContainer } from '../BlockContainer'
import { BlockReveal } from '../BlockReveal'
import {
  MediaCard,
  TextOnColourCard,
  TextOnImageCard,
} from '../../components/Cards'
import { useGridBreakpoint } from '../../lib/use-grid-breakpoint'
import { getHeadlineFontSize, normalizeHeadingLevel } from '../../lib/semantic-headline'
import type { CardGridBlockProps, CardGridItem } from './CardGridBlock.types'

const MAX_ITEMS = 12

function CardGridCard({
  item,
  prefersReducedMotion,
}: {
  item: CardGridItem
  prefersReducedMotion: boolean
}) {
  const { cardStyle, title, description, image, video, ctaText, ctaLink, surface = 'bold' } = item
  const hasImage = image && typeof image === 'string' && image.trim() !== ''

  if (cardStyle === 'text-on-colour') {
    return (
      <TextOnColourCard
        title={title}
        description={description}
        surface={surface}
      />
    )
  }

  if (cardStyle === 'text-on-image' && hasImage) {
    return (
      <TextOnImageCard
        title={title}
        description={description}
        image={image}
        config={{ aspectRatio: '4/5' }}
      />
    )
  }

  // image-above (default): same 4:5 card as Carousel, no light blue background
  return (
    <MediaCard
      title={title}
      description={description}
      image={image}
      video={video}
      link={ctaLink}
      ctaText={ctaText}
      aspectRatio="4:5"
      prefersReducedMotion={prefersReducedMotion}
      config={{ layout: 'compact' }}
    />
  )
}

export function CardGridBlock({
  columns = 3,
  title,
  titleLevel = 'h2',
  items,
}: CardGridBlockProps) {
  const level = normalizeHeadingLevel(titleLevel)
  const items_ = (items ?? []).filter((i) => i?.title || i?.image || i?.video).slice(0, MAX_ITEMS)
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

  const colsDesktop = Math.min(columns, 4)
  const cols =
    gridColumns <= 4 ? 1 : gridColumns <= 8 ? Math.min(2, colsDesktop) : colsDesktop
  const gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`

  return (
    <BlockReveal>
      <SurfaceProvider level={0}>
        <GridBlock as="section">
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xl)' }}>
            {title && (
              <BlockContainer contentWidth="Default">
                <Headline size="S" weight="high" as={level} align="center" style={{ margin: 0, fontSize: getHeadlineFontSize(level) }}>
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
                  <CardGridCard key={i} item={item} prefersReducedMotion={prefersReducedMotion} />
                ))}
              </div>
            </BlockContainer>
          </div>
        </GridBlock>
      </SurfaceProvider>
    </BlockReveal>
  )
}
