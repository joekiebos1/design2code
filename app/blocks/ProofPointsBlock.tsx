'use client'

import { Headline, Text, Icon } from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Grid, useCell } from '../components/blocks/Grid'
import { WidthCap } from './WidthCap'
import { useCarouselReveal } from '../../lib/utils/use-carousel-reveal'
import { useGridBreakpoint } from '../../lib/utils/use-grid-breakpoint'
import { getProofPointIcon } from '@/lib/proof-point-icons'
import {
  getChildLevel,
  normalizeHeadingLevel,
  TYPOGRAPHY,
  type HeadingLevel,
} from '../../lib/utils/semantic-headline'
import type { LabBlockCallToAction } from '../../lib/lab/lab-block-framing-typography'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingDescriptionTextProps,
  labBlockFramingHeadlineProps,
  labBlockFramingIntroStackStyle,
  labBlockFramingTitleStyle,
} from '../../lib/lab/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../lib/lab/has-lab-block-framing'
import { LabBlockFramingCallToActions } from '../lab/components/LabBlockFramingCallToActions'

const DEFAULT_ICON_NAME = 'IcCheckboxOn'
const MAX_ITEMS = 8

type ProofPointItem = {
  title?: string | null
  description?: string | null
  icon?: string | null
}

type ProofPointsBlockEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
type ProofPointsBlockSurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

type ProofPointsBlockVariant = 'icon' | 'stat'

type ProofPointsBlockProps = {
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  variant?: ProofPointsBlockVariant
  emphasis?: ProofPointsBlockEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  surfaceColour?: ProofPointsBlockSurfaceColour
  items?: ProofPointItem[] | null
}

function ProofPointCardIcon({ item, itemLevel }: { item: ProofPointItem; itemLevel: HeadingLevel }) {
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
        <Icon asset={<IconAsset />} size="L" appearance="secondary" tinted />
        {item.title && (
          <Headline size="XS" weight="low" as={itemLevel} align="center" style={{ margin: 0, fontSize: TYPOGRAPHY.labelM, whiteSpace: 'pre-line' }}>
            {item.title}
          </Headline>
        )}
      </div>
      {item.description && (
        <Text size="S" weight="low" color="low" as="p" align="center" style={{ margin: 0, marginTop: 'var(--ds-spacing-m)', whiteSpace: 'pre-line' }}>
          {item.description}
        </Text>
      )}
    </div>
  )
}

function ProofPointStatItem({ item }: { item: ProofPointItem }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--ds-spacing-m)',
        gap: 'var(--ds-spacing-s)',
      }}
    >
      {item.title && (
        <Headline size="L" weight="high" as="h3" align="center" style={{ margin: 0, fontSize: TYPOGRAPHY.h2, whiteSpace: 'pre-line' }}>
          {item.title}
        </Headline>
      )}
      {item.description && (
        <Text size="M" weight="low" color="low" as="p" align="center" style={{ margin: 0, fontSize: TYPOGRAPHY.h5, whiteSpace: 'pre-line' }}>
          {item.description}
        </Text>
      )}
    </div>
  )
}

export function ProofPointsBlock({
  title,
  description,
  callToActions,
  variant,
  items,
}: ProofPointsBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const items_ = (items?.filter((i) => i?.title) ?? []).slice(0, MAX_ITEMS)
  const itemLevel = getChildLevel(level)
  const cell = useCell('XL')
  const { columnWidth, gutter, isMobile, isDesktop } = useGridBreakpoint()
  const { ref, isVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const cardTransition = prefersReducedMotion
    ? 'none'
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)
  const isStat = variant === 'stat'
  const statColumns = isDesktop ? 3 : 1

  if (items_.length === 0) return null

  return (
    <Grid as="section">
      <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3xl)' }}>
        {hasLabBlockFraming(title, description, callToActions) && (
          <WidthCap contentWidth="L">
            <div style={labBlockFramingIntroStackStyle}>
              {title && (
                <Headline
                  size="S"
                  as={level}
                  align="center"
                  {...labBlockFramingHeadlineProps}
                  style={labBlockFramingTitleStyle(isMobile)}
                >
                  {title}
                </Headline>
              )}
              {description && (
                <Text
                  as="p"
                  align="center"
                  {...labBlockFramingDescriptionTextProps}
                  style={labBlockFramingDescriptionStyle}
                >
                  {description}
                </Text>
              )}
              <LabBlockFramingCallToActions actions={callToActions} />
            </div>
          </WidthCap>
        )}
        <WidthCap contentWidth="XL">
          {isStat ? (
            <div
              ref={ref}
              style={{
                display: 'grid',
                gridTemplateColumns: statColumns === 1 ? '1fr' : 'repeat(3, 1fr)',
                alignItems: 'stretch',
                gap: 0,
              }}
            >
              {items_.map((item, i) => {
                const visible = isVisible(i)
                const isLast = i === items_.length - 1
                const showDivider = !isLast && (statColumns === 1 ? false : (i + 1) % statColumns !== 0)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRight: showDivider ? '1px solid var(--ds-color-border-subtle)' : 'none',
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                      transition: cardTransition,
                    }}
                  >
                    <ProofPointStatItem item={item} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              ref={ref}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.round(columnWidth * 2 + gutter)}px), 1fr))`,
                gridAutoRows: '1fr',
                gap: 'var(--ds-spacing-3xl)',
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
                    <ProofPointCardIcon item={item} itemLevel={itemLevel} />
                  </div>
                )
              })}
            </div>
          )}
        </WidthCap>
      </div>
    </Grid>
  )
}
