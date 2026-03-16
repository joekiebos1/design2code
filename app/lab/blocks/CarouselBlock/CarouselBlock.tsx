'use client'

/**
 * LabCarouselBlock — Lab carousel. All cards overflow (visible).
 *
 * Per lib/blocks/layout-rules.md (Carousel section). WidthCap only. Cards overflow the viewport.
 */

import { useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Button, Icon, IcChevronLeft, IcChevronRight } from '@marcelinodzn/ds-react'
import { getHeadlineSize, normalizeHeadingLevel, TYPOGRAPHY } from '../../../../lib/utils/semantic-headline'
import { useGridBreakpoint, getBreakpointName } from '../../../../lib/utils/use-grid-breakpoint'
import { WidthCap } from '../../../blocks/WidthCap'
import { useCarouselReveal } from '../../../../lib/utils/use-carousel-reveal'
import { MediaCard, TextOnColourCard } from '../../../components/blocks/Cards'

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

type CarouselSurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type LabCarouselBlockProps = {
  title?: string | null
  cardSize?: CarouselCardSize
  emphasis?: CarouselEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  surfaceColour?: CarouselSurfaceColour
  items?: CarouselItem[] | null
  images?: Record<string, { url: string; alt: string; source: 'database' | 'generated'; ready: boolean }>
}

const GAP_MOBILE = 'var(--ds-spacing-m)'
const GAP_DESKTOP = 'var(--ds-spacing-l)'
/** Faded opacity for cards outside viewport. DS has no opacity token for this. */
const CAROUSEL_FADED_OPACITY = 0.25

/** Fixed card widths (px) when useFixedCardWidth: mobile/tablet breakpoints. */
const CARD_WIDTH_MOBILE_PX = 280
const CARD_WIDTH_COMPACT_TABLET_PX = 360
const CARD_WIDTH_MEDIUM_TABLET_PX = 550

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

