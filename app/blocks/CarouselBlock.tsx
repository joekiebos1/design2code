'use client'

/**
 * CarouselBlock — responsive carousel (promoted from lab).
 * Breakpoint-based card widths, nav below on mobile/tablet, side on desktop (large).
 * Cards overflow visible in the track; title and track are sibling WidthCaps with 3xl gap.
 */

import { useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Text, Button, Icon, IcChevronLeft, IcChevronRight } from '@marcelinodzn/ds-react'
import { getHeadlineSize, normalizeHeadingLevel, TYPOGRAPHY } from '../../lib/utils/semantic-headline'
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
import { useGridBreakpoint, getBreakpointName } from '../../lib/utils/use-grid-breakpoint'
import { Grid, useCell } from '../components/blocks/Grid'
import { WidthCap } from './WidthCap'
import { useCarouselReveal } from '../../lib/utils/use-carousel-reveal'
import { MediaCard, TextOnColourCard } from '../components/blocks/Cards'

type CarouselItem = {
  cardType?: 'media' | 'text-on-colour' | null
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
  link?: string | null
  ctaText?: string | null
  aspectRatio?: '4:5' | '8:5' | '2:1'
  imageSlot?: string
}

type CarouselCardSize = 'compact' | 'medium' | 'large'

type CarouselEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'

type CarouselAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

type CarouselBlockProps = {
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  cardSize?: CarouselCardSize
  emphasis?: CarouselEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: CarouselAppearance
  items?: CarouselItem[] | null
  images?: Record<string, { url: string; alt: string; source: 'database' | 'generated'; ready: boolean }>
}

const GAP_MOBILE = 'var(--ds-spacing-m)'
const GAP_DESKTOP = 'var(--ds-spacing-l)'
const CAROUSEL_FADED_OPACITY = 0.25

/** Subpixel / rounding tolerance for scroll bounds and “next/prev changes position?”. */
const SCROLL_EPS = 2

const CARD_WIDTH_MOBILE_PX = 280
const CARD_WIDTH_COMPACT_TABLET_PX = 360
const CARD_WIDTH_MEDIUM_TABLET_PX = 550

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

type CarouselConfig = {
  breakpoint: Breakpoint
  cols: number
  buttonsPlacement: 'side' | 'bottom'
  outerContentWidth: 'L' | 'XL'
  gap: string
  useFixedCardWidth: boolean
  getCardWidthCss: (slots: number) => string
  getImageHeight4_5: () => string
  getImageHeight8_5?: () => string
  getSlots: (ratio?: '4:5' | '8:5' | '2:1') => number
  getEffectiveAspectRatio: (ratio?: '4:5' | '8:5' | '2:1') => '4:5' | '8:5' | '2:1'
}

