'use client'

import { Headline, Text, Icon, SurfaceProvider } from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { GridBlock, useGridCell } from '../components/GridBlock'
import { BlockContainer } from './BlockContainer'
import { useCarouselReveal } from '../lib/use-carousel-reveal'
import { getProofPointIcon } from '@/lib/proof-point-icons'
import { getHeadlineSize, getHeadlineFontSizeOneStepDown, getChildLevel, normalizeHeadingLevel, type HeadingLevel } from '../lib/semantic-headline'

const DEFAULT_ICON_NAME = 'IcCheckboxOn'
const MAX_ITEMS = 8

type ProofPointItem = {
  title?: string | null
  description?: string | null
  icon?: string | null
}

type ProofPointsBlockProps = {
  title?: string | null
  titleLevel?: HeadingLevel
  items?: ProofPointItem[] | null
}

function ProofPointCard({ item, itemLevel }: { item: ProofPointItem; itemLevel: HeadingLevel }) {
  const iconName = item.icon || DEFAULT_ICON_NAME
  const IconAsset = getProofPointIcon(iconName)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--ds-spacing-m)',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-xs)' }}>
        <Icon asset={<IconAsset />} size="L" appearance="secondary" attention="high" tinted />
        {item.title && (
          <Headline size={getHeadlineSize(getChildLevel(itemLevel))} weight="high" as={itemLevel} align="center" style={{ margin: 0, fontSize: getHeadlineFontSizeOneStepDown(itemLevel) }}>
            {item.title}
          </Headline>
        )}
      </div>
      {item.description && (
        <Text size="XS" weight="low" color="low" as="p" align="center" style={{ margin: 0, marginTop: 'var(--ds-spacing-m)', whiteSpace: 'pre-line' }}>
          {item.description}
        </Text>
      )}
    </div>
  )
}

export function ProofPointsBlock({ title, titleLevel = 'h2', items }: ProofPointsBlockProps) {
  const level = normalizeHeadingLevel(titleLevel)
  const items_ = (items?.filter((i) => i?.title) ?? []).slice(0, MAX_ITEMS)
  const itemLevel = getChildLevel(level)
  const cell = useGridCell('Wide')
  const { ref, isVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const cardTransition = prefersReducedMotion
    ? 'none'
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)

  if (items_.length === 0) return null

  return (
    <SurfaceProvider level={0}>
      <GridBlock as="section">
        <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)' }}>
          {title && (
            <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
              <Headline
                  size="S"
                  weight="high"
                  as={level}
                  align="center"
                  style={{ margin: 0, fontSize: getHeadlineFontSizeOneStepDown(level) }}
                >
                  {title}
                </Headline>
            </BlockContainer>
          )}
          <BlockContainer contentWidth="Wide" style={{ width: '100%' }}>
            <div
              ref={ref}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gridAutoRows: '1fr',
                gap: 'var(--ds-spacing-2xl)',
                alignItems: 'stretch',
              }}
            >
                {items_.map((item, i) => {
                  const visible = isVisible(i)
                  return (
                    <div
                      key={i}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                        transition: cardTransition,
                      }}
                    >
                      <ProofPointCard item={item} itemLevel={itemLevel} />
                    </div>
                  )
                })}
            </div>
          </BlockContainer>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
