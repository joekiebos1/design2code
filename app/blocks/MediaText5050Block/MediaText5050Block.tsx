'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import {
  Headline,
  Text,
  Icon,
  Button,
  IcChevronDown,
  IcChevronUp,
  SurfaceProvider,
} from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Collapsible } from '@base-ui/react/collapsible'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap, type ContentWidth } from '../WidthCap'
import { useGridBreakpoint } from '../../../lib/utils/use-grid-breakpoint'
import { VideoWithControls } from '../../components/blocks/VideoWithControls'
import { StreamImage } from '../../components/blocks/StreamImage'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '../../../lib/utils/block-surface'
import { EDGE_TO_EDGE_BREAKOUT } from '../../../lib/utils/edge-to-edge'
import type {
  MediaText5050AccordionRow,
  MediaText5050BlockProps,
  MediaText5050Item,
  MediaText5050Media,
} from './MediaText5050Block.types'
import {
  labStyleHeadlineAltDefault,
  labStyleHeadlineAltProminent,
} from '../../../lib/typography/block-typography'
import { labHeadlinePresets, labTextPresets } from '../../../lib/typography/lab-typography-presets'
import { LabBlockFramingCallToActions } from '../../lab/components/LabBlockFramingCallToActions'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingIntroStackStyle,
  labBlockFramingTitleStyle,
  labBlockFramingToContentGap,
} from '../../../lib/lab/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../../lib/lab/has-lab-block-framing'

const ASPECT_RATIOS: Record<string, string> = {
  '5:4': '5 / 4',
  '1:1': '1 / 1',
  '4:5': '4 / 5',
};

