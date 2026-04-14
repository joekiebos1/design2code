'use client'

/**
 * Lab CardGrid – same as production but with wrapper fix for text-inside cards.
 * Prevents cards from sticking out of the WidthCap when using colour cards.
 * Promote to production when validated.
 */

import { useEffect, useState } from 'react'
import { Headline, Text } from '@marcelinodzn/ds-react'
import { WidthCap } from '../../production/WidthCap'
import { BlockReveal } from '../../production/BlockReveal'
import { LabCardRenderer } from '../LabCardRenderer'
import { useGridBreakpoint } from '@design2code/ds'
import { normalizeHeadingLevel } from '@design2code/ds'
import { LabBlockFramingCallToActions } from '../../components/LabBlockFramingCallToActions'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingIntroStackStyle,
  labBlockFramingTitleStyle,
} from '../../lab-utils/lab-block-framing-typography'
import type { LabBlockCallToAction } from '../../lab-utils/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../lab-utils/has-lab-block-framing'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
import type { LabCardItem, CardSurface } from '../LabCardRenderer'
import type { BlockInteraction } from '../../production/CardGridBlock/CardGridBlock.types'

export type LabCardGridBlockProps = {
  columns?: 2 | 3 | 4
  interaction?: BlockInteraction
  cardSurface?: CardSurface
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: 'primary' | 'secondary' | 'sparkle' | 'neutral'
  items?: LabCardItem[] | null
  images?: Record<string, import('../../shared/image-slot-state').ImageSlotState>
}

const MAX_ITEMS = 12

export function LabCardGridBlock({
  columns,
  interaction = 'information',
  cardSurface,
  title,
  description,
  callToActions,
  emphasis,
  items,
  images,
}: LabCardGridBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const items_ = (items ?? []).filter((i) => i?.title || (i as { image?: string })?.image || (i as { video?: string })?.video).slice(0, MAX_ITEMS)
  const { columns: gridColumns, isMobile } = useGridBreakpoint()

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
      <section>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--ds-spacing-4xl)',
          }}
        >
          {hasLabBlockFraming(title, description, callToActions) && (
            <WidthCap contentWidth="L">
              <div style={labBlockFramingIntroStackStyle}>
                {title && (
                  <Headline
                    size="S"
                    as={level}
                    align="center"
                    {...labHeadlinePresets.block}
                    style={labBlockFramingTitleStyle(isMobile)}
                  >
                    {title}
                  </Headline>
                )}
                {description && (
                  <Text as="p" align="center" {...labTextPresets.framingIntro} style={labBlockFramingDescriptionStyle}>
                    {description}
                  </Text>
                )}
                <LabBlockFramingCallToActions actions={callToActions} />
              </div>
            </WidthCap>
          )}
          <WidthCap contentWidth="L" style={{ overflow: 'visible' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns,
                gap: 'var(--ds-spacing-l)',
                alignItems: 'stretch',
              }}
            >
              {items_.map((item, i) => (
                <div key={(item as { _key?: string })._key ?? i} style={{ minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                    <LabCardRenderer
                      item={item as import('../LabCardRenderer').LabCardItem}
                      prefersReducedMotion={prefersReducedMotion}
                      gridColumns={cols}
                      context="grid"
                      interaction={interaction}
                      cardSurface={cardSurface}
                      emphasis={emphasis}
                      imageState={(item as { imageSlot?: string }).imageSlot && images
                        ? images[(item as { imageSlot: string }).imageSlot]
                        : undefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          </WidthCap>
        </div>
      </section>
    </BlockReveal>
  )
}