type CarouselConfig = {
  breakpoint: Breakpoint
  cols: number
  buttonsPlacement: 'side' | 'bottom'
  outerContentWidth: 'Default' | 'Wide'
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
  gridValues: { columnWidth: number; gutter: number }
): CarouselConfig {
  const breakpoint: Breakpoint = getBreakpointName(columns)
  const spanDefault = columns === 12 ? 10 : columns === 8 ? 6 : 4
  const defaultPx = spanDefault * gridValues.columnWidth + (spanDefault - 1) * gridValues.gutter

  if (breakpoint === 'mobile') {
    const cardPx = CARD_WIDTH_MOBILE_PX
    const g = gridValues.gutter
    return {
      breakpoint: 'mobile',
      cols: 1,
      buttonsPlacement: 'bottom',
      outerContentWidth: 'Default',
      gap: GAP_MOBILE,
      useFixedCardWidth: true,
      getCardWidthCss: (slots) => (slots === 1 ? `${cardPx}px` : `${cardPx * 2 + g}px`),
      getImageHeight4_5: () => `${cardPx * (5 / 4)}px`,
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
      outerContentWidth: 'Default',
      gap: GAP_MOBILE,
      useFixedCardWidth: true,
      getCardWidthCss: (slots) => (slots === 1 ? `${cardPx}px` : `${cardPx * 2 + g}px`),
      getImageHeight4_5: () => `${cardPx * (5 / 4)}px`,
      getSlots: (ratio) =>
        isMedium ? 1 : ratio === '8:5' ? 2 : 1,
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
    outerContentWidth: isLarge ? 'Wide' : 'Default',
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

export function LabCarouselBlock({
  title,
  cardSize = 'medium',
  emphasis = 'ghost',
  items,
  images,
}: LabCarouselBlockProps) {
  const level = normalizeHeadingLevel('h2')
  const { columns, contentMaxDefault, columnWidth, gutter, isMobile, isTablet, isDesktop } = useGridBreakpoint()

  const config = cardSize ? getCarouselConfig(cardSize, columns, { columnWidth, gutter }) : undefined
  if (!config || !cardSize) return null

  const trackRef = useRef<HTMLDivElement>(null)
  const cardAreaRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
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
  const capScrollAtGrid = (cardSize === 'compact' || cardSize === 'medium')

  // Large: circular buffer [last, ...items, first, second] for smooth forward wrap. n-1, n, n+1 visible; n-1 and n+1 faded.
  const LARGE_VISIBLE = 3
  const largeItems = items_.length >= LARGE_VISIBLE ? items_ : []
  const largeN = largeItems.length
  const largeDisplayItems =
    largeN > 0
      ? [
          largeItems[largeN - 1],
          ...largeItems,
          largeItems[0],
          largeItems[1],
        ]
      : []
  const [largeCenterIndex, setLargeCenterIndex] = useState(0)
  useEffect(() => {
    if (isLargeLayout && largeN > 0) setLargeCenterIndex(0)
  }, [isLargeLayout, largeN])
  const displayItems = isLargeLayout ? largeDisplayItems : items_

  const { ref: revealRef, containerVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  if (items_.length === 0) return null
  if (isLargeLayout && items_.length < LARGE_VISIBLE) return null

  // Compact/Medium: stop when last card is in view. Desktop medium only: use n - cols (cards align with grid, in view sooner).
  // Compact and tablet/mobile: n - cols + 1 to avoid skipping a card.
  const isMediumDesktop = isDesktop && config.cols === 2
  const maxPage = isMediumDesktop
    ? Math.max(0, items_.length - config.cols)
    : Math.max(0, Math.min(items_.length - 1, items_.length - config.cols + 1))
  const pageIdx = isLargeLayout ? largeCenterIndex : pageIndex
  const capScrollPos =
    pageIndex >= maxPage
      ? maxScrollPx
      : (cumulativeScrollPx[pageIndex] ?? pageIndex * stepPx)
  const scrollPosition = capScrollAtGrid
    ? Math.min(capScrollPos, maxScrollPx)
    : Math.max(0, (largeCenterIndex + 1) * stepPx)

  scrollPositionRef.current = scrollPosition

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
        // Cumulative scroll per card (one card at a time, different for 4:5 vs 8:5)
        const cum: number[] = [0]
        const gap = Number.isFinite(gapPx) ? gapPx : 0
        for (let i = 0; i < track.children.length; i++) {
          const el = track.children[i] as HTMLElement
          cum.push(cum[i] + el.offsetWidth + gap)
        }
        setCumulativeScrollPx(cum)
        const trackWidth = track.scrollWidth
        const viewportWidth = cardArea.clientWidth || cardArea.offsetWidth
        setViewportWidthPx(viewportWidth)
        const maxScroll = trackWidth - viewportWidth
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
    if (capScrollAtGrid) setPageIndex((p) => Math.min(p, maxPage))
  }, [capScrollAtGrid, maxPage])

  const handleLargeTransitionEnd = (e: React.TransitionEvent) => {
    if (!isLargeLayout || e.target !== e.currentTarget) return
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

  const canScrollLeft = isLargeLayout ? true : pageIndex > 0
  const canScrollRight = isLargeLayout ? true : pageIndex < maxPage

  const scroll = (dir: 'left' | 'right') => {
    if (capScrollAtGrid) {
      if (dir === 'right') {
        setPageIndex((p) => Math.min(maxPage, p + 1))
      } else {
        setPageIndex((p) => Math.max(0, p - 1))
      }
    } else {
      // Large: circular, animate through wrap (to n or -1) then reset on transition end
      setLargeCenterIndex((i) => (dir === 'right' ? i + 1 : i - 1))
    }
  }

  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  // Compact: pixel-based (variable card widths). Medium/Large: index-based.
  const isCardInView = (i: number) => {
    if (config.cols === 3 && cumulativeScrollPx.length > i + 1 && viewportWidthPx > 0) {
      const cardLeft = cumulativeScrollPx[i]
      const cardRight = cumulativeScrollPx[i + 1] - trackGapPx
      const vpLeft = scrollPosition
      const vpRight = scrollPosition + viewportWidthPx
      return cardLeft < vpRight && cardRight > vpLeft
    }
    return i >= pageIdx && i < pageIdx + config.cols
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

  /** Vertically center nav buttons on media: marginTop = half media height − gap. Large (2:1): height = contentMax/2. Medium/Compact (4:5): half height = cardWidth × 5/8; cardWidth = (contentMax − gaps) / cols. */
  const buttonMediaCenterOffset =
    config.cols === 1
      ? `calc(${contentMaxDefault} / 4 - ${config.gap})`
      : config.cols === 2
        ? `calc((${contentMaxDefault} - ${config.gap}) * 5 / 16 - ${config.gap})`
        : `calc((${contentMaxDefault} - 2 * ${config.gap}) * 5 / 24 - ${config.gap})`

  const noFade = isMobile || isTablet
  const titleCarouselGap =
    isMobile || config.breakpoint === 'tablet' ? 'var(--ds-spacing-2xl)' : 'var(--ds-spacing-3xl)'
  const buttonGap = isMobile ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-l)'
  const navButtonSize =
    isLargeLayout && config.buttonsPlacement === 'bottom' ? 'M' : isMobile ? 'S' : 'M'
  const titleFontSize = isMobile ? TYPOGRAPHY.h3 : TYPOGRAPHY.h2

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
    width: config.useFixedCardWidth ? '100%' : contentMaxDefault,
    maxWidth: contentMaxDefault,
    minWidth: 0,
    containerType: config.useFixedCardWidth ? undefined : 'inline-size',
    marginInline: 'auto',
    overflow: 'visible',
  }

  return (
    <WidthCap
          as="section"
          contentWidth={config.outerContentWidth}
          style={{ overflow: 'visible' }}
        >
        <div
          ref={revealRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: titleCarouselGap,
            width: '100%',
            overflow: 'visible',
          }}
        >
          {title && (
            <WidthCap contentWidth="Default">
              <Headline
                size={getHeadlineSize(level)}
                weight="high"
                as={level}
                align="center"
                style={{
                  margin: 0,
                  fontSize: titleFontSize,
                  whiteSpace: 'pre-line',
                  opacity: containerVisible ? 1 : 0,
                  transform: 'translateY(0)',
                  transition: titleTransition,
                }}
              >
                {title}
              </Headline>
            </WidthCap>
          )}

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
                        const largeAspectRatio = cardSize === 'large' ? '2:1' : '4:5'
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
                            <MediaCard
                              title={item.title}
                              description={item.description}
                              image={
                                images?.[item.imageSlot!]?.ready
                                  ? images[item.imageSlot!].url
                                  : item.image
                              }
                              video={item.video}
                              link={item.link}
                              ctaText={item.ctaText}
                              aspectRatio={largeAspectRatio}
                              prefersReducedMotion={prefersReducedMotion}
                              videoPaused={!isInView}
                              inView={isInView}
                              config={{
                                layout: effectiveCardLayout,
                                imageHeight4_5: config.getImageHeight4_5(),
                                ...(config.getImageHeight8_5 && { imageHeight8_5: config.getImageHeight8_5() }),
                              }}
                              imageState={item.imageSlot ? images?.[item.imageSlot] : undefined}
                              imageSlot={item.imageSlot}
                            />
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
                              size={effectiveCardLayout === 'medium' ? 'large' : 'compact'}
                              titleFontSize={
                                effectiveCardLayout === 'medium' && textCardAspectRatio === '4:5'
                                  ? TYPOGRAPHY.h3
                                  : undefined
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
                              aspectRatio={effectiveAspectRatio}
                              prefersReducedMotion={prefersReducedMotion}
                              videoPaused={!isCardInView(i)}
                              inView={inView}
                              config={{
                                layout: effectiveCardLayout,
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
        </div>
      </WidthCap>
  )
}