function AccordionItem({
  item,
  isLast,
  open,
  onOpenChange,
  prefersReducedMotion,
  titleContentWidth,
  bodyContentWidth,
  widthCapSideStyle,
}: {
  item: MediaText5050Item
  isLast: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  prefersReducedMotion: boolean
  titleContentWidth: ContentWidth
  bodyContentWidth: ContentWidth
  widthCapSideStyle?: CSSProperties
}) {
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const panelTransition = prefersReducedMotion ? undefined : createTransition('height', 'l', 'transition', motionLevel)
  return (
    <Collapsible.Root open={open} onOpenChange={onOpenChange}>
      <div
        style={{
          borderBottom: isLast ? undefined : '1px solid var(--ds-color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 'var(--ds-spacing-m)',
            padding: 'var(--ds-spacing-m) 0',
            minHeight: 'var(--ds-spacing-2xl)',
          }}
        >
          <WidthCap
            contentWidth={titleContentWidth}
            style={{ flex: 1, minWidth: 0, width: '100%', ...widthCapSideStyle }}
          >
            <Collapsible.Trigger
              render={(props) => (
                <button
                  type="button"
                  {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  {item.subtitle && (
                    <Headline
                      size="S"
                      as="h3"
                      {...labHeadlinePresets.blockAlt}
                      style={{
                        margin: 0,
                        width: '100%',
                        whiteSpace: 'pre-line',
                        ...labStyleHeadlineAltDefault,
                      }}
                    >
                      {item.subtitle}
                    </Headline>
                  )}
                </button>
              )}
            />
          </WidthCap>
          <Collapsible.Trigger
            render={(props, state) => {
              const { onClick, ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>
              return (
                <Button
                  single
                  appearance="auto"
                  contained={false}
                  attention="high"
                  size="M"
                  aria-label={state?.open ? 'Collapse' : 'Expand'}
                  {...rest}
                  onPress={(e: unknown) =>
                    onClick?.(e as React.MouseEvent<HTMLButtonElement>)
                  }
                  content={
                    <Icon
                      asset={state?.open ? <IcChevronUp /> : <IcChevronDown />}
                      size="S"
                      appearance="secondary"
                    />
                  }
                />
              )
            }}
          />
        </div>
        <Collapsible.Panel
          keepMounted={!prefersReducedMotion}
          style={{
            paddingBottom: 'var(--ds-spacing-m)',
            overflow: 'hidden',
            transition: panelTransition,
          }}
        >
          {item.body ? (
            <WidthCap contentWidth={bodyContentWidth} style={widthCapSideStyle}>
              <Text as="p" {...labTextPresets.body} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                {item.body}
              </Text>
            </WidthCap>
          ) : null}
        </Collapsible.Panel>
      </div>
    </Collapsible.Root>
  )
}

export function MediaText5050Block({
  variant,
  paragraphColumnLayout,
  imagePosition = 'right',
  emphasis,
  minimalBackgroundStyle,
  surfaceColour,
  spacingTop: _spacingTop,
  spacingBottom: _spacingBottom,
  headline,
  description,
  callToActions,
  blockFramingAlignment = 'left',
  items = [],
  singleSubtitle,
  singleBody,
  accordionItems,
  media,
  imageSlot,
  imageState,
}: MediaText5050BlockProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  /** `null` = all panels closed; media column falls back to first panel’s asset. */
  const [accordionOpenIndex, setAccordionOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const accordionRows: MediaText5050AccordionRow[] =
    variant === 'accordion' ? (accordionItems ?? []) : []
  const mediaIndexForAccordion =
    variant === 'accordion' && accordionRows.length > 0
      ? accordionOpenIndex !== null && accordionOpenIndex >= 0 && accordionOpenIndex < accordionRows.length
        ? accordionOpenIndex
        : 0
      : 0
  const rowMediaForDisplay =
    variant === 'accordion' && accordionRows.length > 0
      ? accordionRows[mediaIndexForAccordion]?.media
      : undefined
  /** Open row’s media, else legacy block-level media for old `mediaText5050` accordion. */
  const displayMedia: MediaText5050Media | undefined =
    variant === 'accordion' ? (rowMediaForDisplay ?? media) : media

  const hasMedia = Boolean(displayMedia?.src && displayMedia.src.trim() !== '')
  const mediaFirst = imagePosition === 'left'
  const surfaceProps = getSurfaceProviderProps(emphasis)
  const { isStacked, isMobile } = useGridBreakpoint()

  const aspectRatio = displayMedia?.aspectRatio ? ASPECT_RATIOS[displayMedia.aspectRatio] : undefined
  const isVideo = displayMedia?.type === 'video'
  const useStreamImage =
    variant === 'paragraphs' &&
    Boolean(imageState && imageSlot && displayMedia?.type === 'image' && displayMedia === media)

  const mediaContent =
    hasMedia &&
    displayMedia &&
    (() => {
      if (isVideo) {
        return (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              overflow: 'hidden',
              borderRadius: 'var(--ds-radius-card-m)',
            }}
          >
            <VideoWithControls
              src={displayMedia.src}
              poster={displayMedia.poster}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        )
      }

      if (useStreamImage) {
        return (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              overflow: 'hidden',
              borderRadius: 'var(--ds-radius-card-m)',
            }}
          >
            <StreamImage
              slot={imageSlot!}
              imageState={imageState!}
              aspectRatio={aspectRatio ? aspectRatio.replace(/\s/g, '') : undefined}
            />
          </div>
        )
      }

      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio,
            overflow: 'hidden',
            borderRadius: 'var(--ds-radius-card-m)',
          }}
        >
          <Image
            src={displayMedia.src}
            alt={displayMedia.alt ?? ''}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )
    })()

  /** Side-by-side: gutter between columns matches page grid; text inset toward gutter (aligned with production). */
  const INNER_COLUMN_GAP = 'var(--ds-grid-gutter)'
  const TEXT_COLUMN_INSET = 'var(--ds-spacing-3xl)'
  const textColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-spacing-m)',
    alignItems: blockFramingAlignment === 'center' ? 'center' : 'flex-start',
    minWidth: 0,
    ...(!isStacked &&
      (mediaFirst
        ? { paddingLeft: TEXT_COLUMN_INSET }
        : { paddingRight: TEXT_COLUMN_INSET })),
  }

  const bgColor = useBlockBackgroundColor(emphasis, surfaceColour)
  const useGradient = emphasis === 'minimal' && minimalBackgroundStyle === 'gradient'
  const background = bgColor
    ? useGradient
      ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
      : bgColor
    : undefined

  const blockBgWrapper = (children: React.ReactNode) =>
    background ? (
      <div
        style={{
          ...EDGE_TO_EDGE_BREAKOUT,
          background,
          paddingBlockStart: 'var(--ds-spacing-4xl)',
          paddingBlockEnd: 'var(--ds-spacing-4xl)',
          minHeight: 1,
        }}
      >
        {children}
      </div>
    ) : (
      children
    )

  /** Paragraphs · single: flat Sanity fields; · multi: `items` list. */
  const useSingleParagraphColumn = variant === 'paragraphs' && paragraphColumnLayout === 'single'
  const paragraphItemGap = 'var(--ds-spacing-m)'
  const showBlockFraming = hasLabBlockFraming(headline, description, callToActions)
  const framingTextAlign = blockFramingAlignment === 'center' ? 'center' : 'left'
  /** Match production MediaTextBlock: centre = M title / XS body; left = L / L (stacked with media). */
  const framingTitleContentWidth: ContentWidth = framingTextAlign === 'center' ? 'M' : 'L'
  const framingBodyContentWidth: ContentWidth = framingTextAlign === 'center' ? 'XS' : 'L'
  const framingWidthCapSideStyle: React.CSSProperties | undefined =
    framingTextAlign === 'center' ? undefined : { marginInline: 0 as const }
  const framingStackStyle: React.CSSProperties = {
    ...labBlockFramingIntroStackStyle,
    alignItems: framingTextAlign === 'center' ? 'center' : 'flex-start',
    textAlign: framingTextAlign,
  }
  const framingTitleStyleMerged: React.CSSProperties = {
    ...labBlockFramingTitleStyle(isMobile),
    textAlign: framingTextAlign,
  }
  const framingDescriptionStyleMerged: React.CSSProperties = {
    ...labBlockFramingDescriptionStyle,
    textAlign: framingTextAlign,
  }
  const hasFramingBodyBand = Boolean(description) || Boolean(callToActions && callToActions.length > 0)
  const blockFramingIntro = showBlockFraming ? (
    <div style={framingStackStyle}>
      {headline ? (
        <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
          <Headline
            size="M"
            as="h2"
            {...labHeadlinePresets.block}
            style={{ ...framingTitleStyleMerged, width: '100%' }}
          >
            {headline}
          </Headline>
        </WidthCap>
      ) : null}
      {hasFramingBodyBand ? (
        <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-m)',
              alignItems: framingTextAlign === 'center' ? 'center' : 'flex-start',
              width: '100%',
            }}
          >
            {description ? (
              <Text
                as="p"
                {...labTextPresets.framingIntro}
                size="S"
                weight="low"
                style={framingDescriptionStyleMerged}
              >
                {description}
              </Text>
            ) : null}
            <LabBlockFramingCallToActions
              actions={callToActions}
              align={blockFramingAlignment === 'center' ? 'center' : 'left'}
            />
          </div>
        </WidthCap>
      ) : null}
    </div>
  ) : null

  const paragraphsContent = useSingleParagraphColumn ? (
    <div style={textColumnStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: paragraphItemGap,
          width: '100%',
        }}
      >
        {singleSubtitle ? (
          <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
            <Headline
              size="M"
              as="h2"
              {...labHeadlinePresets.blockAlt}
            style={{
              margin: 0,
              width: '100%',
              whiteSpace: 'pre-line',
              ...labStyleHeadlineAltProminent,
            }}
            >
              {singleSubtitle}
            </Headline>
          </WidthCap>
        ) : null}
        {singleBody ? (
          <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
            <Text as="p" {...labTextPresets.bodyLead} style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {singleBody}
            </Text>
          </WidthCap>
        ) : null}
      </div>
    </div>
  ) : (
    <div style={textColumnStyle}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: paragraphItemGap,
            paddingTop: i > 0 ? 'var(--ds-spacing-m)' : undefined,
            paddingBottom: i < items.length - 1 ? 'var(--ds-spacing-m)' : undefined,
            borderBottom:
              i < items.length - 1 ? '1px solid var(--ds-color-border-subtle)' : undefined,
            width: '100%',
          }}
        >
          {item.subtitle ? (
            <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
              <Headline
                size="M"
                as="h3"
                {...labHeadlinePresets.blockAlt}
                style={{
                  margin: 0,
                  width: '100%',
                  whiteSpace: 'pre-line',
                  ...labStyleHeadlineAltDefault,
                }}
              >
                {item.subtitle}
              </Headline>
            </WidthCap>
          ) : null}
          {item.body ? (
            <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
              <Text as="p" {...labTextPresets.body} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                {item.body}
              </Text>
            </WidthCap>
          ) : null}
        </div>
      ))}
    </div>
  )

  /** Variant 2: Accordion – items as collapsible (subtitle = header, body = content). */
  const accordionContent = (
    <div style={{ ...textColumnStyle, gap: 0 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          alignItems: 'stretch',
          minWidth: 0,
          width: '100%',
        }}
      >
        {accordionRows.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isLast={i === accordionRows.length - 1}
            open={accordionOpenIndex === i}
            onOpenChange={(open) => setAccordionOpenIndex(open ? i : null)}
            prefersReducedMotion={prefersReducedMotion}
            titleContentWidth={framingTitleContentWidth}
            bodyContentWidth={framingBodyContentWidth}
            widthCapSideStyle={framingWidthCapSideStyle}
          />
        ))}
      </div>
    </div>
  )

  const textContentByVariant = {
    paragraphs: paragraphsContent,
    accordion: accordionContent,
  }

  const textContent = textContentByVariant[variant]

  const textOnlyCell = useCell('L')

  /** Inner 50/50 grid – single cell in page grid, inner grid for layout control. Vertically centered. */
  const innerGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: INNER_COLUMN_GAP,
    alignItems: 'center',
    minWidth: 0,
  }

  /** Stacked: WidthCap only. Side-by-side: Grid + cell + inner 50/50 grid. */
  const stackedContent = !hasMedia ? (
    <Grid as="section">
      <div style={{ ...textOnlyCell, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {blockFramingIntro != null ? (
          <div style={{ marginBottom: labBlockFramingToContentGap, width: '100%' }}>{blockFramingIntro}</div>
        ) : null}
        {textContent}
      </div>
    </Grid>
  ) : isStacked ? (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3xl)' }}>
      {blockFramingIntro != null ? (
        <WidthCap
          contentWidth="L"
          style={blockFramingAlignment === 'left' ? { marginInline: 0 } : undefined}
        >
          <div style={{ width: '100%' }}>{blockFramingIntro}</div>
        </WidthCap>
      ) : null}
      {mediaFirst ? (
        <>
          <WidthCap contentWidth="XL">
            <div style={{ position: 'relative', minWidth: 0 }}>{mediaContent}</div>
          </WidthCap>
          <WidthCap contentWidth="L">
            <div style={textColumnStyle}>{textContent}</div>
          </WidthCap>
        </>
      ) : (
        <>
          <WidthCap contentWidth="L">
            <div style={textColumnStyle}>{textContent}</div>
          </WidthCap>
          <WidthCap contentWidth="XL">
            <div style={{ position: 'relative', minWidth: 0 }}>{mediaContent}</div>
          </WidthCap>
        </>
      )}
    </section>
  ) : (
    <Grid as="section">
      <div style={{ ...textOnlyCell, minWidth: 0 }}>
        {blockFramingIntro != null ? (
          <div style={{ marginBottom: labBlockFramingToContentGap, width: '100%' }}>{blockFramingIntro}</div>
        ) : null}
        <div style={innerGridStyle}>
          {mediaFirst ? (
            <>
              <div style={{ position: 'relative', minWidth: 0 }}>{mediaContent}</div>
              <div style={{ ...textColumnStyle, minWidth: 0 }}>{textContent}</div>
            </>
          ) : (
            <>
              <div style={{ ...textColumnStyle, minWidth: 0 }}>{textContent}</div>
              <div style={{ position: 'relative', minWidth: 0 }}>{mediaContent}</div>
            </>
          )}
        </div>
      </div>
    </Grid>
  )

  return blockBgWrapper(
    <SurfaceProvider {...surfaceProps}>{stackedContent}</SurfaceProvider>
  )
}