function getCarouselConfig(
  cardSize: CarouselCardSize,
  columns: number,
  gridValues: { columnWidth: number; gutter: number },
): CarouselConfig {
  const breakpoint: Breakpoint = getBreakpointName(columns)
  const spanDefault = columns === 12 ? 10 : columns === 8 ? 6 : 4
  const defaultPx = spanDefault * gridValues.columnWidth + (spanDefault - 1) * gridValues.gutter

  if (breakpoint === 'mobile') {
    const cardPx = CARD_WIDTH_MOBILE_PX
    const g = gridValues.gutter
    const isLarge = cardSize === 'large'
    const largeCardWidthCss = `calc(100cqw - 2 * ${GAP_MOBILE})`
    return {
      breakpoint: 'mobile',
      cols: 1,
      buttonsPlacement: 'bottom',
      outerContentWidth: 'L',
      gap: isLarge ? GAP_MOBILE : GAP_MOBILE,
      useFixedCardWidth: !isLarge,
      getCardWidthCss: (slots) =>
        isLarge ? largeCardWidthCss : slots === 1 ? `${cardPx}px` : `${cardPx * 2 + g}px`,
      getImageHeight4_5: () =>
        isLarge ? `calc(${largeCardWidthCss} * 5 / 4)` : `${cardPx * (5 / 4)}px`,
      getSlots: () => 1,
      getEffectiveAspectRatio: () => '4:5',
    }
  }

  if (breakpoint === 'tablet') {
    const compactPx = CARD_WIDTH_COMPACT_TABLET_PX
    const mediumPx = CARD_WIDTH_MEDIUM_TABLET_PX
    const largePx = defaultPx
    const cardPx = cardSize === 'compact' ? compactPx : cardSize === 'medium' ? mediumPx : largePx
    const cols = cardSize === 'large' ? 1 : 2
    const g = gridValues.gutter
    const isMedium = cardSize === 'medium'
    return {
      breakpoint: 'tablet',
      cols,
      buttonsPlacement: 'bottom',
      outerContentWidth: 'L',
      gap: GAP_MOBILE,
      useFixedCardWidth: true,
      getCardWidthCss: (slots) => (slots === 1 ? `${cardPx}px` : `${cardPx * 2 + g}px`),
      getImageHeight4_5: () => `${cardPx * (5 / 4)}px`,
      getSlots: (ratio) => (isMedium ? 1 : ratio === '8:5' ? 2 : 1),
      getEffectiveAspectRatio: (ratio) =>
        isMedium ? '4:5' : ratio === '2:1' ? '4:5' : ratio ?? '4:5',
    }
  }

  const cols = cardSize === 'compact' ? 3 : cardSize === 'medium' ? 2 : 1
  const gapCount = Math.max(0, cols - 1)
  const colWidthCss = `calc((100cqw - ${gapCount} * ${GAP_DESKTOP}) / ${cols})`
  const isCompact = cardSize === 'compact'
  const isMedium = cardSize === 'medium'
  const isLarge = cardSize === 'large'
  return {
    breakpoint: 'desktop',
    cols,
    buttonsPlacement: isLarge ? 'side' : 'bottom',
    outerContentWidth: isLarge ? 'XL' : 'L',
    gap: GAP_DESKTOP,
    useFixedCardWidth: false,
    getCardWidthCss: (slots) =>
      cols === 1 ? '100cqw' : slots === 1 ? colWidthCss : `calc(${colWidthCss} * 2 + ${GAP_DESKTOP})`,
    getImageHeight4_5: () => (cols === 1 ? 'auto' : `calc(${colWidthCss} * 5 / 4)`),
    ...(isCompact && { getImageHeight8_5: () => `calc(${colWidthCss} * 5 / 4)` }),
    getSlots: (ratio) =>
      isLarge ? 1 : isMedium ? 1 : isCompact && ratio === '8:5' ? 2 : 1,
    getEffectiveAspectRatio: (ratio) =>
      isLarge ? '2:1' : isMedium ? '4:5' : ratio === '2:1' ? '4:5' : ratio ?? '4:5',
  }
}

function NavButton({
  direction,
  disabled,
  onPress,
  size = 'S',
  surface = 'ghost',
}: {
  direction: 'left' | 'right'
  disabled: boolean
  onPress: () => void
  size?: 'XS' | 'S' | 'M'
  surface?: 'ghost' | 'minimal' | 'subtle' | 'bold'
}) {
  const iconSize = size === 'XS' ? 'S' : size === 'S' ? 'M' : 'L'
  const hasBackground = surface === 'minimal' || surface === 'subtle' || surface === 'bold'
  return (
    <Button
      single
      appearance="primary"
      attention={hasBackground ? 'high' : undefined}
      size={size}
      aria-label={direction === 'left' ? 'Previous cards' : 'Next cards'}
      onPress={onPress}
      isDisabled={disabled}
      content={
        direction === 'left' ? (
          <Icon asset={<IcChevronLeft />} size={iconSize} appearance="secondary" tinted />
        ) : (
          <Icon asset={<IcChevronRight />} size={iconSize} appearance="secondary" tinted />
        )
      }
    />
  )
}

