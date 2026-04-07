'use client'

import type { CSSProperties } from 'react'
import { Headline, Text, Icon, SurfaceProvider } from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Grid, useCell } from '../../components/blocks/Grid'
import { useCarouselReveal, getSurfaceProviderProps, useGridBreakpoint } from '@design2code/ds'
import { getProofPointIcon } from '../../lib/proof-point-icons'
import { normalizeHeadingLevel, type HeadingLevel } from '@design2code/ds'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
import { LabBlockFramingCallToActions } from '../../components/LabBlockFramingCallToActions'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingIntroStackStyle,
} from '../../lab-utils/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../lab-utils/has-lab-block-framing'
import type { LabProofPointsBlockProps, LabProofPointItem } from './LabProofPointsBlock.types'

const DEFAULT_ICON_NAME = 'IcCheckboxOn'
const MAX_ITEMS = 8

function proofPointLineText(item: LabProofPointItem): string {
  return (item.title ?? '').trim()
}

function CompactProofIconRow({
  item,
  transitionStyle,
}: {
  item: LabProofPointItem
  transitionStyle: CSSProperties
}) {
  const iconName = item.icon ? item.icon : DEFAULT_ICON_NAME
  const IconAsset = item.icon ? getProofPointIcon(iconName) : null
  const title = proofPointLineText(item)
  const description = (item.description ?? '').trim()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: IconAsset ? 'center' : 'flex-start',
        gap: 'var(--ds-spacing-l)',
        ...transitionStyle,
      }}
    >
      {IconAsset && (
        <span style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>
          <Icon asset={<IconAsset />} size="L" attention="medium" tinted />
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xs)', flex: 1, minWidth: 0 }}>
        <Text as="p" size="M" weight="medium" color="medium" align="left" style={{ margin: 0 }}>
          {title}
        </Text>
        {description && (
          <Text as="p" size="S" weight="low" color="low" align="left" style={{ margin: 0 }}>
            {description}
          </Text>
        )}
      </div>
    </div>
  )
}

function CompactProofStatRow({
  item,
  isLast,
  transitionStyle,
}: {
  item: LabProofPointItem
  isLast: boolean
  transitionStyle: CSSProperties
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3xs)',
        paddingBlock: 'var(--ds-spacing-s)',
        borderBottom: isLast ? undefined : '1px solid var(--ds-color-border-subtle)',
        ...transitionStyle,
      }}
    >
      {item.title && (
        <Headline size="S" weight="high" as="h3" align="left" style={{ margin: 0, whiteSpace: 'pre-line' }}>
          {item.title}
        </Headline>
      )}
      {item.description && (
        <Text size="S" weight="low" color="low" as="p" align="left" style={{ margin: 0, whiteSpace: 'pre-line' }}>
          {item.description}
        </Text>
      )}
    </div>
  )
}

function FramingColumn({
  title,
  description,
  callToActions,
  level,
}: {
  title?: string | null
  description?: string | null
  callToActions: LabProofPointsBlockProps['callToActions']
  level: HeadingLevel
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-m)',
      }}
    >
      {title && (
        <Headline
          size="L"
          as={level}
          align="left"
          {...labHeadlinePresets.block}
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
            maxWidth: '100%',
          }}
        >
          {title}
        </Headline>
      )}
      {description && (
        <Text
          as="p"
          align="left"
          {...labTextPresets.framingIntro}
          color="low"
          style={labBlockFramingDescriptionStyle}
        >
          {description}
        </Text>
      )}
      <LabBlockFramingCallToActions actions={callToActions} align="left" />
    </div>
  )
}

export function LabProofPointsBlock({
  title,
  description,
  callToActions,
  variant,
  emphasis,
  items,
}: LabProofPointsBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const items_ = (items?.filter((i) => i?.title) ?? []).slice(0, MAX_ITEMS)
  const cell = useCell('L')
  const { isMobile } = useGridBreakpoint()
  const { ref, isVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const cardTransition: CSSProperties = prefersReducedMotion
    ? { transition: 'none' }
    : {
        transition: createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel),
      }
  const isStat = variant === 'stat'
  const surfaceProps = getSurfaceProviderProps(emphasis)
  const hasFraming = hasLabBlockFraming(title, description, callToActions)

  if (items_.length === 0) return null

  const itemTransition = (i: number): CSSProperties => ({
    opacity: isVisible(i) ? 1 : 0,
    transform: isVisible(i) ? 'translateY(0)' : 'translateY(var(--ds-spacing-m))',
    ...cardTransition,
  })

  const listColumnStyle: CSSProperties = {
    paddingLeft: 'var(--ds-spacing-4xl)',
    minWidth: 0,
  }

  const framingColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--ds-spacing-m)',
    minWidth: 0,
  }

  const mainGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: hasFraming && !isMobile ? '1fr 1fr' : '1fr',
    alignItems: 'start',
    gap: hasFraming && !isMobile ? 'var(--ds-spacing-2xl)' : 'var(--ds-spacing-l)',
  }

  const itemsSection = isStat ? (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        width: '100%',
      }}
    >
      {items_.map((item, i) => (
        <CompactProofStatRow key={i} item={item} isLast={i === items_.length - 1} transitionStyle={itemTransition(i)} />
      ))}
    </div>
  ) : (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-l)',
        width: '100%',
      }}
    >
      {items_.map((item, i) => (
        <CompactProofIconRow
          key={i}
          item={item}
          transitionStyle={itemTransition(i)}
        />
      ))}
    </div>
  )

  return (
    <SurfaceProvider {...surfaceProps}>
      <Grid as="section">
        <div
          style={{
            ...cell,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-xl)',
          }}
        >
          <div style={mainGridStyle}>
            {hasFraming && (
              <div style={framingColumnStyle}>
                <FramingColumn
                  title={title}
                  description={description}
                  callToActions={callToActions}
                  level={level}
                />
              </div>
            )}
            <div style={listColumnStyle}>
              {itemsSection}
            </div>
          </div>
        </div>
      </Grid>
    </SurfaceProvider>
  )
}
