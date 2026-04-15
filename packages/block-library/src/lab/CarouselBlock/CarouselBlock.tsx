'use client'

/**
 * CarouselBlock — Lab carousel. All cards overflow (visible).
 *
 * Per lib/blocks/layout-rules.md (Carousel section). WidthCap only. Cards overflow the viewport.
 */

import { useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Text, Label, Button, Icon, IcChevronLeft, IcChevronRight } from '@marcelinodzn/ds-react'
import { getHeadlineSize, normalizeHeadingLevel } from '@design2code/ds'
import { useGridBreakpoint, getBreakpointName } from '@design2code/ds'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap } from '../../production/WidthCap'
import { useCarouselReveal } from '@design2code/ds'
import { CardRenderer, type CardItem, type CardSurface } from '../CardRenderer'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingEyebrowStyle,
  labBlockFramingIntroStackStyle,
  labBlockFramingTitleStyle,
} from '../../lab-utils/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../lab-utils/has-lab-block-framing'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
import type { BlockInteraction } from '../../production/CardGridBlock/CardGridBlock.types'

type CarouselItem = CardItem

type CarouselCardSize = 'compact' | 'medium' | 'large'

type CarouselEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'

type CarouselAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type CarouselBlockProps = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  headingAlignment?: 'left' | 'center'
  callToActions?: { label: string; link?: string | null; style?: 'filled' | 'outlined' | null }[] | null
  interaction?: BlockInteraction
  cardSurface?: CardSurface
  cardSize?: CarouselCardSize
  emphasis?: CarouselEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: CarouselAppearance
  items?: CarouselItem[] | null
  images?: Record<string, import('../../shared/image-slot-state').ImageSlotState>
}

const GAP_MOBILE = 'var(--ds-spacing-m)'
const GAP_DESKTOP = 'var(--ds-spacing-l)'
/** Faded opacity for cards outside viewport. DS has no opacity token for this. */
const CAROUSEL_FADED_OPACITY = 0.25

/** Subpixel / rounding tolerance for scroll bounds and “next/prev changes position?”. */
const SCROLL_EPS = 2

/**
 * Large carousel track is [last, ...items, first, second]. Map slide index → items_.index for stagger `isVisible`.
 */
function logicalItemIndexForLargeTrack(i: number, n: number): number {
  if (n <= 0) return 0
  if (i === 0) return n - 1
  if (i >= 1 && i <= n) return i - 1
  if (i === n + 1) return 0
  if (i === n + 2) return 1
  return 0
}