/** Large layout: extended track for infinite-style wrap (n≥3 lab buffer; n=2 production-style clone). */
function buildLargeDisplayItems(items: CarouselItem[]): CarouselItem[] {
  const n = items.length
  if (n === 0) return []
  if (n === 1) return items
  if (n === 2) return [items[1]!, items[0]!, items[1]!, items[0]!]
  return [items[n - 1]!, ...items, items[0]!, items[1]!]
}

export function CarouselBlock({
  title,
  description,
  callToActions,
  cardSize = 'medium',
  emphasis = 'ghost',
  items,
  images,
}: CarouselBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const { columns, contentMaxL, columnWidth, gutter, isMobile, isTablet, isDesktop } = useGridBreakpoint()

  const config = cardSize ? getCarouselConfig(cardSize, columns, { columnWidth, gutter }) : undefined
  if (!config || !cardSize) return null

  const trackRef = useRef<HTMLDivElement>(null)
  const cardAreaRef = useRef<HTMLDivElement>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [isWrapping, setIsWrapping] = useState(false)
  const [stepPx, setStepPx] = useState(0)
  const [maxScrollPx, setMaxScrollPx] = useState(0)
  const [viewportWidthPx, setViewportWidthPx] = useState(0)
  const [trackGapPx, setTrackGapPx] = useState(0)
  const [centerOffsetPx, setCenterOffsetPx] = useState(0)
  const [cumulativeScrollPx, setCumulativeScrollPx] = useState<number[]>([])

  const items_ = items?.filter((i) => i?.title || i?.image || i?.video) ?? []
  const isLargeLayout = cardSize === 'large'
  const capScrollAtGrid = cardSize === 'compact' || cardSize === 'medium'

  const largeN = items_.length
  const largeDisplayItems = isLargeLayout ? buildLargeDisplayItems(items_) : []
  const [largeCenterIndex, setLargeCenterIndex] = useState(0)
  useEffect(() => {
    if (isLargeLayout && largeN > 0) setLargeCenterIndex(0)
  }, [isLargeLayout, largeN])
  const displayItems = isLargeLayout ? largeDisplayItems : items_

  const { ref: revealRef, containerVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  if (items_.length === 0) return null

  const pageIdx = isLargeLayout ? largeCenterIndex : pageIndex

  /** Clamped scroll if card `p` is aligned to the leading edge (compact/medium). */
  const scrollTargetForPage = (p: number) =>
    Math.min(cumulativeScrollPx[p] ?? p * stepPx, maxScrollPx)

  const capScrollPos = capScrollAtGrid
    ? scrollTargetForPage(pageIndex)
    : Math.max(0, (largeCenterIndex + 1) * stepPx)
  const scrollPosition = capScrollAtGrid
    ? Math.min(capScrollPos, maxScrollPx)
    : capScrollPos

  useEffect(() => {
    const track = trackRef.current
    const cardArea = cardAreaRef.current
    if (!track || !cardArea) return
    const measure = () => {
      const gapPx = parseFloat(getComputedStyle(track).gap) || 0
      const first = track.children[0] as HTMLElement | undefined
      if (first) setStepPx(first.offsetWidth + gapPx)
      if (capScrollAtGrid) {
        setTrackGapPx(Number.isFinite(gapPx) ? gapPx : 0)
        const cum: number[] = [0]
        const gap = Number.isFinite(gapPx) ? gapPx : 0
        const n = track.children.length
        for (let i = 0; i < n; i++) {
          const el = track.children[i] as HTMLElement
          cum.push(cum[i] + el.offsetWidth + (i < n - 1 ? gap : 0))
        }
        setCumulativeScrollPx(cum)
        const trackWidth = track.scrollWidth
        const viewportWidth = cardArea.clientWidth || cardArea.offsetWidth
        setViewportWidthPx(viewportWidth)
        const maxScroll = (cum[n] ?? trackWidth) - viewportWidth
        setMaxScrollPx(Math.max(0, maxScroll))
      } else {
        setCumulativeScrollPx([])
        const trackWidth = track.scrollWidth
        const viewportWidth = cardArea.clientWidth || cardArea.offsetWidth
        if (isLargeLayout && first) {
          const cardWidth = first.offsetWidth
          setCenterOffsetPx(Math.max(0, (viewportWidth - cardWidth) / 2))
        }
        setMaxScrollPx(Math.max(0, trackWidth - viewportWidth))
      }
    }
    measure()
    const rafId = requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    ro.observe(cardArea)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [items_.length, config.cols, capScrollAtGrid, isLargeLayout])

  useEffect(() => {
    if (!capScrollAtGrid) return
    setPageIndex((p) => Math.min(p, Math.max(0, items_.length - 1)))
  }, [items_.length, capScrollAtGrid])

  const handleLargeTransitionEnd = (e: React.TransitionEvent) => {
    if (!isLargeLayout || e.target !== e.currentTarget) return
    if (largeN < 3) return
    if (largeCenterIndex === largeN) {
      setIsWrapping(true)
      setLargeCenterIndex(0)
    } else if (largeCenterIndex === -1) {
      setIsWrapping(true)
      setLargeCenterIndex(largeN - 1)
    }
  }

  useEffect(() => {
    if (!isWrapping) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsWrapping(false))
    })
    return () => cancelAnimationFrame(id)
  }, [isWrapping])

  const canScrollLeft = isLargeLayout
    ? true
    : capScrollAtGrid
      ? scrollPosition > SCROLL_EPS
      : pageIndex > 0
  const canScrollRight = isLargeLayout
    ? true
    : capScrollAtGrid
      ? scrollPosition < maxScrollPx - SCROLL_EPS
      : pageIndex < items_.length - 1

  const scroll = (dir: 'left' | 'right') => {
    if (capScrollAtGrid) {
      if (dir === 'right') {
        setPageIndex((p) => {
          const cur = scrollTargetForPage(p)
          for (let q = p + 1; q < items_.length; q++) {
            const nxt = scrollTargetForPage(q)
            if (nxt > cur + SCROLL_EPS) return q
          }
          return p
        })
      } else {
        setPageIndex((p) => {
          const cur = scrollTargetForPage(p)
          for (let q = p - 1; q >= 0; q--) {
            const prv = scrollTargetForPage(q)
            if (prv < cur - SCROLL_EPS) return q
          }
          return p
        })
      }
    } else {
      setLargeCenterIndex((i) => (dir === 'right' ? i + 1 : i - 1))
    }
  }

  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  /**
   * Which slide indices count as “in view” for opacity, video pause, and controls.
   * Compact (cols === 3): pixel overlap only — mixed 4:5 / 8:5 widths; an index window (three
   * consecutive cards) is not the same as three cards in the viewport. Last card: right edge is
   * cum[n] with no trailing gap; do not subtract trackGapPx.
   */
  const isCardInView = (i: number) => {
    const pageRange = i >= pageIdx && i < pageIdx + config.cols
    if (config.cols === 3 && cumulativeScrollPx.length > i + 1 && viewportWidthPx > 0) {
      const numCards = cumulativeScrollPx.length - 1
      const cardLeft = cumulativeScrollPx[i]
      const cardRight =
        i === numCards - 1
          ? cumulativeScrollPx[i + 1]
          : cumulativeScrollPx[i + 1] - trackGapPx
      const vpLeft = scrollPosition
      const vpRight = scrollPosition + viewportWidthPx
      return cardLeft < vpRight && cardRight > vpLeft
    }
    if (config.cols === 3) {
      return false
    }
    return pageRange
  }

  const titleTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)
  const cardTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)
  const fadeTransition = prefersReducedMotion
    ? undefined
    : createTransition('opacity', 'xl', 'transition', motionLevel)

  const buttonMediaCenterOffset =
    config.cols === 1
      ? `calc(${contentMaxL} / 4 - ${config.gap})`
      : config.cols === 2
        ? `calc((${contentMaxL} - ${config.gap}) * 5 / 16 - ${config.gap})`
        : `calc((${contentMaxL} - 2 * ${config.gap}) * 5 / 24 - ${config.gap})`

  const noFade = isMobile || isTablet
  const buttonGap = isMobile ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-l)'
  const navButtonSize =
    isLargeLayout && config.buttonsPlacement === 'bottom' ? 'M' : isMobile ? 'S' : 'M'

  const effectiveCardLayout =
    config.cols === 1 ? (cardSize === 'large' ? 'large' : 'medium') : config.cols === 2 ? 'medium' : 'compact'

  const trackStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: config.gap,
    width: 'max-content',
    minWidth: 0,
    transform: `translateX(-${scrollPosition}px)`,
    transition:
      isWrapping || prefersReducedMotion
        ? 'none'
        : createTransition('transform', 'l', 'transition', motionLevel),
    ...(isLargeLayout &&
      centerOffsetPx > 0 && {
        paddingLeft: centerOffsetPx,
        paddingRight: centerOffsetPx,
      }),
  }

  const cardAreaStyle: CSSProperties = {
    width: config.useFixedCardWidth ? '100%' : contentMaxL,
    maxWidth: contentMaxL,
    minWidth: 0,
    containerType: config.useFixedCardWidth ? undefined : 'inline-size',
    marginInline: 'auto',
    overflow: 'visible',
  }

  const cellContainer = useCell(config.outerContentWidth === 'XL' ? 'XL' : 'L')

  return (
    <Grid as="section">
      <div
        ref={revealRef}
        style={{
          ...cellContainer,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 'var(--ds-spacing-3xl)',
          width: '100%',
          overflow: 'visible',
        }}
      >
        {hasLabBlockFraming(title, description, callToActions) && (
          <WidthCap contentWidth="L" style={{ overflow: 'visible' }}>
            <div
              style={{
                ...labBlockFramingIntroStackStyle,
                opacity: containerVisible ? 1 : 0,
                transform: 'translateY(0)',
                transition: titleTransition,
              }}
            >
              {title && (
                <Headline
                  size={getHeadlineSize(level)}
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

        <WidthCap contentWidth={config.outerContentWidth} style={{ overflow: 'visible' }}>
          <div
            className="card-block-carousel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: config.gap,
              width: '100%',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: config.buttonsPlacement === 'bottom' ? 'column' : 'row',
                alignItems: config.buttonsPlacement === 'bottom' ? 'stretch' : 'flex-start',
                gap: buttonGap,
              }}
            >
              {config.buttonsPlacement === 'side' && (
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: buttonMediaCenterOffset,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <NavButton
                    direction="left"
                    disabled={!canScrollLeft}
                    onPress={() => scroll('left')}
                    size={navButtonSize}
                    surface={emphasis}
                  />
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent:
                    config.buttonsPlacement === 'bottom' && isLargeLayout
                      ? 'center'
                      : config.useFixedCardWidth
                        ? 'flex-start'
                        : 'center',
                  alignItems: 'stretch',
                  minWidth: config.buttonsPlacement === 'bottom' ? undefined : 0,
                  overflowX: 'visible',
                  overflowY: 'visible',
                }}
              >
                <div ref={cardAreaRef} style={cardAreaStyle}>
                  <div
                    ref={trackRef}
                    style={trackStyle}
                    onTransitionEnd={isLargeLayout ? handleLargeTransitionEnd : undefined}
                  >
                    {displayItems.map((item, i) => {
                      if (isLargeLayout) {
                        const bufferCenter = largeCenterIndex + 1
                        const isInView = i === bufferCenter
                        const largeAspectRatio = cardSize === 'large' ? config.getEffectiveAspectRatio('2:1') : '4:5'
                        const opacity = prefersReducedMotion ? 1 : (i === bufferCenter ? 1 : CAROUSEL_FADED_OPACITY)
                        return (
                          <div
                            key={i}
                            className="carousel-card"
                            style={{
                              flex: `0 0 ${config.getCardWidthCss(1)}`,
                              minWidth: 0,
                              minHeight: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'visible',
                              opacity,
                              transform: 'translateY(0)',
                              transition: isWrapping ? 'none' : fadeTransition,
                            }}
                          >
                            {item.cardType === 'text-on-colour' ? (
                              <TextOnColourCard
                                title={item.title}
                                description={item.description}
                                surface="bold"
                                size="large"
                                aspectRatio={largeAspectRatio === '2:1' ? '8:5' : '4:5'}
                                inView={isInView}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            ) : (
                              <MediaCard
                                title={item.title}
                                description={item.description}
                                image={
                                  item.imageSlot && images?.[item.imageSlot]?.ready
                                    ? images[item.imageSlot].url
                                    : item.image
                                }
                                video={item.video}
                                link={item.link}
                                ctaText={item.ctaText}
                                aspectRatio="2:1"
                                prefersReducedMotion={prefersReducedMotion}
                                videoPaused={!isInView}
                                inView={isInView}
                                config={{ layout: effectiveCardLayout, imageHeight4_5: config.getImageHeight4_5() }}
                                imageState={item.imageSlot ? images?.[item.imageSlot] : undefined}
                                imageSlot={item.imageSlot}
                              />
                            )}
                          </div>
                        )
                      }

                      const slots = config.getSlots(item.aspectRatio)
                      const effectiveAspectRatio = config.getEffectiveAspectRatio(item.aspectRatio ?? '4:5')
                      const inView = isCardInView(i)
                      const textCardAspectRatio =
                        effectiveAspectRatio === '8:5' || effectiveAspectRatio === '2:1' ? '8:5' : '4:5'
                      const inGrid = noFade || isCardInView(i)
                      const useFadeTransition = isDesktop

                      return (
                        <div
                          key={i}
                          className="carousel-card"
                          style={{
                            flex: `0 0 ${config.getCardWidthCss(slots)}`,
                            minWidth: 0,
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'visible',
                            opacity: inGrid ? 1 : CAROUSEL_FADED_OPACITY,
                            transform: 'translateY(0)',
                            transition: useFadeTransition ? fadeTransition : cardTransition,
                          }}
                        >
                          {item.cardType === 'text-on-colour' ? (
                            <TextOnColourCard
                              title={item.title}
                              description={item.description}
                              surface="bold"
                              size={cardSize === 'medium' ? 'large' : 'compact'}
                              titleFontSize={
                                cardSize === 'medium' && textCardAspectRatio === '4:5' ? TYPOGRAPHY.h3 : undefined
                              }
                              aspectRatio={textCardAspectRatio}
                              inView={inView}
                              prefersReducedMotion={prefersReducedMotion}
                            />
                          ) : (
                            <MediaCard
                              title={item.title}
                              description={item.description}
                              image={
                                item.imageSlot && images?.[item.imageSlot]?.ready
                                  ? images[item.imageSlot].url
                                  : item.image
                              }
                              video={item.video}
                              link={item.link}
                              ctaText={item.ctaText}
                              aspectRatio={item.aspectRatio}
                              prefersReducedMotion={prefersReducedMotion}
                              videoPaused={!isCardInView(i)}
                              inView={inView}
                              config={{
                                layout: 'compact',
                                imageHeight4_5: config.getImageHeight4_5(),
                                ...(config.getImageHeight8_5 && { imageHeight8_5: config.getImageHeight8_5() }),
                              }}
                              imageState={item.imageSlot ? images?.[item.imageSlot] : undefined}
                              imageSlot={item.imageSlot}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {config.buttonsPlacement === 'side' && (
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: buttonMediaCenterOffset,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <NavButton
                    direction="right"
                    disabled={!canScrollRight}
                    onPress={() => scroll('right')}
                    size={navButtonSize}
                    surface={emphasis}
                  />
                </div>
              )}

              {config.buttonsPlacement === 'bottom' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: buttonGap }}>
                  <NavButton
                    direction="left"
                    disabled={!canScrollLeft}
                    onPress={() => scroll('left')}
                    size={navButtonSize}
                    surface={emphasis}
                  />
                  <NavButton
                    direction="right"
                    disabled={!canScrollRight}
                    onPress={() => scroll('right')}
                    size={navButtonSize}
                    surface={emphasis}
                  />
                </div>
              )}
            </div>
          </div>
        </WidthCap>
      </div>
    </Grid>
  )
}