/** Fixed card widths (px) when useFixedCardWidth: mobile/tablet breakpoints. */
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
  gridValues: { columnWidth: number; gutter: number }
): CarouselConfig {
  const breakpoint: Breakpoint = getBreakpointName(columns)
  const spanDefault = columns === 12 ? 10 : columns === 8 ? 6 : 4
  const defaultPx = spanDefault * gridValues.columnWidth + (spanDefault - 1) * gridValues.gutter

  if (breakpoint === 'mobile') {
    const cardPx = CARD_WIDTH_MOBILE_PX
    const g = gridValues.gutter
    const isLarge = cardSize === 'large'
    // Large on mobile: 1 card over 4 columns, minus the gaps on each side. [gap][card][gap]
    const largeCardWidthCss = `calc(100cqw - 2 * ${GAP_MOBILE})`
    const largeGap = GAP_MOBILE
    return {
      breakpoint: 'mobile',
      cols: 1,
      buttonsPlacement: 'bottom',
      outerContentWidth: 'L',
      gap: isLarge ? largeGap : GAP_MOBILE,
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

export function CarouselBlock({
  eyebrow,
  title,
  description,
  headingAlignment = 'center',
  callToActions,
  interaction = 'information',
  cardSurface,
  cardSize = 'medium',
  emphasis = 'ghost',
  items,
  images,
}: CarouselBlockProps) {
  const router = useRouter()
  const level = normalizeHeadingLevel('h2')
  const { columns, contentMaxL, columnWidth, gutter, isMobile, isTablet } = useGridBreakpoint()

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

  const items_ = items?.filter((i) => i?.title || i?.image || i?.video || i?.backgroundColor) ?? []
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

  const { ref: revealRef, isVisible, containerVisible, prefersReducedMotion } = useCarouselReveal(items_.length)
  if (items_.length === 0) return null
  if (isLargeLayout && items_.length < LARGE_VISIBLE) return null

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
        // Cumulative scroll per card. cum[i] = scroll to show card i at left.
        // Only add gap between cards (n-1 gaps for n cards), not after the last.
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
        // maxScroll: use cum[n] as track width (sum(cards) + (n-1)*gap) so we don't over-scroll.
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
      // Large: circular, animate through wrap (to n or -1) then reset on transition end
      setLargeCenterIndex((i) => (dir === 'right' ? i + 1 : i - 1))
    }
  }

  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  /**
   * Compact (cols === 3): visibility from pixel overlap only — card widths vary (4:5 vs 8:5).
   * Do not use an index window (pageIdx … pageIdx+2): with mixed widths, three indices are not
   * the same as “three cards in the viewport”, so the trailing card could stay full opacity when
   * it should be faded.
   * Last card: right edge is cum[n] (no gap after the final card); subtracting trackGapPx was wrong.
   */
  const isCardInView = (i: number) => {
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
    return i >= pageIdx && i < pageIdx + config.cols
  }

  const titleTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)
  /** Staggered in-view entrance + scroll-driven opacity (same curve as other lab blocks). */
  const cardEntranceTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)

  /** Vertically center nav buttons on media: marginTop = half media height − gap. Large (2:1): height = contentMax/2. Medium/Compact (4:5): half height = cardWidth × 5/8; cardWidth = (contentMax − gaps) / cols. */
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
        {hasLabBlockFraming(title, description, callToActions, eyebrow) && (
          <WidthCap contentWidth="L" style={{ overflow: 'visible' }}>
            <div
              style={{
                ...labBlockFramingIntroStackStyle,
                alignItems: headingAlignment === 'left' ? 'flex-start' : 'center',
                opacity: containerVisible ? 1 : 0,
                transform: containerVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                transition: titleTransition,
              }}
            >
              {eyebrow && (
                <Label
                  size="M"
                  color="medium"
                  weight="low"
                  align={headingAlignment}
                  style={labBlockFramingEyebrowStyle}
                >
                  {eyebrow}
                </Label>
              )}
              {title && (
                <Headline
                  size={getHeadlineSize(level)}
                  as={level}
                  align={headingAlignment}
                  {...labHeadlinePresets.block}
                  style={labBlockFramingTitleStyle(isMobile)}
                >
                  {title}
                </Headline>
              )}
              {description && (
                <Text as="p" align={headingAlignment} {...labTextPresets.framingIntro} style={labBlockFramingDescriptionStyle}>
                  {description}
                </Text>
              )}
              {callToActions?.filter((a) => a?.label?.trim()).length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: headingAlignment === 'left' ? 'flex-start' : 'center', gap: 'var(--ds-spacing-m)' }}>
                  {callToActions.filter((a) => a.label.trim()).map((a) => (
                    <Button
                      key={a.label}
                      appearance={a.style === 'outlined' ? 'secondary' : 'primary'}
                      size="M"
                      attention="high"
                      onPress={() => {
                        const h = (a.link ?? '').trim()
                        if (!h) return
                        if (h.startsWith('/')) router.push(h)
                        else window.location.href = h
                      }}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              ) : null}
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
                        const logicalIdx = logicalItemIndexForLargeTrack(i, largeN)
                        const revealed = prefersReducedMotion || isVisible(logicalIdx)
                        const scrollTargetOpacity = prefersReducedMotion ? 1 : (i === bufferCenter ? 1 : CAROUSEL_FADED_OPACITY)
                        const opacity = revealed ? scrollTargetOpacity : 0
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
                              transform: revealed ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                              transition: isWrapping || prefersReducedMotion ? 'none' : cardEntranceTransition,
                            }}
                          >
                            <CardRenderer
                              item={item}
                              prefersReducedMotion={prefersReducedMotion}
                              context="carousel"
                              interaction={interaction}
                              cardSurface={cardSurface}
                              emphasis={emphasis}
                              aspectRatio={largeAspectRatio}
                              mediaConfig={{
                                layout: effectiveCardLayout,
                                imageHeight4_5: config.getImageHeight4_5(),
                                ...(config.getImageHeight8_5 && { imageHeight8_5: config.getImageHeight8_5() }),
                              }}
                              videoPaused={!isInView}
                              inView={isInView}
                              imageState={item.imageSlot ? images?.[item.imageSlot] : undefined}
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
                      const revealed = prefersReducedMotion || isVisible(i)
                      const scrollTargetOpacity = inGrid ? 1 : CAROUSEL_FADED_OPACITY
                      const opacity = revealed ? scrollTargetOpacity : 0

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
                            opacity,
                            transform: revealed ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                            transition: cardEntranceTransition,
                          }}
                        >
                          <CardRenderer
                            item={item}
                            prefersReducedMotion={prefersReducedMotion}
                            context="carousel"
                            interaction={interaction}
                            cardSurface={cardSurface}
                            emphasis={emphasis}
                            aspectRatio={
                              item.cardType?.startsWith('colour') ? textCardAspectRatio : effectiveAspectRatio
                            }
                            mediaConfig={{
                              layout: effectiveCardLayout,
                              imageHeight4_5: config.getImageHeight4_5(),
                              ...(config.getImageHeight8_5 && { imageHeight8_5: config.getImageHeight8_5() }),
                            }}
                            videoPaused={!isCardInView(i)}
                            inView={inView}
                            imageState={item.imageSlot ? images?.[item.imageSlot] : undefined}
                          />
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
